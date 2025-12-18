import { startOfDay, endOfDay } from "date-fns";
import { WorkTimeEntry } from "@/types/work.types";

/**
 * Hook for filtering time entries by time period
 * @param timeEntries - Array of time entries to filter
 * @param timeSpan - Time span for the filter
 */
export function useProjectFiltering(
  timeEntries: WorkTimeEntry[],
  timeSpan: [Date | null, Date | null]
) {
  /**
   * Filters time entries by selected time period
   * Returns all sessions if no time preset is selected
   */
  const getTimeFilteredTimeEntries = () => {
    if (!timeSpan[0] || !timeSpan[1]) {
      return timeEntries;
    }

    let startDate = startOfDay(new Date(timeSpan[0]));
    let endDate = endOfDay(new Date(timeSpan[1]));

    return timeEntries.filter((timeEntry) => {
      const sessionDate = new Date(timeEntry.start_time);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  };

  const timeFilteredTimeEntries = getTimeFilteredTimeEntries();

  return {
    timeFilteredTimeEntries,
  };
}
