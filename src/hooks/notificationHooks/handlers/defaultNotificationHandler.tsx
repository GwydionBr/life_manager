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

import { Group, Text } from "@mantine/core";

/**
 * Default/fallback handler for notifications without a specific handler.
 * Provides basic notification display functionality.
 */
export class DefaultNotificationHandler implements NotificationHandler {
  id = "default-handler";
  resourceType = null; // null indicates this is a fallback handler

  getToastConfig(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): NotificationToastConfig | null {
    const isHighPriority = notification.priority === "high";

    return {
      id: notification.id,
      title: (
        <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
          <Text fw={600} lineClamp={1}>
            {notification.title || "Notification"}
          </Text>
        </Group>
      ),
      message: notification.body ? (
        <Text size="sm" c="dimmed">
          {notification.body}
        </Text>
      ) : null,
      color: getNotificationColor(notification.type),
      icon: getNotificationIcon(notification.type),
      autoClose: isHighPriority ? false : 3000,
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
    // Only show browser notifications for high and medium priority
    if (notification.priority === "low") {
      return null;
    }

    return {
      title: notification.title || "Notification",
      body: notification.body || undefined,
      icon: "/favicon-96x96.png",
      tag: notification.id,
      requireInteraction: notification.priority === "high",
    };
  }

  handleClick(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): void {
    // Mark as read
    context.markAsRead(notification.id);

    // Hide the toast
    context.hideToast(notification.id);

    // Note: We don't navigate anywhere for default notifications
    // since we don't know where they should go.
    // Specific handlers can override this behavior.
  }
}

/**
 * Factory function to create a default notification handler
 *
 * @returns DefaultNotificationHandler instance
 */
export const createDefaultNotificationHandler =
  (): DefaultNotificationHandler => {
    return new DefaultNotificationHandler();
  };
