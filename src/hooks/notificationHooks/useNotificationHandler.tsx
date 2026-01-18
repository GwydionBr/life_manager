import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useAppointmentNotifications } from "@/hooks/notificationHooks/useAppointmentNotifications";
import { useRouter } from "@tanstack/react-router";
import { useNotifications } from "@/db/collections/notification/use-notification-query";
import { useNotificationMutations } from "@/db/collections/notification/use-notification-mutations";
import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useSettingsStore } from "@/stores/settingsStore";

import { notifications } from "@mantine/notifications";
import { isBrowserNotificationSupported } from "@/utils/notification";
import {
  notificationHandlerRegistry,
  createAppointmentNotificationHandler,
  createDefaultNotificationHandler,
  type NotificationHandlerContext,
} from "@/hooks/notificationHooks/handlers";

import { type Notification as NotificationData } from "@/types/system.types";

// Check interval for scheduled notifications (10 seconds)
const CHECK_INTERVAL = 1000 * 10;

/**
 * Central hook for handling and displaying all notifications.
 *
 * This hook monitors notifications from the database and displays
 * them as toast notifications when their scheduled_for time is reached. It handles:
 * - Checking for notifications whose scheduled_for time has passed
 * - Displaying notifications as toasts using registered handlers
 * - High priority notifications don't auto-close
 * - Medium/low priority notifications auto-close after 3 seconds
 * - Marking notifications as read when interacted with
 * - Navigation to related resources on click (via handlers)
 * - Browser/system notifications when page is not visible (via handlers)
 *
 * The hook uses a handler registry system where specific handlers can be registered
 * for different resource types (e.g., appointments, tasks, etc.)
 *
 * Should be called once at the app level (e.g., in Shell.tsx)
 */
export function useNotificationHandler() {
  const { handleStartTimerFromNotification } = useAppointmentNotifications();
  const { data: allNotifications } = useNotifications();
  const router = useRouter();
  const { updateNotification, markAsRead } = useNotificationMutations();
  const { browserNotificationsEnabled } = useSettingsStore();
  const { data: appointments } = useAppointments();
  const { data: projects } = useWorkProjects();

  const { getLocalizedText } = useIntl();

  // Initialize handlers once
  const handlersInitialized = useRef(false);
  useEffect(() => {
    if (handlersInitialized.current) return;

    // Register appointment handler
    notificationHandlerRegistry.register(
      createAppointmentNotificationHandler(handleStartTimerFromNotification)
    );

    // Register default/fallback handler
    notificationHandlerRegistry.register(createDefaultNotificationHandler());

    handlersInitialized.current = true;

    // Cleanup on unmount
    return () => {
      notificationHandlerRegistry.clear();
      handlersInitialized.current = false;
    };
  }, [handleStartTimerFromNotification]);

  // Track which notifications we've already shown as toasts
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  // Track the current time for checking scheduled notifications
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toISOString()
  );

  // Create handler context that will be passed to all handlers
  const handlerContext: NotificationHandlerContext = useMemo(
    () => ({
      markAsRead: (notificationId: string) => markAsRead(notificationId),
      navigate: (options: { to: string }) => router.navigate(options),
      hideToast: (notificationId: string) => notifications.hide(notificationId),
      getLocalizedText,
      appointments,
      projects,
    }),
    [markAsRead, router, getLocalizedText, appointments, projects]
  );

  /**
   * Show a browser/system notification using the appropriate handler.
   */
  const showBrowserNotification = useCallback(
    (notification: NotificationData) => {
      if (!isBrowserNotificationSupported()) return;
      if (Notification.permission !== "granted") return;

      // Check if user has enabled browser notifications in settings
      if (!browserNotificationsEnabled) return;

      // Get the appropriate handler for this notification
      const handler = notificationHandlerRegistry.getHandler(notification);
      if (!handler) {
        console.warn(`No handler found for notification ${notification.id}`);
        return;
      }

      // Get browser notification config from handler
      const config = handler.getBrowserNotificationConfig(
        notification,
        handlerContext
      );
      if (!config) return; // Handler decided not to show browser notification

      // Create browser notification
      const browserNotification = new window.Notification(config.title, {
        body: config.body,
        icon: config.icon || "/favicon-96x96.png",
        tag: config.tag || notification.id,
        requireInteraction: config.requireInteraction,
      });

      // Handle click on browser notification
      browserNotification.onclick = () => {
        // Focus the window
        window.focus();

        // Hide in-app toast if not high priority
        if (notification.priority !== "high") {
          notifications.hide(notification.id);
        }

        // Mark as read
        updateNotification(notification.id, {
          read_at: new Date().toISOString(),
        });

        // Let handler handle the click (e.g., navigation)
        handler.handleClick(notification, handlerContext);

        // Close the browser notification
        browserNotification.close();
      };
    },
    [browserNotificationsEnabled, handlerContext, updateNotification]
  );

  /**
   * Show a toast notification using the appropriate handler.
   */
  const showNotificationToast = useCallback(
    (notification: NotificationData) => {
      // Get the appropriate handler for this notification
      const handler = notificationHandlerRegistry.getHandler(notification);
      if (!handler) {
        console.warn(`No handler found for notification ${notification.id}`);
        return;
      }

      // Get toast config from handler
      const config = handler.getToastConfig(notification, handlerContext);
      if (!config) {
        console.warn(
          `Handler ${handler.id} returned no toast config for notification ${notification.id}`
        );
        return;
      }

      // Show the toast with the config from the handler
      notifications.show(config);
    },
    [handlerContext]
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
