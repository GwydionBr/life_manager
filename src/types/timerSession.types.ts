import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

export interface SessionListProps {
  sessions: Tables<"timer_session">[];
  projects?: Tables<"timer_project">[];
  folders?: Tables<"timer_project_folder">[];
  selectedSessions: string[];
  onSessionsChange: (sessions: string[]) => void;
  project?: Tables<"timer_project">;
  isOverview?: boolean;
}

export interface NewSession {
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
  sessionIds: string[];
  totalTime: number;
  months: Record<
    number,
    {
      totalEarnings: EarningsBreakdown;
      sessionIds: string[];
      totalTime: number;
      weeks: Record<
        number,
        {
          totalEarnings: EarningsBreakdown;
          sessionIds: string[];
          totalTime: number;
          days: Record<
            string,
            {
              totalEarnings: EarningsBreakdown;
              sessionIds: string[];
              totalTime: number;
              sessions: (Tables<"timer_session"> & { index: number })[];
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
