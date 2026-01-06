import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

export interface WorkTimeEntryListProps {
  timeEntries: Tables<"work_time_entry">[];
  projects?: Tables<"work_project">[];
  folders?: Tables<"work_folder">[];
  selectedTimeEntries: string[];
  onTimeEntryChange: (timeEntries: string[]) => void;
  project?: Tables<"work_project">;
  isOverview?: boolean;
}

export interface NewWorkTimeEntry {
  project_id?: string;
  start_time: string;
  end_time: string;
  active_seconds: number;
  paused_seconds: number;
  currency: Currency;
  salary: number;
  memo?: string;
  [key: string]: unknown;
}

export interface Earnings {
  amount: number;
  currency: Currency;
}

export interface EarningsBreakdown {
  paid: Earnings[];
  unpaid: Earnings[];
}

export type Year = {
  totalEarnings: EarningsBreakdown;
  timeEntryIds: string[];
  totalTime: number;
  months: Record<
    number,
    {
      totalEarnings: EarningsBreakdown;
      timeEntryIds: string[];
      totalTime: number;
      weeks: Record<
        number,
        {
          totalEarnings: EarningsBreakdown;
          timeEntryIds: string[];
          totalTime: number;
          days: Record<
            string,
            {
              totalEarnings: EarningsBreakdown;
              timeEntryIds: string[];
              totalTime: number;
              timeEntries: (Tables<"work_time_entry"> & { index: number })[];
            }
          >;
        }
      >;
    }
  >;
};

export interface TimePreset {
  value: string;
  label: string;
  days: number;
}
