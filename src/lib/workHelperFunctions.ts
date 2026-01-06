import { RoundingDirection } from "@/types/settings.types";
import { Tables, TablesInsert } from "@/types/db.types";
import { TimerState } from "@/types/timeTracker.types";
import { TimeSpan } from "@/types/work.types";

export function getStatusColor(state: TimerState) {
  switch (state) {
    case TimerState.Running:
      return "lime";
    case TimerState.Paused:
      return "yellow";
    case TimerState.Stopped:
      return "teal.6";
    default:
      return "blue";
  }
}

/**
 * Rounds the seconds to the nearest rounding interval
 * @param seconds - The seconds to round
 * @param roundingInterval - The rounding interval in minutes
 * @param roundingDirection - The rounding direction
 * @returns The rounded seconds
 */
export function getRoundedSeconds(
  seconds: number,
  roundingInterval: number,
  roundingDirection: RoundingDirection
) {
  const roundingIntervalSeconds = roundingInterval * 60;
  switch (roundingDirection) {
    case "up":
      return (
        Math.ceil(seconds / roundingIntervalSeconds) * roundingIntervalSeconds
      );
    case "down":
      return (
        Math.floor(seconds / roundingIntervalSeconds) * roundingIntervalSeconds
      );
    case "nearest":
      return (
        Math.round(seconds / roundingIntervalSeconds) * roundingIntervalSeconds
      );
    default:
      return seconds;
  }
}

export function getWeekNumber(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstDayOffset = firstDayOfMonth.getDay() || 7;
  const adjustedOffset = firstDayOffset - 1;

  return Math.ceil((dayOfMonth + adjustedOffset) / 7);
}

export function secondsToTimerFormat(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;

  const hoursStr = hours > 0 ? `${hours}:` : "";
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = secondsLeft.toString().padStart(2, "0");

  return `${hoursStr}${minutesStr}:${secondsStr}`;
}

/**
 * Splits a session into multiple time blocks based on the specified interval.
 *
 * Example: If a session runs from 17:17 to 17:36 and timeSectionInterval is "10min",
 * it will create 3 sessions:
 * - 17:10-17:20 (3 minutes active: 17:17-17:20)
 * - 17:20-17:30 (10 minutes active: 17:20-17:30)
 * - 17:30-17:40 (6 minutes active: 17:30-17:36)
 *
 * @param start - Start time of the original session
 * @param end - End time of the original session
 * @param timeSectionInterval - Time interval for splitting (5, 10, 15, 30, 60)
 * @param originalSession - Optional original session data to copy properties from
 * @returns Array of session objects split into time blocks
 */
export function getTimeSectionSessions(
  start: Date,
  end: Date,
  timeSectionInterval: number,
  originalSession: TablesInsert<"work_time_entry">
) {
  const sessions: TablesInsert<"work_time_entry">[] = [];

  // Calculate the start of the first time block
  const blockStart = new Date(start);
  blockStart.setMinutes(
    Math.floor(blockStart.getMinutes() / timeSectionInterval) *
      timeSectionInterval
  );
  blockStart.setSeconds(0);
  blockStart.setMilliseconds(0);

  // Calculate the end of the last time block
  const blockEnd = new Date(end);
  blockEnd.setMinutes(
    Math.ceil(blockEnd.getMinutes() / timeSectionInterval) * timeSectionInterval
  );
  blockEnd.setSeconds(0);
  blockEnd.setMilliseconds(0);

  // Ensure we have at least one block even for very short sessions
  if (blockStart.getTime() >= blockEnd.getTime()) {
    // For sessions that are very short or start/end at the same time,
    // create a single block based on the start time
    const singleBlockStart = new Date(blockStart);
    const singleBlockEnd = new Date(singleBlockStart);
    singleBlockEnd.setMinutes(
      singleBlockEnd.getMinutes() + timeSectionInterval
    );

    const session: TablesInsert<"work_time_entry"> = {
      start_time: singleBlockStart.toISOString(),
      real_start_time: start.toISOString(),
      end_time: singleBlockEnd.toISOString(),
      true_end_time: end.toISOString(),
      active_seconds: timeSectionInterval * 60,
      paused_seconds: 0,
      salary: originalSession.salary,
      work_project_id: originalSession.work_project_id,
      currency: originalSession.currency,
      hourly_payment: originalSession.hourly_payment,
      payout_id: null,
      user_id: originalSession.user_id,
      memo: originalSession.memo,
    };

    sessions.push(session);
    return sessions;
  }

  let currentBlockStart = new Date(blockStart);

  while (currentBlockStart < blockEnd) {
    const currentBlockEnd = new Date(currentBlockStart);
    currentBlockEnd.setMinutes(
      currentBlockEnd.getMinutes() + timeSectionInterval
    );

    const session: TablesInsert<"work_time_entry"> = {
      start_time: currentBlockStart.toISOString(),
      real_start_time:
        start > currentBlockStart
          ? start.toISOString()
          : currentBlockStart.toISOString(),
      end_time: currentBlockEnd.toISOString(),
      true_end_time:
        end < currentBlockEnd
          ? end.toISOString()
          : currentBlockEnd.toISOString(),
      active_seconds: timeSectionInterval * 60,
      paused_seconds: 0,
      salary: originalSession.salary,
      work_project_id: originalSession.work_project_id,
      currency: originalSession.currency,
      hourly_payment: originalSession.hourly_payment,
      payout_id: null,
      user_id: originalSession.user_id,
      memo: originalSession.memo,
    };

    sessions.push(session);

    currentBlockStart = currentBlockEnd;
  }

  return sessions;
}

