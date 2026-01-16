import {
  Constants,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./db.types";
import { Currency } from "./settings.types";
import { WorkTimeEntry } from "./work.types";

export type ViewMode = "day" | "week" | "month";

export type Appointment = Tables<"appointment">;
export type InsertAppointment = TablesInsert<"appointment">;
export type UpdateAppointment = TablesUpdate<"appointment">;

export type NotificationType = Database["public"]["Enums"]["notificationType"];

// Enum-like object derived from database Constants - automatically synced with db.types.ts
// Use like: AppointmentStatus.UPCOMING (runtime access)
// The values are extracted from Constants to ensure they match the database enum
const appointmentStatusValues = Constants.public.Enums.appointmentStatus;
export const AppointmentStatus = {
  UPCOMING: appointmentStatusValues[0],
  ACTIVE: appointmentStatusValues[1],
  FINISHED: appointmentStatusValues[2],
  COMPLETED: appointmentStatusValues[3],
  MISSED: appointmentStatusValues[4],
} as const satisfies Record<
  string,
  Database["public"]["Enums"]["appointmentStatus"]
>;

// Type alias for the appointment status enum
export type AppointmentStatusType =
  Database["public"]["Enums"]["appointmentStatus"];

export type VisibleProject = {
  id: string;
  title: string;
  color: string;
  salary: number;
  currency: Currency;
};

// Calendar session with project info for rendering
export type CalendarTimeEntry = WorkTimeEntry & {
  projectTitle: string;
  color: string;
};

// Calendar appointment with project info for rendering
// Note: Using Pick to match the fields available from PowerSync schema
export type CalendarAppointment = Appointment & {
  projectTitle: string;
  color: string;
};

// Unified calendar event type for easier handling
export type CalendarEvent =
  | { type: "session"; data: CalendarTimeEntry }
  | { type: "appointment"; data: CalendarAppointment };

// Calendar day containing both sessions and appointments
export type CalendarDay = {
  day: Date;
  sessions: CalendarTimeEntry[];
  appointments: CalendarAppointment[];
  // All events sorted by start time for unified rendering
  events: CalendarEvent[];
};
