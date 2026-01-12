import { useEffect, useRef, useCallback } from "react";
import { useUpcomingAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useNotifications } from "@/db/collections/notification/use-notification-query";
import { addNotificationSilent } from "@/db/collections/notification/notification-mutations";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useIntl } from "@/hooks/useIntl";
import { Database } from "@/types/db.types";

type NotificationType = Database["public"]["Enums"]["notificationType"];

// Check interval for appointment notifications (30 seconds)
const CHECK_INTERVAL = 1000 * 30;

/**
 * Hook that monitors upcoming appointments and creates notifications
 * when reminders are due or appointments are starting.
 *
 * Creates persistent notifications in the database for offline support.
 * The actual display of notifications is handled by useNotificationHandler.
 */
export function useAppointmentNotifications() {
  const { data: upcomingAppointments } = useUpcomingAppointments();
  const { data: existingNotifications } = useNotifications();
  const { data: profile } = useProfile();
  const { getLocalizedText, formatDateTime } = useIntl();

  // Track which notifications we've already processed in this session
  // to avoid duplicate creation even if DB write is slow
  const processedRef = useRef<Set<string>>(new Set());

  /**
   * Check if a notification already exists for a given appointment and type.
   */
  const notificationExists = useCallback(
    (appointmentId: string, type: NotificationType): boolean => {
      if (!existingNotifications) return false;
      return existingNotifications.some(
        (n) => n.resource_id === appointmentId && n.type === type
      );
    },
    [existingNotifications]
  );

  /**
   * Create a notification for an appointment event.
   */
  const createAppointmentNotification = useCallback(
    async (
      appointmentId: string,
      appointmentTitle: string,
      type: NotificationType,
      scheduledTime: string
    ) => {
      if (!profile?.id) return;

      const notificationKey = `${appointmentId}-${type}`;

      // Skip if already processed in this session
      if (processedRef.current.has(notificationKey)) return;

      // Skip if notification already exists in database
      if (notificationExists(appointmentId, type)) return;

      // Mark as processed immediately to prevent duplicate processing
      processedRef.current.add(notificationKey);

      const isReminder = type === "appointment.reminder";
      const title = isReminder
        ? getLocalizedText("Terminerinnerung", "Appointment Reminder")
        : getLocalizedText("Termin beginnt", "Appointment Starting");

      const body = isReminder
        ? getLocalizedText(
            `"${appointmentTitle}" beginnt um ${formatDateTime(new Date(scheduledTime))}`,
            `"${appointmentTitle}" starts at ${formatDateTime(new Date(scheduledTime))}`
          )
        : getLocalizedText(
            `"${appointmentTitle}" beginnt jetzt`,
            `"${appointmentTitle}" is starting now`
          );

      // Create notification in database
      // The useNotificationHandler hook will handle displaying it
      try {
        await addNotificationSilent(
          {
            type,
            title,
            body,
            priority: isReminder ? "medium" : "high",
            resource_type: "appointment",
            resource_id: appointmentId,
            scheduled_for: scheduledTime,
          },
          profile.id
        );
      } catch (error) {
        console.error("Failed to create appointment notification:", error);
        // Remove from processed set so it can be retried
        processedRef.current.delete(notificationKey);
      }
    },
    [profile?.id, notificationExists, getLocalizedText, formatDateTime]
  );

  useEffect(() => {
    if (!profile?.id) return;

    const checkAppointments = () => {
      if (!upcomingAppointments) return;

      const now = new Date().toISOString();

      upcomingAppointments.forEach((appointment) => {
        // Check for reminder notification
        if (appointment.reminder && appointment.reminder <= now) {
          createAppointmentNotification(
            appointment.id,
            appointment.title,
            "appointment.reminder",
            appointment.start_date
          );
        }

        // Check for start notification
        if (appointment.start_date && appointment.start_date <= now) {
          createAppointmentNotification(
            appointment.id,
            appointment.title,
            "appointment.start",
            appointment.start_date
          );
        }
      });
    };

    // Check immediately on mount and when appointments change
    checkAppointments();

    // Set up interval for periodic checks
    const interval = setInterval(checkAppointments, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [upcomingAppointments, profile?.id, createAppointmentNotification]);
}
