import { useLiveQuery } from "@tanstack/react-db";
import { appointmentsCollection } from "./appointment-collection";

export const useAppointments = () =>
  useLiveQuery((q) => q.from({ appointments: appointmentsCollection }));
