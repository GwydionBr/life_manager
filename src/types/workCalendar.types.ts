import { Tables } from "./db.types";
import { Currency } from "./settings.types";

export type ViewMode = "day" | "week";

export type CalendarDay = {
  day: Date;
  sessions: CalendarSession[];
  appointments: CalendarAppointment[];
};

export type VisibleProject = {
  id: string;
  title: string;
  color: string;
  salary: number;
  currency: Currency;
};

export type CalendarSession = Pick<
  Tables<"work_time_entry">, 
  | "id"
  | "start_time"
  | "end_time"
  | "work_project_id"
  | "memo"
  | "active_seconds"
  | "currency"
  | "salary"
  | "single_cashflow_id"
> & {
  projectTitle: string;
  color: string;
};

export type CalendarAppointment = Pick<
  Tables<"appointment">,
  | "id"
  | "title"
  | "description"
  | "start_date"
  | "end_date"
  | "work_project_id"
> & {
  projectTitle: string;
  color: string;
};
