import { Locale, RoundingDirection } from "@/types/settings.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import { getRoundedSeconds } from "./workHelperFunctions";

export const getRoundingLabel = (
  direction: RoundingDirection,
  roundInTimeFragments: boolean,
  locale: Locale
) => {
  if (roundInTimeFragments) {
    return locale === "de-DE" ? "Fragmentweise" : "Fragment-wise";
  }
  switch (direction) {
    case "up":
      return locale === "de-DE" ? "Aufrunden" : "Round Up";
    case "down":
      return locale === "de-DE" ? "Abrunden" : "Round Down";
    case "nearest":
      return locale === "de-DE" ? "Am nächsten" : "Round Nearest";
    default:
      return direction;
  }
};

/**
 * Calculates the time values for a timer session.
 *
 * This function:
 * 1. Calculates the final active seconds (applying rounding if not using time fragments)
 * 2. Normalizes the start time to the beginning of the minute (removes seconds/milliseconds)
 * 3. Calculates the end time based on active
 *
 * Note: The distinction between `true_end_time` (actual end) and `end_time`
 * (calculated end based on rounded time) allows tracking of actual vs billed time.
 *
 * @param activeSeconds - Raw active seconds from the timer
 * @param startTime - Original start timestamp (can be null)
 * @param timerRoundingSettings - Permanent rounding settings
 * @param tempTimerRoundingSettings - Optional temporary rounding settings override
 * @returns Object containing finalActiveSeconds, normalizedStartTime, and calculatedEndTime
 */
export function calculateSessionTimeValues(
  activeSeconds: number,
  startTime: number | null,
  timerRoundingSettings: TimerRoundingSettings
) {
  // Determine final active seconds based on rounding mode
  // If using time fragments, use raw seconds; otherwise apply rounding
  const finalActiveSeconds = timerRoundingSettings.roundInTimeFragments
    ? activeSeconds
    : getRoundedSeconds(
        activeSeconds,
        timerRoundingSettings.roundingInterval,
        timerRoundingSettings.roundingDirection
      );

  // Normalize start time to beginning of minute (for cleaner database records)
  const normalizedStartTime = new Date(startTime ?? 0);
  normalizedStartTime.setSeconds(0);
  normalizedStartTime.setMilliseconds(0);

  // Calculate end time: start time + active seconds
  const calculatedEndTime = new Date(
    normalizedStartTime.getTime() + finalActiveSeconds * 1000
  );

  return {
    finalActiveSeconds,
    normalizedStartTime,
    calculatedEndTime,
  };
}
