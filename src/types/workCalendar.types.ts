import { Tables, TablesInsert, TablesUpdate } from "./db.types";
import { Currency } from "./settings.types";

export type ViewMode = "day" | "week";

export type Appointment = Tables<"appointment">;
export type InsertAppointment = TablesInsert<"appointment">;
export type UpdateAppointment = TablesUpdate<"appointment">;

export type VisibleProject = {
  id: string;
  title: string;
  color: string;
  salary: number;
  currency: Currency;
};

// Calendar session with project info for rendering
export type CalendarSession = Tables<"work_time_entry"> & {
  projectTitle: string;
  color: string;
};

// Calendar appointment with project info for rendering
// Note: Using Pick to match the fields available from PowerSync schema
export type CalendarAppointment = Tables<"appointment"> & {
  projectTitle: string;
  color: string;
};

// Unified calendar event type for easier handling
export type CalendarEvent =
  | { type: "session"; data: CalendarSession }
  | { type: "appointment"; data: CalendarAppointment };

// Calendar day containing both sessions and appointments
export type CalendarDay = {
  day: Date;
  sessions: CalendarSession[];
  appointments: CalendarAppointment[];
  // All events sorted by start time for unified rendering
  events: CalendarEvent[];
};
