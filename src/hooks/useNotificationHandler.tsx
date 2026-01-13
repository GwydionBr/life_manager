import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useRouter } from "@tanstack/react-router";
import { useNotifications } from "@/db/collections/notification/use-notification-query";
import { useNotificationMutations } from "@/db/collections/notification/use-notification-mutations";
import { type Notification as NotificationData } from "@/types/system.types";

import { notifications } from "@mantine/notifications";
import { Group, Text } from "@mantine/core";
import { IconBell, IconCalendar, IconAlertCircle } from "@tabler/icons-react";

// Check interval for scheduled notifications (10 seconds)
const CHECK_INTERVAL = 1000 * 10;

/**
 * Returns an icon component based on the notification type.
 */
const getNotificationIcon = (type: NotificationData["type"]) => {
  switch (type) {
    case "appointment.reminder":
      return <IconBell size={20} />;
    case "appointment.start":
      return <IconCalendar size={20} />;
    case "system.version":
      return <IconAlertCircle size={20} />;
    default:
      return <IconBell size={20} />;
  }
};

/**
 * Returns a color based on the notification type.
 */
const getNotificationColor = (type: NotificationData["type"]) => {
  switch (type) {
    case "appointment.reminder":
      return "blue";
    case "appointment.start":
      return "orange";
    case "system.version":
      return "yellow";
    default:
      return "blue";
  }
};

/**
 * Check if browser notifications are supported.
 */
const isBrowserNotificationSupported = (): boolean => {
  return "Notification" in window;
};

/**
 * Central hook for handling and displaying all notifications.
 *
 * This hook monitors notifications from the database and displays
 * them as toast notifications when their scheduled_for time is reached. It handles:
 * - Checking for notifications whose scheduled_for time has passed
 * - Displaying notifications as toasts
 * - High priority notifications don't auto-close
 * - Medium/low priority notifications auto-close after 3 seconds
 * - Marking notifications as read when interacted with
 * - Navigation to related resources on click
 * - Browser/system notifications when page is not visible (high priority only)
 *
 * Should be called once at the app level (e.g., in Shell.tsx)
 */
