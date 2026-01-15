import { useMemo } from "react";
import { useHover, useHotkeys } from "@mantine/hooks";
import { useCalendarStore } from "@/stores/calendarStore";
import { useIntl } from "@/hooks/useIntl";

import { alpha, Box, Skeleton, Stack, Text } from "@mantine/core";

import { clipSessionToDay, clipAppointmentToDay } from "./calendarUtils";
import { isToday, startOfDay, endOfDay } from "date-fns";
import {
  CalendarTimeEntry,
  CalendarAppointment,
} from "@/types/workCalendar.types";
import CalendarTimeEntryEvent from "./CalendarEvent/CalendarTimeEntryEvent";
import CalendarAppointmentEvent from "./CalendarEvent/CalendarAppointmentEvent";
import TimeTrackerEvent from "./CalendarEvent/TimeTrackerEvent/TimeTrackerEvent";
import NewSessionEvent from "./CalendarEvent/NewSessionEvent";

// ============================================================================
// Types
// ============================================================================

interface DayColumnProps {
  /** The day this column represents */
  day: Date;
  /** Current mouse Y position within the grid */
  y: number;
  /** Convert Y position to time for given day */
  yToTime: (y: number, day: Date) => Date;
  /** Convert time to Y position */
  timeToY: (date: Date) => number;
  /** Whether calendar data is loading */
  isFetching: boolean;
  /** Current time (updates periodically) */
  currentTime: Date;
  /** Sessions overlapping this day */
  sessions: CalendarTimeEntry[];
  /** Appointments overlapping this day */
  appointments: CalendarAppointment[];
  /** Callback when session is clicked */
  handleSessionClick: (sessionId: string) => void;
  /** Callback when appointment is clicked */
  handleAppointmentClick?: (appointmentId: string) => void;
  /** Zoom level multiplier */
  hourMultiplier: number;
  /** Base height for one hour */
  rasterHeight: number;
  /** Y position where new session creation started */
  startNewSession: number | null;
  /** Set the start position for new session */
  setStartNewSession: (y: number | null) => void;
  /** Day where new session is being created */
  newSessionDay: Date | null;
  /** Set the day for new session */
  setNewSessionDay: (day: Date | null) => void;
  /** Set the end position for new session */
  setEndNewSession: (y: number | null) => void;
  /** Snap Y position to configured interval */
  snapYToInterval: (y: number) => number;
}

// ============================================================================
// Constants
// ============================================================================

const SKELETON_COUNT = 24;

// ============================================================================
// Component
// ============================================================================

/**
 * Renders a single day column in the calendar.
 * Displays sessions, appointments, time grid, and handles new session creation.
 */
