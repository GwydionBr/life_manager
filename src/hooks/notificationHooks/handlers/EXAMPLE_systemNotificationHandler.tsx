/**
 * EXAMPLE: System Notification Handler
 *
 * This is an example handler for system notifications (e.g., version updates, maintenance notices).
 * You can use this as a template for creating new handlers.
 *
 * To activate this handler:
 * 1. Rename this file to remove the "EXAMPLE_" prefix
 * 2. Update the export in index.ts
 * 3. Register it in useNotificationHandler.tsx
 */

import {
  type NotificationHandler,
  type NotificationHandlerContext,
  type NotificationToastConfig,
  type BrowserNotificationConfig,
} from "./types";
import { type Notification as NotificationData } from "@/types/system.types";
import {
  getNotificationColor,
  getNotificationIcon,
} from "@/lib/notificationHelper";

import { Group, Text, Anchor } from "@mantine/core";

/**
 * Handler for system-related notifications.
 * Handles notifications like system.version, system.maintenance, etc.
 */
export class SystemNotificationHandler implements NotificationHandler {
  id = "system-handler";
  resourceType = "system";

  getToastConfig(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): NotificationToastConfig | null {
    const isHighPriority = notification.priority === "high";
    const isVersionUpdate = notification.type === "system.version";

    return {
      id: notification.id,
      title: (
        <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
          <Text fw={600} lineClamp={1}>
            {notification.title || "System Notification"}
          </Text>
        </Group>
      ),
      message: (
        <>
          {notification.body && (
            <Text size="sm" c="dimmed" mb={isVersionUpdate ? "xs" : 0}>
              {notification.body}
            </Text>
          )}
          {isVersionUpdate && (
            <Anchor
              size="sm"
              href="https://github.com/yourrepo/releases"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {context.getLocalizedText(
                "Versionshinweise anzeigen",
                "View Release Notes"
              )}
            </Anchor>
          )}
        </>
      ),
      color: getNotificationColor(notification.type),
      icon: getNotificationIcon(notification.type),
      autoClose: isHighPriority ? false : 5000,
      withBorder: true,
      withCloseButton: true,
      position: "top-center",
      onClick: () => this.handleClick(notification, context),
    };
  }

  getBrowserNotificationConfig(
    notification: NotificationData,
    _context: NotificationHandlerContext
  ): BrowserNotificationConfig | null {
    // Only show browser notifications for high priority system notifications
    if (notification.priority !== "high") {
      return null;
    }

    return {
      title: notification.title || "System Notification",
      body: notification.body || undefined,
      icon: "/favicon-96x96.png",
      tag: notification.id,
      requireInteraction: true,
    };
  }

  handleClick(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): void {
    // Mark as read
    context.markAsRead(notification.id);

    // For version updates, could navigate to settings or changelog
    if (notification.type === "system.version") {
      context.navigate({ to: "/settings/about" });
    }

    // Hide the toast
    context.hideToast(notification.id);
  }
}

/**
 * Factory function to create a system notification handler
 *
 * @returns SystemNotificationHandler instance
 */
export const createSystemNotificationHandler =
  (): SystemNotificationHandler => {
    return new SystemNotificationHandler();
  };
