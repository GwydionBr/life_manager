import { useMemo } from "react";
import { Box, Stack, Text } from "@mantine/core";
import { useIntl } from "@/hooks/useIntl";
import { timeUnitIndexToDate } from "./calendarUtils";

// ============================================================================
// Types
// ============================================================================

interface TimeColumnProps {
  /** Base height for one hour in pixels */
  hourHeight: number;
  /** Zoom level multiplier (determines time labels density) */
  hourMultiplier: number;
  /** Current time for indicator positioning */
  currentTime: Date;
  /** Convert time to Y position */
  timeToY: (date: Date) => number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Renders the time labels column on the left/right side of the calendar.
 * Shows hour labels based on the current zoom level and a red line for current time.
 */
export function TimeColumn({
  hourHeight,
  hourMultiplier,
  currentTime,
  timeToY,
}: TimeColumnProps) {
  const { formatDateTime } = useIntl();

  // Number of time units per hour (equals zoom level)
  const timeUnitsPerHour = hourMultiplier;

  // Total time units for a full 24-hour day
  const totalTimeUnits = 24 * timeUnitsPerHour;

  // Height of each time unit segment
  const timeUnitHeight = hourHeight;

  // Total column height
  const columnHeight = totalTimeUnits * timeUnitHeight;

  /**
   * Memoized time labels to avoid recalculation on every render.
   * Creates an array of formatted time strings for each time unit.
   */
  const timeLabels = useMemo(() => {
    return Array.from({ length: totalTimeUnits + 1 }, (_, i) => {
      const date = timeUnitIndexToDate(i, timeUnitsPerHour);
      return formatDateTime(date);
    });
  }, [totalTimeUnits, timeUnitsPerHour, formatDateTime]);

  return (
    <Box w={42} style={{ flex: "0 0 auto" }}>
      <Stack gap="xs">
        <Box style={{ position: "relative", height: columnHeight }}>
          {/* Time Labels */}
          {timeLabels.map((label, i) => (
            <Text
              key={i}
              size="xs"
              c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-0))"
              style={{
                position: "absolute",
                top: i * timeUnitHeight - 6,
                left: 2,
                width: "100%",
                textAlign: "right",
                paddingRight: 8,
              }}
            >
              {label}
            </Text>
          ))}

          {/* Current Time Indicator (Red Line) */}
          <Box
            style={{
              position: "absolute",
              top: timeToY(currentTime),
              left: 0,
              right: 0,
              height: 2,
              background: "var(--mantine-color-red-6)",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}
