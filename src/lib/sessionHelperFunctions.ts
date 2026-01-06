import type { Tables } from "@/types/db.types";
import { formatMoney } from "@/utils/intl";
import { getWeekNumber } from "@/lib/workHelperFunctions";
import { Locale } from "@/types/settings.types";
import type {
  Earnings,
  EarningsBreakdown,
  Year,
} from "@/types/timerSession.types";

export function groupSessions(
  sessions: Tables<"timer_session">[],
  locale: Locale
): { year: number; data: Year }[] {
  const groupedSessions: Record<number, Year> = sessions.reduce(
    (acc, session, index) => {
      if (!session.start_time || !session.currency) {
        return acc;
      }

      const startTime = new Date(session.start_time);
      const year = startTime.getFullYear();
      // Use numeric month (1-12) as stable key to avoid locale parsing issues
      const month = startTime.getMonth() + 1;
      const week = getWeekNumber(startTime);
      // Use ISO date (YYYY-MM-DD) as stable key to avoid Invalid Date parsing
      const day = startTime.toISOString().slice(0, 10);
      // Calculate earnings for all sessions (both paid and unpaid)
      const earnings: Earnings = {
        amount: session.hourly_payment
          ? Number(
              ((session.active_seconds * session.salary) / 3600).toFixed(2)
            )
          : 0,
        currency: session.currency,
      };

      const timeInSeconds = session.active_seconds || 0;

      // Year
      acc[year] = acc[year] || {
        totalEarnings: { paid: [], unpaid: [] },
        timeEntryIds: [],
        totalTime: 0,
        months: {},
      };

      if (session.single_cash_flow_id) {
        acc[year].totalEarnings.paid = addEarnings(
          acc[year].totalEarnings.paid,
          earnings
        );
      } else {
        acc[year].totalEarnings.unpaid = addEarnings(
          acc[year].totalEarnings.unpaid,
          earnings
        );
      }
      acc[year].totalTime += timeInSeconds;
      acc[year].timeEntryIds.push(session.id);

      // Month
      acc[year].months[month] = acc[year].months[month] || {
        totalEarnings: { paid: [], unpaid: [] },
        timeEntryIds: [],
        totalTime: 0,
        weeks: {},
      };

      if (session.single_cash_flow_id) {
        acc[year].months[month].totalEarnings.paid = addEarnings(
          acc[year].months[month].totalEarnings.paid,
          earnings
        );
      } else {
        acc[year].months[month].totalEarnings.unpaid = addEarnings(
          acc[year].months[month].totalEarnings.unpaid,
          earnings
        );
      }
      acc[year].months[month].totalTime += timeInSeconds;
      acc[year].months[month].timeEntryIds.push(session.id);

      // Week
      acc[year].months[month].weeks[week] = acc[year].months[month].weeks[
        week
      ] || {
        totalEarnings: { paid: [], unpaid: [] },
        timeEntryIds: [],
        totalTime: 0,
        days: {},
      };

      if (session.single_cash_flow_id) {
        acc[year].months[month].weeks[week].totalEarnings.paid = addEarnings(
          acc[year].months[month].weeks[week].totalEarnings.paid,
          earnings
        );
      } else {
        acc[year].months[month].weeks[week].totalEarnings.unpaid = addEarnings(
          acc[year].months[month].weeks[week].totalEarnings.unpaid,
          earnings
        );
      }
      acc[year].months[month].weeks[week].totalTime += timeInSeconds;
      acc[year].months[month].weeks[week].timeEntryIds.push(session.id);

      // Day
      acc[year].months[month].weeks[week].days[day] = acc[year].months[month]
        .weeks[week].days[day] || {
        totalEarnings: { paid: [], unpaid: [] },
        timeEntryIds: [],
        totalTime: 0,
        timeEntries: [],
      };

      if (session.single_cash_flow_id) {
        acc[year].months[month].weeks[week].days[day].totalEarnings.paid =
          addEarnings(
            acc[year].months[month].weeks[week].days[day].totalEarnings.paid,
            earnings
          );
      } else {
        acc[year].months[month].weeks[week].days[day].totalEarnings.unpaid =
          addEarnings(
            acc[year].months[month].weeks[week].days[day].totalEarnings.unpaid,
            earnings
          );
      }
      acc[year].months[month].weeks[week].days[day].totalTime += timeInSeconds;
      acc[year].months[month].weeks[week].days[day].timeEntries.push({
        ...session,
        index,
      });
      acc[year].months[month].weeks[week].days[day].timeEntryIds.push(
        session.id
      );

      return acc;
    },
    {} as Record<number, Year>
  );

  return Object.entries(groupedSessions).map(([year, data]) => ({
    year: Number(year),
    data,
  }));
}

export function addEarnings(
  existingEarnings: Earnings[],
  newEarnings: Earnings
): Earnings[] {
  const updatedEarnings = [...existingEarnings];
  const existingIndex = updatedEarnings.findIndex(
    (e) => e.currency === newEarnings.currency
  );

  if (existingIndex > -1) {
    updatedEarnings[existingIndex] = {
      ...updatedEarnings[existingIndex],
      amount: updatedEarnings[existingIndex].amount + newEarnings.amount,
    };
  } else {
    updatedEarnings.push({ ...newEarnings });
  }

  return updatedEarnings;
}

export function formatEarnings(earnings: Earnings[], locale: Locale): string {
  return earnings
    .map((e) => {
      return formatMoney(e.amount, e.currency, locale);
    })
    .join(", ");
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours} h`;
  } else {
    return `${minutes} min`;
  }
}

export function areEarningsEmpty(earnings: Earnings[]): boolean {
  return earnings.every((e) => e.amount === 0);
}

export function areEarningsBreakdownEmpty(
  earnings: EarningsBreakdown
): boolean {
  return areEarningsEmpty(earnings.paid) && areEarningsEmpty(earnings.unpaid);
}
