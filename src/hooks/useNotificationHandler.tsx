import { useEffect, useRef, useCallback, useState } from "react";
import { useUnreadNotifications } from "@/db/collections/notification/use-notification-query";
import { updateNotification } from "@/db/collections/notification/notification-mutations";
import { useIntl } from "@/hooks/useIntl";
import { useRouter } from "@tanstack/react-router";
import { type Notification as NotificationData } from "@/types/system.types";

import { notifications } from "@mantine/notifications";
import { ActionIcon, Group, Text } from "@mantine/core";
import {
  IconBell,
  IconCalendar,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";

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
 * This hook monitors unread notifications from the database and displays
 * them as toast notifications. It handles:
 * - Displaying new notifications as toasts
 * - High priority notifications don't auto-close
 * - Medium/low priority notifications auto-close after 10 seconds
 * - Marking notifications as read when interacted with
 * - Navigation to related resources on click
 * - Browser/system notifications when page is not visible (high priority only)
 *
 * Should be called once at the app level (e.g., in Shell.tsx)
 */
export function useNotificationHandler() {
  const { data: unreadNotifications } = useUnreadNotifications();
  const { getLocalizedText } = useIntl();
  const router = useRouter();

  // Track which notifications we've already shown as toasts
  const shownNotificationsRef = useRef<Set<string>>(new Set());

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
      if (!isBrowserNotificationSupported()) {
        console.log("Browser notifications not supported");
        return;
      }
      if (browserPermission !== "granted") {
        console.log("Browser notifications not granted");
        return;
      }

      // Only show browser notifications for high and medium priority
      if (notification.priority === "low") {
        console.log("Notification is low priority");
        return;
      }

      console.log("Showing browser notification", notification);

      const browserNotification = new window.Notification(notification.title, {
        body: notification.body || undefined,
        icon: "/favicon-96x96.png",
        tag: notification.id, // Prevents duplicate notifications with same ID
        requireInteraction: notification.priority === "high", // High priority requires interaction
      });

      console.log("Browser notification", browserNotification);

      // Handle click on browser notification
      browserNotification.onclick = () => {
        // Focus the window
        window.focus();

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
    [browserPermission, router]
  );

  /**
   * Handle clicking on a notification - navigate to related resource.
   */
  const handleNotificationClick = useCallback(
    (notification: NotificationData) => {
      // Mark as read
      updateNotification(notification.id, {
        read_at: new Date().toISOString(),
      });

      // Navigate based on resource type
      if (notification.resource_type === "appointment") {
        router.navigate({ to: "/calendar" });
      }

      // Hide the toast
      notifications.hide(notification.id);
    },
    [router]
  );

  /**
   * Handle dismissing a notification.
   */
  const handleDismiss = useCallback((notificationId: string) => {
    updateNotification(notificationId, {
      dismissed_at: new Date().toISOString(),
    });
    notifications.hide(notificationId);
  }, []);

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
            {isHighPriority && (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(notification.id);
                }}
                aria-label={getLocalizedText("Schließen", "Dismiss")}
              >
                <IconX size={14} />
              </ActionIcon>
            )}
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
        withCloseButton: !isHighPriority,
        onClick: () => handleNotificationClick(notification),
        onClose: () => {
          // Mark as read when closed via close button (medium/low priority)
          if (!isHighPriority) {
            updateNotification(notification.id, {
              read_at: new Date().toISOString(),
            });
          }
        },
      });
    },
    [getLocalizedText, handleNotificationClick, handleDismiss]
  );

  // Watch for new unread notifications and show toasts
  useEffect(() => {
    if (!unreadNotifications) return;

    unreadNotifications.forEach((notification) => {
      // Skip if we've already shown this notification
      if (shownNotificationsRef.current.has(notification.id)) return;

      // Mark as shown
      shownNotificationsRef.current.add(notification.id);

      // Show in-app toast notification
      showNotificationToast(notification);

      // Show browser notification if page is not visible
      showBrowserNotification(notification);
    });
  }, [unreadNotifications, showNotificationToast, showBrowserNotification]);

  // Clean up shown notifications set when notifications are dismissed/read
  useEffect(() => {
    if (!unreadNotifications) return;

    const currentUnreadIds = new Set(unreadNotifications.map((n) => n.id));

    // Remove from shown set any notifications that are no longer unread
    shownNotificationsRef.current.forEach((id) => {
      if (!currentUnreadIds.has(id)) {
        shownNotificationsRef.current.delete(id);
      }
    });
  }, [unreadNotifications]);
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
