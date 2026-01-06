import { FinanceInterval } from "@/types/settings.types";
import {
  addMonths,
  addDays,
  addWeeks,
  addQuarters,
  addYears,
  isSameDay,
} from "date-fns";

export const getCorrectDay = (date: Date, anchorDay: number) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return Math.min(anchorDay, lastDayOfMonth);
};

/**
 * Get the next date for a given interval and start date
 * @param interval - The interval to use
 * @param startDate - The start date to use
 * @returns The next date
 */
export const getNextDate = (
  interval: FinanceInterval,
  startDate: Date
): Date => {
  const today = new Date();
  let candidate = new Date(startDate);
  const anchorDay = candidate.getDate();

  // If today is before the start date, the next valid occurrence is the start date itself
  if (today < candidate) {
    return candidate;
  }

  // If today falls exactly on an occurrence, return today
  if (isSameDay(candidate, today)) {
    return today;
  }

  // Otherwise, advance from the start date in the chosen interval until we reach today or later
  const advance = (date: Date): Date => {
    switch (interval) {
      case "day":
        return addDays(date, 1);
      case "week":
        return addWeeks(date, 1);
      case "month": {
        let newMonthDate = addMonths(date, 1);
        newMonthDate.setDate(getCorrectDay(newMonthDate, anchorDay));
        return newMonthDate;
      }
      case "1/4 year": {
        let newQuarterDate = addQuarters(date, 1);
        newQuarterDate.setDate(getCorrectDay(newQuarterDate, anchorDay));
        return newQuarterDate;
      }
      case "1/2 year": {
        let newHalfYearDate = addMonths(date, 6);
        newHalfYearDate.setDate(getCorrectDay(newHalfYearDate, anchorDay));
        return newHalfYearDate;
      }
      case "year": {
        let newYearDate = addYears(date, 1);
        newYearDate.setDate(getCorrectDay(newYearDate, anchorDay));
        return newYearDate;
      }
      default:
        return date;
    }
  };

  while (candidate < today && !isSameDay(candidate, today)) {
    const next = advance(candidate);
    // Prevent infinite loops in case of an unknown interval
    if (next.getTime() === candidate.getTime()) break;
    candidate = next;
  }

  return isSameDay(candidate, today) ? today : candidate;
};