export function useNotificationHandler() {
  const { data: allNotifications } = useNotifications();
  const router = useRouter();
  const { updateNotification, markAsRead } = useNotificationMutations();

  // Track which notifications we've already shown as toasts
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  // Track the current time for checking scheduled notifications
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toISOString()
  );

  // Track browser notification permission
  const [browserPermission, setBrowserPermission] =
    useState<NotificationPermission>("default");

  // Request browser notification permission on mount
  useEffect(() => {
    if (!isBrowserNotificationSupported()) return;

    // Check current permission
    setBrowserPermission(Notification.permission);

    // Request permission if not yet granted or denied
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setBrowserPermission(permission);
      });
    }
  }, []);

  /**
   * Show a browser/system notification.
   * Only shows for high priority when permission is granted.
   */
  const showBrowserNotification = useCallback(
    (notification: NotificationData) => {
      if (!isBrowserNotificationSupported()) return;
      if (browserPermission !== "granted") return;

      // Only show browser notifications for high and medium priority
      if (notification.priority === "low") return;

      const browserNotification = new window.Notification(notification.title, {
        body: notification.body || undefined,
        icon: "/favicon-96x96.png",
        tag: notification.id, // Prevents duplicate notifications with same ID
        requireInteraction: notification.priority === "high", // High priority requires interaction
      });

      // Handle click on browser notification
      browserNotification.onclick = () => {
        // Focus the window
        window.focus();
        notifications.hide(notification.id);

        // Mark as read
        updateNotification(notification.id, {
          read_at: new Date().toISOString(),
        });

        // Navigate based on resource type
        if (notification.resource_type === "appointment") {
          router.navigate({ to: "/calendar" });
        }

        // Close the browser notification
        browserNotification.close();
      };
    },
    [browserPermission, router, updateNotification]
  );

  /**
   * Handle clicking on a notification - navigate to related resource.
   */
  const handleNotificationClick = useCallback(
    (notification: NotificationData) => {
      // Mark as read
      markAsRead(notification.id);

      // Navigate based on resource type
      if (notification.resource_type === "appointment") {
        router.navigate({ to: "/calendar" });
      }

      // Hide the toast
      notifications.hide(notification.id);
    },
    [router, markAsRead]
  );

  /**
   * Show a toast notification for a database notification.
   */
  const showNotificationToast = useCallback(
    (notification: NotificationData) => {
      const isHighPriority = notification.priority === "high";

      notifications.show({
        id: notification.id,
        title: (
          <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
            <Text fw={600} lineClamp={1}>
              {notification.title}
            </Text>
          </Group>
        ),
        message: notification.body && (
          <Text size="sm" c="dimmed">
            {notification.body}
          </Text>
        ),
        color: getNotificationColor(notification.type),
        icon: getNotificationIcon(notification.type),
        autoClose: isHighPriority ? false : 3000,
        withBorder: true,
        withCloseButton: true,
        position: "top-center",
        onClick: () => handleNotificationClick(notification),
      });
    },
    [handleNotificationClick]
  );

  // Set up interval to check for scheduled notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Get notifications that should be shown now
  const notificationsToShow = useMemo(() => {
    if (!allNotifications) return [];

    return allNotifications.filter((notification) => {
      // Skip if already read or dismissed
      if (notification.read_at || notification.dismissed_at) return false;

      // Skip if scheduled for the future
      if (
        notification.scheduled_for &&
        notification.scheduled_for > currentTime
      ) {
        return false;
      }

      // Skip if we've already shown this notification
      if (shownNotificationsRef.current.has(notification.id)) return false;

      return true;
    });
  }, [allNotifications, currentTime]);

  // Watch for notifications that should be shown and display them
  useEffect(() => {
    notificationsToShow.forEach((notification) => {
      // Mark as shown
      shownNotificationsRef.current.add(notification.id);

      // Show in-app toast notification
      showNotificationToast(notification);

      // Show browser notification
      showBrowserNotification(notification);
    });
  }, [notificationsToShow, showNotificationToast, showBrowserNotification]);

  // Clean up shown notifications set when notifications are dismissed/read
  useEffect(() => {
    if (!allNotifications) return;

    const activeNotificationIds = new Set(
      allNotifications
        .filter((n) => !n.read_at && !n.dismissed_at)
        .map((n) => n.id)
    );

    // Remove from shown set any notifications that are no longer active
    shownNotificationsRef.current.forEach((id) => {
      if (!activeNotificationIds.has(id)) {
        shownNotificationsRef.current.delete(id);
      }
    });
  }, [allNotifications]);
}

/**
 * Hook to manually request browser notification permission.
 * Can be used to show a permission request button in settings.
 */
export function useBrowserNotificationPermission() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const { getLocalizedText } = useIntl();

  useEffect(() => {
    if (isBrowserNotificationSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isBrowserNotificationSupported()) {
      return "denied" as NotificationPermission;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const isSupported = isBrowserNotificationSupported();

  const permissionText = (() => {
    if (!isSupported) {
      return getLocalizedText(
        "Browser unterstützt keine Benachrichtigungen",
        "Browser does not support notifications"
      );
    }
    switch (permission) {
      case "granted":
        return getLocalizedText(
          "Benachrichtigungen erlaubt",
          "Notifications allowed"
        );
      case "denied":
        return getLocalizedText(
          "Benachrichtigungen blockiert",
          "Notifications blocked"
        );
      default:
        return getLocalizedText(
          "Benachrichtigungen nicht konfiguriert",
          "Notifications not configured"
        );
    }
  })();

  return {
    permission,
    requestPermission,
    isSupported,
    permissionText,
  };
}
