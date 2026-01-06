import { CalendarSession } from "@/types/workCalendar.types";

// Normalizes a date to midnight (local time). Used for day-bounded layout
// and clipping of sessions that cross day boundaries.
export function getStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Adds a number of days without mutating the original date.
export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Check if the day is today
export function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Bounds a number between [min, max]. Useful for pixel positioning.
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// Simple stable hash for deterministic color selection per project.
export function hashStringToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Merge sessions that touch or overlap while having the same project and memo.
// This reduces visual clutter when tracking was paused/resumed frequently.
export function mergeAdjacentSessionsForRender(
  items: CalendarSession[]
): CalendarSession[] {
  if (items.length === 0) return items;
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const merged: CalendarSession[] = [];
  for (const current of sorted) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.work_project_id === current.work_project_id &&
      (prev.memo || "") === (current.memo || "") &&
      new Date(current.start_time).getTime() <=
        new Date(prev.end_time).getTime()
    ) {
      // Combine durations and stretch the end time to the latest end
      const durationPrev =
        (new Date(prev.end_time).getTime() -
          new Date(prev.start_time).getTime()) /
        1000;
      const durationCur =
        (new Date(current.end_time).getTime() -
          new Date(current.start_time).getTime()) /
        1000;
      merged[merged.length - 1] = {
        ...prev,
        id: `${prev.id}+${current.id}`,
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

// Calculate the actual time a session contributes to a specific day
// This is needed when sessions span multiple days
export function calculateSessionTimeForDay(
  session: CalendarSession,
  day: Date
): number {
  const dayStart = getStartOfDay(day);
  const dayEnd = getEndOfDay(day);

  const sessionStart = new Date(session.start_time);
  const sessionEnd = new Date(session.end_time);

  // If session doesn't overlap with this day, return 0
  if (sessionEnd <= dayStart || sessionStart >= dayEnd) {
    return 0;
  }

  // Calculate the actual start and end times within this day
  const actualStart = sessionStart < dayStart ? dayStart : sessionStart;
  const actualEnd = sessionEnd > dayEnd ? dayEnd : sessionEnd;

  const dayDuration = actualEnd.getTime() - actualStart.getTime();

  return Math.round(dayDuration / 1000);
}
