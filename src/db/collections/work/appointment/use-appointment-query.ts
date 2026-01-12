import { eq, useLiveQuery, and, or, gte, lte } from "@tanstack/react-db";
import { appointmentsCollection } from "./appointment-collection";
import { AppointmentStatus } from "@/types/workCalendar.types";
import { startOfDay, endOfDay } from "date-fns";

export const useAppointments = () =>
  useLiveQuery((q) => q.from({ appointments: appointmentsCollection }));

export const useUpcomingAppointments = () => {
  return useLiveQuery((q) => {
    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();

    return q
      .from({ appointments: appointmentsCollection })
      .where(({ appointments }) =>
        and(
          eq(appointments.status, AppointmentStatus.UPCOMING),
          or(
            and(
              gte(appointments.start_date, todayStart),
              lte(appointments.start_date, todayEnd)
            ),
            and(
              appointments.reminder !== null,
              gte(appointments.reminder, todayStart),
              lte(appointments.reminder, todayEnd)
            )
          )
        )
      );
  });
};
