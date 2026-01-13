import { useEffect } from "react";
import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";

import { AppointmentStatus } from "@/types/workCalendar.types";

// Check interval for status updates (30 seconds)
const STATUS_CHECK_INTERVAL = 1000 * 30;

/**
 * Hook that automatically manages appointment statuses based on current time.
 *
 * This hook runs in the background and updates appointment statuses according to:
 * - upcoming → active: when current time >= start_date
 * - active → finished: when current time > end_date AND no work_time_entry_id
 *
 * Should be called once at the app level (e.g., in WorkCalendar.tsx or Shell.tsx)
 */
export function useAppointmentStatusManager() {
  const { data: appointments } = useAppointments();
  const { updateAppointment } = useAppointmentMutations();

  useEffect(() => {
    const checkAndUpdateStatuses = async () => {
      if (!appointments || appointments.length === 0) return;

      const now = new Date().toISOString();

      for (const appointment of appointments) {
        let shouldUpdate = false;
        let newStatus = appointment.status;

        // Status transition: upcoming → active
        if (
          appointment.status === AppointmentStatus.UPCOMING &&
          now >= appointment.start_date
        ) {
          newStatus = AppointmentStatus.ACTIVE;
          shouldUpdate = true;
        }

        // Status transition: active → finished
        // Only if end_date has passed AND no work_time_entry_id is set
        if (
          appointment.status === AppointmentStatus.ACTIVE &&
          now > appointment.end_date &&
          !appointment.work_time_entry_id
        ) {
          newStatus = AppointmentStatus.FINISHED;
          shouldUpdate = true;
        }

        if (shouldUpdate && newStatus !== appointment.status) {
          try {
            await updateAppointment(appointment.id, { status: newStatus });
          } catch (error) {
            console.error(
              `Failed to update appointment ${appointment.id} status:`,
              error
            );
          }
        }
      }
    };

    // Run immediately on mount
    checkAndUpdateStatuses();

    // Set up interval to check periodically
    const interval = setInterval(checkAndUpdateStatuses, STATUS_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [appointments, updateAppointment]);
}
