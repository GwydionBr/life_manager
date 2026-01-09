import {
  CalendarSession,
  CalendarAppointment,
} from "@/types/workCalendar.types";
import { startOfDay, endOfDay } from "date-fns";

// ============================================================================
// Math Utilities
// ============================================================================

/**
 * Clamps a value between min and max (inclusive).
 * Useful for keeping pixel positions within bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Simple stable hash function for deterministic color selection per project.
 * Returns a positive integer hash of the input string.
 */
export function hashStringToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ============================================================================
// Time <-> Y-Position Conversion
// ============================================================================

/**
 * Converts a Date to a Y-position (pixels) within the day timeline.
 * @param date - The date/time to convert
 * @param rasterHeight - Height of one hour segment in pixels
 * @param hourMultiplier - Zoom level multiplier
 * @returns Y-position in pixels, clamped to valid range [0, 24 * rasterHeight * hourMultiplier]
 */
export function timeToY(
  date: Date,
  rasterHeight: number,
  hourMultiplier: number
): number {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const totalMinutes = 24 * 60;
  const y =
    (minutes / totalMinutes) *
    (totalMinutes / 60) *
    rasterHeight *
    hourMultiplier;
  return clamp(y, 0, 24 * rasterHeight * hourMultiplier);
}

/**
 * Converts a Y-position (pixels) to a Date for the given day.
 * This is the inverse function of timeToY.
 * @param y - Y-position in pixels
 * @param day - The day for which to create the Date
 * @param rasterHeight - Height of one hour segment in pixels
 * @param hourMultiplier - Zoom level multiplier
 * @returns Date object with the calculated time
 */
export function yToTime(
  y: number,
  day: Date,
  rasterHeight: number,
  hourMultiplier: number
): Date {
  const minutes = (y / (rasterHeight * hourMultiplier)) * 60;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes - hours * 60);
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    mins,
    0,
    0
  );
}

/**
 * Snaps a Y-position to the nearest interval boundary.
 * Used for rounding time selections to configured intervals (e.g., 15 min).
 * @param inputY - Y-position to snap
 * @param day - Reference day for time calculations
 * @param rasterHeight - Height of one hour segment in pixels
 * @param hourMultiplier - Zoom level multiplier
 * @param roundingInterval - Interval in minutes to snap to (e.g., 15)
 * @returns Snapped Y-position in pixels
 */
export function snapYToInterval(
  inputY: number,
  day: Date,
  rasterHeight: number,
  hourMultiplier: number,
  roundingInterval: number
): number {
  const date = yToTime(inputY, day, rasterHeight, hourMultiplier);
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const minutesToRound = totalMinutes % roundingInterval;

  // Round to nearest interval
  const minutesToAdd =
    minutesToRound > roundingInterval / 2
      ? roundingInterval - minutesToRound
      : -minutesToRound;

  const totalMinutesRounded = totalMinutes + minutesToAdd;
  const snapped = new Date(date);
  const hours = Math.floor(totalMinutesRounded / 60);
  const minutes = totalMinutesRounded % 60;
  snapped.setHours(hours, minutes, 0, 0);

  return Math.round(timeToY(snapped, rasterHeight, hourMultiplier));
}

// ============================================================================
// Session / Appointment Clipping
// ============================================================================

/**
 * Clips a session to fit within a single day's boundaries.
 * For sessions that span multiple days, returns only the portion within this day.
 * @param session - The calendar session to clip
 * @param dayStart - Start of the day (midnight)
 * @param dayEnd - End of the day (23:59:59)
 * @returns Clipped session with adjusted start/end times
 */
export function clipSessionToDay(
  session: CalendarSession,
  dayStart: Date,
  dayEnd: Date
): CalendarSession {
  const sStart = new Date(session.start_time);
  const sEnd = new Date(session.end_time);
  const start = sStart < dayStart ? dayStart : sStart;
  const end = sEnd > dayEnd ? dayEnd : sEnd;

  return {
    ...session,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  };
}