export function filterOutExistingSessionFragments(
  existingSessions: Tables<"work_time_entry">[],
  newSessions: TablesInsert<"work_time_entry">[]
): {
  newSessionsToAdd: TablesInsert<"work_time_entry">[];
  alreadyExistingSessions: Tables<"work_time_entry">[];
} {
  const alreadyExistingSessions: Tables<"work_time_entry">[] = [];
  const newSessionsToAdd: TablesInsert<"work_time_entry">[] = [];
  newSessions.forEach((newSession) => {
    const existingSession = existingSessions.find((existingSession) => {
      return (
        new Date(existingSession.start_time).getTime() ===
          new Date(newSession.start_time).getTime() &&
        new Date(existingSession.end_time).getTime() ===
          new Date(newSession.end_time).getTime()
      );
    });

    if (!existingSession) {
      newSessionsToAdd.push(newSession);
    } else {
      alreadyExistingSessions.push(existingSession);
    }
  });

  return {
    newSessionsToAdd,
    alreadyExistingSessions,
  };
}

/**
 * Filters out existing sessions that overlap with the new session.
 * If there are collisions, adjusts the session to fit the collisions.
 * @param existingSessions - Existing sessions
 * @param newSession - New session
 * @returns Adjusted session and collision fragments
 */
export function filterOutExistingSessionTimes(
  existingSessions: Tables<"work_time_entry">[],
  newSessionTime: TimeSpan
): {
  adjustedTimeSpan: TimeSpan[] | null;
  collisionFragments: TimeSpan[] | null;
} {
  const collisionFragments: TimeSpan[] | null = [];
  const newStart = new Date(newSessionTime.start_time).getTime();
  const newEnd = new Date(newSessionTime.end_time).getTime();

  // Find all existing sessions that overlap with the new session
  const overlappingSessions = existingSessions.filter((existingSession) => {
    const existingStart = new Date(existingSession.start_time).getTime();
    const existingEnd = new Date(existingSession.end_time).getTime();

    // Check for overlap: sessions overlap if one starts before the other ends
    return newStart < existingEnd && newEnd > existingStart;
  });
  console.log("overlappingSessions", overlappingSessions);

  if (overlappingSessions.length === 0) {
    // No collision, return the session as is
    console.log("no collision");
    return {
      adjustedTimeSpan: [newSessionTime],
      collisionFragments: null,
    };
  } else {
    // If there are collisions, adjust the session

    const adjustedTimeSpan: TimeSpan[] = [
      {
        ...newSessionTime,
      },
    ];

    // For each overlapping session, adjust the session
    for (const overlappingSession of overlappingSessions) {
      const overlappingStart = new Date(
        overlappingSession.start_time
      ).getTime();
      const overlappingEnd = new Date(overlappingSession.end_time).getTime();

      // If the new session is completely overlapping with an existing session, return null
      if (overlappingStart <= newStart && overlappingEnd >= newEnd) {
        console.log("complete overlap");
        return {
          adjustedTimeSpan: null,
          collisionFragments: [
            {
              start_time: overlappingStart,
              end_time: overlappingEnd,
            },
          ],
        };
      }
      // If the new session starts before the existing session, adjust the start time
      if (overlappingStart <= newStart) {
        console.log("start before overlap");
        adjustedTimeSpan[0].start_time = overlappingEnd;
        collisionFragments.push({
          start_time: newStart,
          end_time: overlappingEnd,
        });
      }
      // If the new session ends after the existing session, adjust the end time
      if (overlappingEnd >= newEnd) {
        console.log("end after overlap");
        adjustedTimeSpan[0].end_time = overlappingStart;
        collisionFragments.push({
          start_time: overlappingStart,
          end_time: newEnd,
        });
      }
    }

    return {
      adjustedTimeSpan,
      collisionFragments,
    };
  }
}
