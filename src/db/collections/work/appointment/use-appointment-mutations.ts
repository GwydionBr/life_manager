import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useAppointments } from "./use-appointment-query";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/toastFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addAppointment,
  updateAppointment,
  deleteAppointment,
} from "./appointment-mutations";
import {
  InsertAppointment,
  UpdateAppointment,
  Appointment,
} from "@/types/work.types";
import { useNotificationMutations } from "@/db/collections/notification/use-notification-mutations";
import { useNotifications } from "@/db/collections/notification/use-notification-query";
import { NotificationType } from "@/types/workCalendar.types";

/**
 * Hook for Appointment operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Appointments with integrated error handling and notifications.
 * Also manages appointment-related system notifications (reminders and start notifications).
 *
 * @returns Object with mutation functions
 */
export const useAppointmentMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText, formatDateTime } = useIntl();
  const {
    addNotification,
    updateNotification,
    deleteNotification,
    findNotification,
  } = useNotificationMutations();
  const { data: existingNotifications } = useNotifications();
  const { data: appointments } = useAppointments();

  /**
   * Create or update a notification for an appointment event.
   */
  const syncAppointmentNotification = useCallback(
    async (
      appointmentId: string,
      appointmentTitle: string,
      type: NotificationType,
      scheduledTime: string,
      showNotification: boolean = false
    ): Promise<void> => {
      const isReminder = type === "appointment.reminder";
      const title = isReminder
        ? getLocalizedText("Terminerinnerung", "Appointment Reminder")
        : getLocalizedText("Termin beginnt", "Appointment Starting");

      const startTime = scheduledTime;
      const body = isReminder
        ? getLocalizedText(
            `"${appointmentTitle}" beginnt um ${formatDateTime(new Date(startTime))}`,
            `"${appointmentTitle}" starts at ${formatDateTime(new Date(startTime))}`
          )
        : getLocalizedText(
            `"${appointmentTitle}" beginnt jetzt`,
            `"${appointmentTitle}" is starting now`
          );

      // Check if notification already exists
      const existingNotification = findNotification(appointmentId, type);

      if (existingNotification) {
        // Update if scheduled_for changed
        if (existingNotification.scheduled_for !== scheduledTime) {
          try {
            await updateNotification(
              existingNotification.id,
              {
                scheduled_for: scheduledTime,
                title,
                body,
              },
              showNotification
            );
          } catch (error) {
            console.error("Failed to update appointment notification:", error);
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Aktualisieren der Terminerinnerung",
                "Error updating appointment reminder notification"
              )
            );
          }
        }
      } else {
        // Create new notification with scheduled_for
        try {
          await addNotification(
            {
              type,
              title,
              body,
              priority: isReminder ? "medium" : "high",
              resource_type: "appointment",
              resource_id: appointmentId,
              scheduled_for: scheduledTime,
            },
            showNotification
          );
        } catch (error) {
          console.error("Failed to create appointment notification:", error);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen der Terminerinnerung",
              "Error creating appointment reminder notification"
            )
          );
        }
      }
    },
    [
      findNotification,
      getLocalizedText,
      formatDateTime,
      addNotification,
      updateNotification,
    ]
  );

  /**
   * Delete all notifications for a given appointment.
   */
  const deleteAppointmentNotifications = useCallback(
    async (
      appointmentId: string,
      showNotification: boolean = false
    ): Promise<void> => {
      if (!existingNotifications) return;

      const notificationsToDelete = existingNotifications.filter(
        (n) => n.resource_id === appointmentId
      );

      for (const notification of notificationsToDelete) {
        try {
          await deleteNotification(notification.id, showNotification);
        } catch (error) {
          console.error(
            "Failed to delete appointment notification:",
            notification.id,
            error
          );
        }
      }
    },
    [existingNotifications, deleteNotification]
  );

  /**
   * Adds a new Appointment with automatic notification.
   * Also creates appointment notifications (reminder and start).
   */
  const handleAddAppointment = useCallback(
    async (
      newAppointment: InsertAppointment,
      showNotification: boolean = false
    ): Promise<Appointment | undefined> => {
      if (!profile?.id) {
        console.error("No profile found");
        showActionErrorNotification(
          getLocalizedText(
            "Kein Benutzerprofil gefunden",
            "No user profile found"
          )
        );
        return;
      }

      try {
        if (
          newAppointment.start_date &&
          newAppointment.start_date < new Date().toISOString()
        ) {
          showActionErrorNotification(
            getLocalizedText(
              "Termin kann nicht in der Vergangenheit erstellt werden",
              "Appointment cannot be created in the past"
            )
          );
          return;
        }
        const result = await addAppointment(newAppointment, profile.id);

        if (!result) {
          console.error("Failed to create appointment:", newAppointment);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Termins",
              "Error creating appointment"
            )
          );
          return;
        }

        // Create notifications for this appointment
        if (result.reminder) {
          await syncAppointmentNotification(
            result.id,
            result.title,
            "appointment.reminder",
            result.reminder,
            showNotification
          );
        }

        await syncAppointmentNotification(
          result.id,
          result.title,
          "appointment.start",
          result.start_date,
          showNotification
        );

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Termin erfolgreich erstellt",
              "Appointment successfully created"
            )
          );
        }

        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [profile?.id, getLocalizedText, syncAppointmentNotification]
  );

  /**
   * Updates an Appointment with automatic notification.
   * Also updates appointment notifications if times change.
   */
  const handleUpdateAppointment = useCallback(
    async (
      id: string,
      item: UpdateAppointment,
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await updateAppointment(id, item);

        if (!result) {
          console.error("Failed to update appointment:", id);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Termins",
              "Error updating appointment"
            )
          );
          return false;
        }

        const currentAppointment = appointments?.find((a) => a.id === id);

        // Update notifications if relevant fields changed
        // We need the current appointment data to determine if we should update notifications
        if (currentAppointment) {
          const title = item.title ?? currentAppointment.title;
          const startDate = item.start_date ?? currentAppointment.start_date;
          const reminder =
            item.reminder !== undefined
              ? item.reminder
              : currentAppointment.reminder;

          // Update or delete reminder notification
          if (reminder) {
            await syncAppointmentNotification(
              id,
              title,
              "appointment.reminder",
              reminder,
              showNotification
            );
          } else if (currentAppointment.reminder && !reminder) {
            // Delete reminder notification if reminder was removed
            const reminderNotification = findNotification(
              id,
              "appointment.reminder"
            );
            if (reminderNotification) {
              await deleteNotification(
                reminderNotification.id,
                showNotification
              );
            }
          }

          // Update start notification
          await syncAppointmentNotification(
            id,
            title,
            "appointment.start",
            startDate,
            showNotification
          );
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Termin erfolgreich aktualisiert",
              "Appointment successfully updated"
            )
          );
        }

        return true;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        return false;
      }
    },
    [
      getLocalizedText,
      syncAppointmentNotification,
      findNotification,
      deleteNotification,
      appointments,
    ]
  );

  /**
   * Deletes an Appointment with automatic notification.
   * Also deletes all related appointment notifications.
   */
  const handleDeleteAppointment = useCallback(
    async (
      id: string | string[],
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await deleteAppointment(id);

        if (!result) {
          console.error("Failed to delete appointment:", id);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Termins",
              "Error deleting appointment"
            )
          );
          return false;
        }

        // Delete all notifications for this appointment(s)
        const idsToDelete = Array.isArray(id) ? id : [id];
        for (const appointmentId of idsToDelete) {
          await deleteAppointmentNotifications(appointmentId, showNotification);
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Termin erfolgreich gelöscht",
              "Appointment successfully deleted"
            )
          );
        }

        return true;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        return false;
      }
    },
    [getLocalizedText, deleteAppointmentNotifications]
  );

  return {
    addAppointment: handleAddAppointment,
    updateAppointment: handleUpdateAppointment,
    deleteAppointment: handleDeleteAppointment,
  };
};