/**
 * Clips an appointment to fit within a single day's boundaries.
 * For appointments that span multiple days, returns only the portion within this day.
 * @param appointment - The calendar appointment to clip
 * @param dayStart - Start of the day (midnight)
 * @param dayEnd - End of the day (23:59:59)
 * @returns Clipped appointment with adjusted start/end dates
 */
export function clipAppointmentToDay(
  appointment: CalendarAppointment,
  dayStart: Date,
  dayEnd: Date
): CalendarAppointment {
  const aStart = new Date(appointment.start_date);
  const aEnd = new Date(appointment.end_date);
  const start = aStart < dayStart ? dayStart : aStart;
  const end = aEnd > dayEnd ? dayEnd : aEnd;

  return {
    ...appointment,
    start_date: start.toISOString(),
    end_date: end.toISOString(),
  };
}

// ============================================================================
// Session Merging & Time Calculation
// ============================================================================

/**
 * Merges adjacent sessions that have the same project and memo.
 * This reduces visual clutter when tracking was paused/resumed frequently.
 * Sessions are considered adjacent if one starts before or when the other ends.
 * @param items - Array of calendar sessions to merge
 * @returns Array of merged sessions (may be smaller than input)
 */
export function mergeAdjacentSessionsForRender(
  items: CalendarSession[]
): CalendarSession[] {
  if (items.length === 0) return items;

  // Sort by start time to enable linear merging
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const merged: CalendarSession[] = [];

  for (const current of sorted) {
    const prev = merged[merged.length - 1];

    // Check if current can be merged with previous
    const canMerge =
      prev &&
      prev.work_project_id === current.work_project_id &&
      (prev.memo || "") === (current.memo || "") &&
      new Date(current.start_time).getTime() <=
        new Date(prev.end_time).getTime();

    if (canMerge) {
      // Calculate durations for combining active_seconds
      const durationPrev =
        (new Date(prev.end_time).getTime() -
          new Date(prev.start_time).getTime()) /
        1000;
      const durationCur =
        (new Date(current.end_time).getTime() -
          new Date(current.start_time).getTime()) /
        1000;

      // Merge: extend end time and combine durations
      merged[merged.length - 1] = {
        ...prev,
        id: `${prev.id}+${current.id}`, // Composite ID for tracking
        end_time:
          new Date(current.end_time).getTime() >
          new Date(prev.end_time).getTime()
            ? current.end_time
            : prev.end_time,
        active_seconds:
          (prev.active_seconds || durationPrev) +
          (current.active_seconds || durationCur),
      };
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/**
 * Calculates the time a session contributes to a specific day.
 * For sessions spanning multiple days, returns only the portion within this day.
 * @param session - The calendar session
 * @param day - The day to calculate time for
 * @returns Duration in seconds that the session overlaps with this day
 */
export function calculateSessionTimeForDay(
  session: CalendarSession,
  day: Date
): number {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const sessionStart = new Date(session.start_time);
  const sessionEnd = new Date(session.end_time);

  // No overlap with this day
  if (sessionEnd <= dayStart || sessionStart >= dayEnd) {
    return 0;
  }

  // Calculate clamped boundaries
  const actualStart = sessionStart < dayStart ? dayStart : sessionStart;
  const actualEnd = sessionEnd > dayEnd ? dayEnd : sessionEnd;

  const dayDuration = actualEnd.getTime() - actualStart.getTime();
  return Math.round(dayDuration / 1000);
}

// ============================================================================
// Time Formatting
// ============================================================================

/**
 * Formats a time unit index to a Date object for formatting.
 * Used by TimeColumn to display hour labels.
 * @param timeUnitIndex - Index of the time unit
 * @param timeUnitsPerHour - Number of time units per hour (zoom level)
 * @returns Date object representing the time
 */
export function timeUnitIndexToDate(
  timeUnitIndex: number,
  timeUnitsPerHour: number
): Date {
  const totalMinutes = (timeUnitIndex * 60) / timeUnitsPerHour;
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = Math.floor(normalizedMinutes % 60);

  return new Date(1970, 0, 1, hours, minutes, 0, 0);
}
