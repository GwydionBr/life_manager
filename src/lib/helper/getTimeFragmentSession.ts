import { InsertWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";

/**
 * Rounds a session to align with the specified time interval boundaries.
 *
 * Example: If a session runs from 17:17 to 17:36 and the interval is 10 minutes,
 * it will create a single session covering the aligned block:
 * - 17:10–17:40 (30 minutes total duration)
 *
 * The resulting session has:
 * - start_time = floored to the nearest interval
 * - end_time = ceiled to the nearest interval (or extended by one interval if equal to start)
 * - active_seconds = total seconds in that block
 *
 * @param timeFragmentInterval - Time interval for rounding (5, 10, 15, 30, 60 minutes)
 * @param originalSession - Original session data to copy properties from
 * @returns A single session object aligned to the interval
 */
export function getTimeFragmentSession(
  timeFragmentInterval: number,
  originalSession: InsertWorkTimeEntry | WorkTimeEntry
) {
  // Calculate the start of the first time block
  const blockStart = new Date(originalSession.start_time);
  blockStart.setMinutes(
    Math.floor(blockStart.getMinutes() / timeFragmentInterval) *
      timeFragmentInterval
  );
  blockStart.setSeconds(0);
  blockStart.setMilliseconds(0);

  // Calculate the end of the last time block
  let blockEnd = new Date(originalSession.end_time);
  blockEnd.setMinutes(
    Math.ceil(blockEnd.getMinutes() / timeFragmentInterval) *
      timeFragmentInterval
  );
  blockEnd.setSeconds(0);
  blockEnd.setMilliseconds(0);

  if (blockStart.getTime() === blockEnd.getTime()) {
    blockEnd.setMinutes(blockEnd.getMinutes() + timeFragmentInterval);
  }

  const newSession: typeof originalSession = {
    ...originalSession,
    start_time: blockStart.toISOString(),
    end_time: blockEnd.toISOString(),
    active_seconds: (blockEnd.getTime() - blockStart.getTime()) / 1000,
    time_fragments_interval: timeFragmentInterval,
  };

  return newSession;
}
