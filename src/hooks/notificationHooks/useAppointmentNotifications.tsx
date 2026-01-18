import { useCallback } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useNotificationMutations } from "@/db/collections/notification/use-notification-mutations";
import { useRouter } from "@tanstack/react-router";

import { canStartTimerFromAppointment } from "@/lib/appointmentTimerHelpers";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/toastFunctions";

import { type Notification as NotificationData } from "@/types/system.types";

export const useAppointmentNotifications = () => {
  const { data: appointments } = useAppointments();
  const { getLocalizedText } = useIntl();
  const { updateAppointment } = useAppointmentMutations();
  const { data: projects } = useWorkProjects();
  const { addTimer, timers, startAppointmentTimer } = useTimeTrackerManager();
  const { markAsRead } = useNotificationMutations();
  const router = useRouter();

  /**
   * Handle starting a timer from an appointment notification.
   */
  const handleStartTimerFromNotification = useCallback(
    async (notification: NotificationData) => {
      // Find the appointment associated with this notification
      const appointment = appointments?.find(
        (a) => a.id === notification.resource_id
      );

      if (!appointment) {
        showActionErrorNotification(
          getLocalizedText("Termin nicht gefunden", "Appointment not found")
        );
        return;
      }

      // Check if appointment can start a timer
      if (!canStartTimerFromAppointment(appointment)) {
        showActionErrorNotification(
          getLocalizedText(
            "Timer kann nicht gestartet werden",
            "Cannot start timer"
          )
        );
        return;
      }

      // Find the project
      const project = projects?.find(
        (p) => p.id === appointment.work_project_id
      );
      if (!project) {
        showActionErrorNotification(
          getLocalizedText("Projekt nicht gefunden", "Project not found")
        );
        return;
      }
      const existingTimer = Object.values(timers).find(
        (t) => t.projectId === appointment.work_project_id
      );
      if (existingTimer) {
        startAppointmentTimer(appointment.id, existingTimer.id);
      } else {
        // Add timer with appointment metadata
        const result = addTimer(project, undefined, appointment.id);

        if ("timerId" in result) {
          // Update appointment status to active
          await updateAppointment(appointment.id, { status: "active" });

          showActionSuccessNotification(
            getLocalizedText("Timer gestartet", "Timer started")
          );
        } else {
          showActionErrorNotification(
            getLocalizedText(
              "Timer konnte nicht gestartet werden",
              "Failed to start timer"
            )
          );
        }
      }
      // Mark notification as read
      markAsRead(notification.id);

      // Navigate to calendar
      router.navigate({ to: "/calendar" });
    },
    [
      appointments,
      projects,
      addTimer,
      startAppointmentTimer,
      updateAppointment,
      markAsRead,
      router,
      timers,
      getLocalizedText,
    ]
  );

  return {
    handleStartTimerFromNotification,
  };
};
