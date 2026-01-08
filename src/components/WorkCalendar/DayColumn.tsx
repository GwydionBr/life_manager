import { useHover, useHotkeys } from "@mantine/hooks";
import { useCalendarStore } from "@/stores/calendarStore";
import { useIntl } from "@/hooks/useIntl";

import { alpha, Box, Skeleton, Stack, Text } from "@mantine/core";

import { getStartOfDay, getEndOfDay, isToday } from "./calendarUtils";
import { CalendarSession } from "@/types/workCalendar.types";
import CalendarSessionEvent from "./CalendarEvent/CalendarSessionEvent";
import TimeTrackerEvent from "./CalendarEvent/TimeTrackerEvent/TimeTrackerEvent";
import NewSessionEvent from "./CalendarEvent/NewSessionEvent";

interface DayColumnProps {
  day: Date;
  y: number;
  yToTime: (y: number, day: Date) => Date;
  timeToY: (date: Date) => number;
  isFetching: boolean;
  currentTime: Date;
  sessions: CalendarSession[];
  handleSessionClick: (sessionId: string) => void;
  hourMultiplier: number;
  rasterHeight: number;
  startNewSession: number | null;
  setStartNewSession: (y: number | null) => void;
  newSessionDay: Date | null;
  setNewSessionDay: (day: Date | null) => void;
  setEndNewSession: (y: number | null) => void;
  snapYToInterval: (y: number) => number;
}

export function DayColumn({
  day,
  y,
  yToTime,
  timeToY,
  isFetching,
  currentTime,
  sessions,
  handleSessionClick,
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
  useHotkeys([["escape", () => setStartNewSession(null)]]);

  // Clip sessions to the visible day window so cross-midnight sessions
  // render only the portion within this column. This avoids negative/overflowing heights.
  const dayStart = getStartOfDay(day);
  const dayEnd = getEndOfDay(day);

  const clippedItems: CalendarSession[] = sessions.map((s) => {
    const sStart = new Date(s.start_time);
    const sEnd = new Date(s.end_time);
    const start = sStart < dayStart ? dayStart : sStart;
    const end = sEnd > dayEnd ? dayEnd : sEnd;
    return {
      id: s.id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      work_project_id: s.work_project_id,
      memo: s.memo,
      single_cashflow_id: s.single_cashflow_id,
      active_seconds: s.active_seconds,
      projectTitle: s.projectTitle,
      color: s.color,
      currency: s.currency,
      salary: s.salary,
    };
  });

  const snappedY = snapYToInterval(y);

  function handleNewSessionClick(newY: number) {
    if (!addingMode) return;

    if (startNewSession === null) {
      setStartNewSession(newY);
      setNewSessionDay(day);
    } else {
      setEndNewSession(newY);
    }
  }

  return (
    <Box
      ref={hoverRef}
      onClick={() => handleNewSessionClick(snapYToInterval(y))}
    >
      <Box
        style={{
          position: "relative",
          height: rasterHeight * 24 * hourMultiplier,
          border: isToday(day)
            ? "2px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-3))"
            : "1px solid light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-6))",
          borderRadius: 0,
          background: isToday(day)
            ? "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))"
            : "",
          overflow: "hidden",
        }}
      >
        {/* Grid lines */}
        {Array.from(
          { length: 24 * hourMultiplier + 1 },
          (_, i) =>
            i !== 0 && (
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
            )
        )}

        {/* Current time indicator - red line for today */}
        <TimeTrackerEvent toY={timeToY} currentTime={currentTime} day={day} />

        <Box
          style={{
            background: alpha("var(--mantine-color-red-6)", 0.3),
            position: "absolute",
            top: timeToY(currentTime) - rasterHeight / 2,
            left: 0,
            right: 0,
            height: rasterHeight,
          }}
        />

        {/* New session event */}
        {!isFetching && addingMode && hovered && startNewSession === null && (
          <Stack
            style={{
              position: "absolute",
              top: snappedY - 2,
              left: 0,
              right: 0,
              borderTop:
                "3px solid light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-7))",
              zIndex: 10,
            }}
          >
            <Text ta="center">{formatDateTime(yToTime(snappedY, day))}</Text>
          </Stack>
        )}

        {!isFetching && startNewSession !== null && newSessionDay === day && (
          <NewSessionEvent
            start={snapYToInterval(startNewSession)}
            y={snappedY}
            yToTime={(y) => yToTime(y, day)}
          />
        )}

        {isFetching ? (
          Array.from({ length: 24 }, (_, i) => (
            <Skeleton
              key={`line-${i}`}
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
          ))
        ) : (
          <Box>
            {clippedItems.map((s) => {
              return (
                <CalendarSessionEvent
                  key={s.id}
                  isNewSession={startNewSession !== null}
                  s={s}
                  toY={timeToY}
                  handleSessionClick={handleSessionClick}
                  color={s.color}
                />
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
