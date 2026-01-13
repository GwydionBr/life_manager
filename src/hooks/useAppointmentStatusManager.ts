import { useEffect, useRef } from "react";
import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";

// Check interval for status updates (30 seconds)
const STATUS_CHECK_INTERVAL = 1000 * 30;

/**
 * Hook that automatically manages appointment statuses based on current time.
 *
 * This hook runs in the background and updates appointment statuses according to:
 * - upcoming → active: when current time >= start_date
 * - active → missed: when current time > end_date AND no work_time_entry_id
 * - active → completed: when work_time_entry_id is set
 *
 * Should be called once at the app level (e.g., in WorkCalendar.tsx or Shell.tsx)
 */
export function useAppointmentStatusManager() {
  const { data: appointments } = useAppointments();
  const { updateAppointment } = useAppointmentMutations();

  // Track which appointments we've already processed to avoid duplicate updates
  const processedAppointmentsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkAndUpdateStatuses = async () => {
      if (!appointments || appointments.length === 0) return;

      const now = new Date().toISOString();

      for (const appointment of appointments) {
        // Skip if already processed in this session (prevents rapid updates)
        const processKey = `${appointment.id}-${appointment.status}`;
        if (processedAppointmentsRef.current.has(processKey)) {
          continue;
        }

        let shouldUpdate = false;
        let newStatus = appointment.status;

        // Status transition: upcoming → active
        if (
          appointment.status === "upcoming" &&
          now >= appointment.start_date
        ) {
          newStatus = "active";
          shouldUpdate = true;
        }

        // Status transition: active → missed
        // Only if end_date has passed AND no work_time_entry_id is set
        if (
          appointment.status === "active" &&
          now > appointment.end_date &&
          !appointment.work_time_entry_id
        ) {
          newStatus = "missed";
          shouldUpdate = true;
        }

        // Status transition: active → completed
        // When work_time_entry_id is set
        if (appointment.status === "active" && appointment.work_time_entry_id) {
          newStatus = "completed";
          shouldUpdate = true;
        }

        // Status transition: upcoming → completed
        // When work_time_entry_id is set but status is still upcoming
        if (
          appointment.status === "upcoming" &&
          appointment.work_time_entry_id
        ) {
          newStatus = "completed";
          shouldUpdate = true;
        }

        // Status transition: missed → completed
        // When work_time_entry_id is set on a missed appointment
        if (appointment.status === "missed" && appointment.work_time_entry_id) {
          newStatus = "completed";
          shouldUpdate = true;
        }

        if (shouldUpdate && newStatus !== appointment.status) {
          try {
            await updateAppointment(appointment.id, { status: newStatus });
            // Mark as processed
            processedAppointmentsRef.current.add(processKey);
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

  // Clean up processed appointments set when appointments change
  // Remove entries for appointments that no longer exist or have changed status
  useEffect(() => {
    if (!appointments) return;

    const currentAppointmentKeys = new Set(
      appointments.map((a) => `${a.id}-${a.status}`)
    );

    // Remove stale entries
    processedAppointmentsRef.current.forEach((key) => {
      if (!currentAppointmentKeys.has(key)) {
        processedAppointmentsRef.current.delete(key);
      }
    });
  }, [appointments]);
}
