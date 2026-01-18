/**
 * Check if browser notifications are supported.
 */
export const isBrowserNotificationSupported = (): boolean => {
  return "Notification" in window;
};

/**
 * Request browser notification permission from the user.
 *
 * @returns Promise that resolves to the permission state
 */
export const requestBrowserNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (!isBrowserNotificationSupported()) {
      return "denied";
    }

    try {
      return await Notification.requestPermission();
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

/**
 * Get the current browser notification permission state.
 *
 * @returns The current permission state, or "denied" if not supported
 */
export const getBrowserNotificationPermission = (): NotificationPermission => {
  if (!isBrowserNotificationSupported()) {
    return "denied";
  }

  return Notification.permission;
};
