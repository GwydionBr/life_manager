import {
  type NotificationHandler,
  type NotificationHandlerContext,
  type NotificationToastConfig,
  type BrowserNotificationConfig,
} from "./types";
import { type Notification as NotificationData } from "@/types/system.types";
import { canStartTimerFromAppointment } from "@/lib/appointmentTimerHelpers";
import {
  getNotificationColor,
  getNotificationIcon,
} from "@/lib/notificationHelper";

import { Group, Text, Button } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";

/**
 * Handler for appointment-related notifications.
 * Handles both appointment.reminder and appointment.start notifications.
 */
export class AppointmentNotificationHandler implements NotificationHandler {
  id = "appointment-handler";
  resourceType = "appointment";

  /**
   * Callback to handle starting a timer from a notification.
   * This is provided from the outside since it requires access to stores and mutations.
   */
  private onStartTimer?: (notification: NotificationData) => void;

  constructor(onStartTimer?: (notification: NotificationData) => void) {
    this.onStartTimer = onStartTimer;
  }

  getToastConfig(
    notification: NotificationData,
    context: NotificationHandlerContext
  ): NotificationToastConfig | null {
    const isHighPriority = notification.priority === "high";
    const isAppointmentStart = notification.type === "appointment.start";

    // Check if we should show timer button for appointment.start notifications
    const appointment = context.appointments?.find(
      (a) => a.id === notification.resource_id
    );
    const showTimerButton =
      isAppointmentStart &&
      appointment &&
      canStartTimerFromAppointment(appointment);

    return {
      id: notification.id,
      title: (
        <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
          <Text fw={600} lineClamp={1}>
            {notification.title}
          </Text>
        </Group>
      ),
      message: (
        <>
          {notification.body && (
            <Text size="sm" c="dimmed" mb={showTimerButton ? "xs" : 0}>
              {notification.body}
            </Text>
          )}
          {showTimerButton && this.onStartTimer && (
            <Button
              size="xs"
              variant="light"
              color="teal"
              leftSection={<IconPlayerPlay size={14} />}
              onClick={(e) => {
                e.stopPropagation(); // Prevent toast click handler from firing
                this.onStartTimer!(notification);
              }}
              mt="xs"
            >
              {context.getLocalizedText("Timer starten", "Start Timer")}
            </Button>
          )}
        </>
      ),
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
      title: notification.title || "Appointment Notification",
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

    // Navigate to calendar
    context.navigate({ to: "/calendar" });

    // Hide the toast
    context.hideToast(notification.id);
  }
}

/**
 * Factory function to create an appointment notification handler
 *
 * @param onStartTimer - Callback to handle starting a timer from a notification
 * @returns AppointmentNotificationHandler instance
 */
export const createAppointmentNotificationHandler = (
  onStartTimer?: (notification: NotificationData) => void
): AppointmentNotificationHandler => {
  return new AppointmentNotificationHandler(onStartTimer);
};
