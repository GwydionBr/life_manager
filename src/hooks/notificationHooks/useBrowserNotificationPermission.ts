import { useState, useEffect, useCallback } from "react";
import { useIntl } from "@/hooks/useIntl";
import { isBrowserNotificationSupported } from "@/utils/notification";

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