export function DayColumn({
  day,
  y,
  yToTime,
  timeToY,
  isFetching,
  currentTime,
  sessions,
  appointments,
  handleSessionClick,
  handleAppointmentClick,
  hourMultiplier,
  rasterHeight,
  startNewSession,
  setStartNewSession,
  newSessionDay,
  setNewSessionDay,
  setEndNewSession,
  snapYToInterval,
}: DayColumnProps) {
  const { hovered, ref: hoverRef } = useHover();
  const { formatDateTime } = useIntl();
  const { addingMode } = useCalendarStore();

  // Cancel new session creation on Escape
  useHotkeys([["escape", () => setStartNewSession(null)]]);

  // Day boundaries for clipping events
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const isDayToday = isToday(day);

  // Total column height based on zoom
  const columnHeight = rasterHeight * 24 * hourMultiplier;

  // Grid line count (one per time unit)
  const gridLineCount = 24 * hourMultiplier + 1;

  // Snapped Y position for new session indicator
  const snappedY = snapYToInterval(y);

  // ============================================================================
  // Memoized Calculations
  // ============================================================================

  /**
   * Clip sessions to this day's boundaries.
   * Sessions spanning midnight are clipped to show only the portion within this day.
   */
  const clippedSessions = useMemo(
    () => sessions.map((s) => clipSessionToDay(s, dayStart, dayEnd)),
    [sessions, dayStart, dayEnd]
  );

  /**
   * Clip appointments to this day's boundaries.
   * Multi-day appointments are clipped to show only the portion within this day.
   */
  const clippedAppointments = useMemo(
    () => appointments.map((a) => clipAppointmentToDay(a, dayStart, dayEnd)),
    [appointments, dayStart, dayEnd]
  );

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle click for new session creation.
   * First click sets start position, second click sets end position.
   */
  function handleNewSessionClick(newY: number) {
    if (!addingMode) return;

    if (startNewSession === null) {
      setStartNewSession(newY);
      setNewSessionDay(day);
    } else {
      setEndNewSession(newY);
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Box
      ref={hoverRef}
      onClick={() => handleNewSessionClick(snapYToInterval(y))}
    >
      <Box
        style={{
          position: "relative",
          height: columnHeight,
          border: isDayToday
            ? "2px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-3))"
            : "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-6))",
          borderRadius: 0,
          background: isDayToday
            ? "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))"
            : undefined,
          overflow: "hidden",
        }}
      >
        {/* Hourly grid lines */}
        <GridLines count={gridLineCount} rasterHeight={rasterHeight} />

        {/* Current time indicator (red line + highlight) - only for today */}
        {isDayToday && (
          <>
            <TimeTrackerEvent
              toY={timeToY}
              currentTime={currentTime}
              day={day}
            />
            <CurrentTimeHighlight
              timeToY={timeToY}
              currentTime={currentTime}
              rasterHeight={rasterHeight}
            />
          </>
        )}

        {/* New session creation indicator */}
        {!isFetching && addingMode && hovered && startNewSession === null && (
          <NewSessionIndicator
            snappedY={snappedY}
            yToTime={yToTime}
            day={day}
            formatDateTime={formatDateTime}
          />
        )}

        {/* New session preview while dragging */}
        {!isFetching && startNewSession !== null && newSessionDay === day && (
          <NewSessionEvent
            start={snapYToInterval(startNewSession)}
            y={snappedY}
            yToTime={(y) => yToTime(y, day)}
          />
        )}

        {/* Loading skeletons or actual events */}
        {isFetching ? (
          <LoadingSkeletons
            count={SKELETON_COUNT}
            rasterHeight={rasterHeight}
          />
        ) : (
          <Box>
            {/* Sessions */}
            {clippedSessions.map((session) => (
              <CalendarTimeEntryEvent
                key={session.id}
                isNewTimeEntry={startNewSession !== null}
                s={session}
                toY={timeToY}
                handleSessionClick={handleSessionClick}
                color={session.color}
              />
            ))}

            {/* Appointments */}
            {clippedAppointments.map((appointment) => (
              <Box
                key={appointment.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAppointmentClick?.(appointment.id);
                }}
              >
                <CalendarAppointmentEvent
                  a={appointment}
                  toY={timeToY}
                  color={appointment.color}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Renders horizontal grid lines for each hour/time unit
 */
function GridLines({
  count,
  rasterHeight,
}: {
  count: number;
  rasterHeight: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) =>
        i !== 0 ? (
          <Box
            key={`line-${i}`}
            style={{
              position: "absolute",
              top: i * rasterHeight,
              left: 0,
              right: 0,
              height: 1,
              borderTop:
                "1px dashed light-dark(var(--mantine-color-gray-8), var(--mantine-color-gray-2))",
              background: "none",
              pointerEvents: "none",
            }}
          />
        ) : null
      )}
    </>
  );
}

/**
 * Semi-transparent highlight around current time
 */
function CurrentTimeHighlight({
  timeToY,
  currentTime,
  rasterHeight,
}: {
  timeToY: (date: Date) => number;
  currentTime: Date;
  rasterHeight: number;
}) {
  return (
    <Box
      style={{
        background: alpha("var(--mantine-color-red-6)", 0.3),
        position: "absolute",
        top: timeToY(currentTime) - rasterHeight / 2,
        left: 0,
        right: 0,
        height: rasterHeight,
        pointerEvents: "none",
      }}
    />
  );
}

/**
 * Line indicator shown when hovering in adding mode
 */
function NewSessionIndicator({
  snappedY,
  yToTime,
  day,
  formatDateTime,
}: {
  snappedY: number;
  yToTime: (y: number, day: Date) => Date;
  day: Date;
  formatDateTime: (date: Date) => string;
}) {
  return (
    <Stack
      style={{
        position: "absolute",
        top: snappedY - 2,
        left: 0,
        right: 0,
        borderTop:
          "3px solid light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-7))",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <Text ta="center">{formatDateTime(yToTime(snappedY, day))}</Text>
    </Stack>
  );
}

/**
 * Loading skeleton placeholders
 */
function LoadingSkeletons({
  count,
  rasterHeight,
}: {
  count: number;
  rasterHeight: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={`skeleton-${i}`}
          height={rasterHeight + i * 3}
          w="90%"
          mx="auto"
          style={{
            position: "absolute",
            top: i * (rasterHeight + i * 3 + 30),
            border:
              "1px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-gray-4))",
            borderLeft:
              "6px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-gray-6))",
          }}
        />
      ))}
    </>
  );
}
