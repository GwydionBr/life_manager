import { useEffect } from "react";
import { useUpcomingAppointments } from "@/db/collections/work/appointment/use-appointment-query";

// TODO Change after development
const CHECK_INTERVAL = 1000 * 5; // 5 seconds

export function useAppointmentNotifications() {
  const { data: upcomingAppointments } = useUpcomingAppointments();

  useEffect(() => {
    const interval = setInterval(() => {
      if (upcomingAppointments) {
        const now = new Date().toISOString();
        upcomingAppointments.forEach((appointment) => {
          if (appointment.reminder && appointment.reminder < now) {
            console.log(
              "reminder notification for appointment",
              appointment.title
            );
            // TODO: Add reminder notification
          }
          if (appointment.start_date && appointment.start_date < now) {
            console.log(
              "start date notification for appointment",
              appointment.title
            );
            // TODO: Add start date notification
          }
        });
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [upcomingAppointments]);
}
