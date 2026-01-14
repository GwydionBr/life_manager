import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useMouse,
  useDisclosure,
  useHover,
  useThrottledValue,
} from "@mantine/hooks";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import { useIntl } from "@/hooks/useIntl";

import { Grid, Stack, Group, Box, Text } from "@mantine/core";
import { DayColumn } from "@/components/WorkCalendar/DayColumn";
import { TimeColumn } from "@/components/WorkCalendar/TimeColumn";
import ColumnHeader from "@/components/WorkCalendar/Calendar/ColumnHeader";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";
import NewCalendarEntryModal from "@/components/WorkCalendar/CalendarEntry/NewCalendarEntryModal";

import { clamp } from "@/components/WorkCalendar/calendarUtils";
import { startOfDay } from "date-fns";

import { CalendarDay } from "@/types/workCalendar.types";
import { WorkProject } from "@/types/work.types";

// ============================================================================
// Types
// ============================================================================

interface CalendarGridProps {
  /** Array of calendar days with sessions and appointments */
  days: CalendarDay[];
  /** Whether data is currently loading */
  isFetching: boolean;
  /** Zoom level multiplier for hour height */
  hourMultiplier: number;
  /** Base height for one hour in pixels */
  rasterHeight: number;
  /** Callback to set reference date (for day view navigation) */
  setReferenceDate: (date: Date) => void;
  /** Callback when a session is clicked */
  handleSessionClick: (sessionId: string) => void;
  /** Callback when an appointment is clicked */
  handleAppointmentClick?: (appointmentId: string) => void;
  /** Callback for prev/next navigation */
  handleNextAndPrev: (direction: number) => void;
  /** Projects visible in the current view */
  visibleProjects: WorkProject[];
}

// ============================================================================
// Constants
// ============================================================================

/** Update interval for current time indicator (ms) */
const TIME_UPDATE_INTERVAL = 5000;

// ============================================================================
// Component
// ============================================================================

/**
 * Main calendar grid component.
 * Displays day columns with time slots, sessions, and appointments.
 * Handles new session creation via click-drag interaction.
 */
export default function CalendarGrid({
  days,
  isFetching,
  hourMultiplier,
  rasterHeight,
  visibleProjects,
  setReferenceDate,
  handleSessionClick,
  handleAppointmentClick,
  handleNextAndPrev,
}: CalendarGridProps) {
  // ============================================================================
  // State
  // ============================================================================

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // New session creation state
  const [startNewSession, setStartNewSession] = useState<number | null>(null);
  const [endNewSession, setEndNewSession] = useState<number | null>(null);
  const [newSessionDay, setNewSessionDay] = useState<Date | null>(null);

  const [
    sessionFormModalOpened,
    { open: openSessionFormModal, close: closeSessionFormModal },
  ] = useDisclosure(false);

  // ============================================================================
  // Store & Hooks
  // ============================================================================

  const { addingMode } = useCalendarStore();
  const { formatDateTime } = useIntl();
  const { data: settings } = useSettings();

  const { ref, x, y } = useMouse();
  const throttledY = useThrottledValue(y, 50);
  const throttledX = useThrottledValue(x, 50);
  const { hovered, ref: hoverRef } = useHover();

  // ============================================================================
  // Effects
  // ============================================================================

  // Update current time periodically for the time indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, TIME_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // Time Conversion Functions
  // ============================================================================

  /**
   * Converts a Date to Y-position (pixels) within the day timeline.
   * Used for positioning events and the current time indicator.
   */
  const timeToY = useCallback(
    (date: Date): number => {
      const minutes = date.getHours() * 60 + date.getMinutes();
      const totalMinutes = 24 * 60;
      const yPos =
        (minutes / totalMinutes) *
        (totalMinutes / 60) *
        rasterHeight *
        hourMultiplier;
      return clamp(yPos, 0, 24 * rasterHeight * hourMultiplier);
    },
    [rasterHeight, hourMultiplier]
  );

  /**
   * Converts Y-position (pixels) to a Date for the given day.
   * Inverse function of timeToY - used for determining time from click position.
   */
  const yToTime = useCallback(
    (yPos: number, day: Date): Date => {
      const minutes = (yPos / (rasterHeight * hourMultiplier)) * 60;
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
    },
    [rasterHeight, hourMultiplier]
  );

  /**
   * Snaps Y-position to the nearest time interval boundary.
   * Respects the user's configured rounding settings.
   */
  const snapYToInterval = useCallback(
    (inputY: number, day: Date): number => {
      if (!settings?.round_in_time_sections || !settings?.time_section_interval)
        return inputY;

      const date = yToTime(inputY, day);
      const totalMinutes = date.getHours() * 60 + date.getMinutes();
      const minutesToRound = totalMinutes % settings.time_section_interval;

      // Round to nearest interval boundary
      const minutesToAdd =
        minutesToRound > settings.time_section_interval / 2
          ? settings.time_section_interval - minutesToRound
          : -minutesToRound;

      const totalMinutesRounded = totalMinutes + minutesToAdd;
      const snapped = new Date(date);
      const hours = Math.floor(totalMinutesRounded / 60);
      const minutes = totalMinutesRounded % 60;
      snapped.setHours(hours, minutes, 0, 0);

      return Math.round(timeToY(snapped));
    },
    [settings, yToTime, timeToY]
  );

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle grid click for new session creation.
   * Opens the modal when both start and end positions are set.
   */
  function handleClick() {
    if (newSessionDay && startNewSession) {
      openSessionFormModal();
    }
  }

  /**
   * Reset new session state when modal closes
   */
  function handleCloseModal() {
    closeSessionFormModal();
    setStartNewSession(null);
    setNewSessionDay(null);
  }

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Calculate initial dates for new entry modal
   */
  const newEntryDates = useMemo(() => {
    if (!newSessionDay || !startNewSession || !endNewSession) {
      return undefined;
    }

    const startY = Math.min(startNewSession, endNewSession);
    const endY = Math.max(startNewSession, endNewSession);
    const startTime = yToTime(startY, newSessionDay);
    const endTime = yToTime(endY, newSessionDay);

    return {
      startDate: startTime,
      endDate: endTime,
    };
  }, [newSessionDay, startNewSession, endNewSession, yToTime]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Box w="100%">
      <Stack w="100%">
        {/* Sticky Header with Navigation and Day Labels */}
        <CalendarHeader
          days={days}
          visibleProjects={visibleProjects}
          setReferenceDate={setReferenceDate}
          handleNextAndPrev={handleNextAndPrev}
        />

        {/* Main Calendar Body */}
        <Group gap={0} wrap="nowrap" align="flex-start" pb="lg">
          {/* Left Time Column */}
          <Stack w={42} align="center">
            <TimeColumn
              hourHeight={rasterHeight}
              hourMultiplier={hourMultiplier}
              currentTime={currentTime}
              timeToY={timeToY}
            />
          </Stack>

          {/* Day Columns Container */}
          <Stack
            h="100%"
            gap={10}
            w="100%"
            mb="xl"
            style={{
              borderLeft:
                "4px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))",
              borderRight:
                "4px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))",
              borderTop:
                "4px solid light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-6))",
              borderBottom:
                "4px solid light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-6))",
            }}
          >
            <Box
              ref={hoverRef}
              style={{ position: "relative", overflow: "hidden" }}
            >
              <Grid
                columns={days.length}
                gutter={0}
                align="flex-end"
                ref={ref}
                onClick={handleClick}
              >
                {/* Floating time tooltip when hovering (not in adding mode) */}
                {!addingMode && hovered && settings?.show_calendar_time && (
                  <FloatingTimeTooltip
                    x={throttledX}
                    y={throttledY}
                    formatDateTime={formatDateTime}
                    yToTime={yToTime}
                  />
                )}

                {/* Day Columns */}
                {days.map((day) => (
                  <Grid.Col
                    span={1}
                    key={`day-${startOfDay(day.day).toISOString().slice(0, 10)}`}
                  >
                    <DayColumn
                      day={day.day}
                      y={throttledY}
                      yToTime={yToTime}
                      timeToY={timeToY}
                      isFetching={isFetching}
                      currentTime={currentTime}
                      sessions={day.sessions}
                      appointments={day.appointments}
                      handleSessionClick={handleSessionClick}
                      handleAppointmentClick={handleAppointmentClick}
                      hourMultiplier={hourMultiplier}
                      rasterHeight={rasterHeight}
                      startNewSession={startNewSession}
                      setStartNewSession={setStartNewSession}
                      newSessionDay={newSessionDay}
                      setNewSessionDay={setNewSessionDay}
                      setEndNewSession={setEndNewSession}
                      snapYToInterval={(yPos) => snapYToInterval(yPos, day.day)}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            </Box>
          </Stack>

          {/* Right Time Column */}
          <Stack w={42} align="center">
            <TimeColumn
              hourHeight={rasterHeight}
              hourMultiplier={hourMultiplier}
              currentTime={currentTime}
              timeToY={timeToY}
            />
          </Stack>
        </Group>
      </Stack>

      {/* New Calendar Entry Modal */}
      <NewCalendarEntryModal
        opened={sessionFormModalOpened}
        onClose={handleCloseModal}
        initialStartDate={newEntryDates?.startDate}
        initialEndDate={newEntryDates?.endDate}
      />
    </Box>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Sticky calendar header with navigation arrows and day labels
 */
function CalendarHeader({
  days,
  visibleProjects,
  setReferenceDate,
  handleNextAndPrev,
}: {
  days: CalendarDay[];
  visibleProjects: WorkProject[];
  setReferenceDate: (date: Date) => void;
  handleNextAndPrev: (direction: number) => void;
}) {
  return (
    <Group
      gap={0}
      wrap="nowrap"
      w="100%"
      bg="var(--mantine-color-body)"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom:
          "2px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))",
      }}
    >
      {/* Previous Button */}
      <Box w={49}>
        <ColumnHeader
          icon={<PrevActionIcon onClick={() => handleNextAndPrev(-1)} />}
          visibleProjects={visibleProjects}
        />
      </Box>

      {/* Day Headers */}
      <Grid
        w="100%"
        columns={days.length}
        gutter={0}
        align="flex-end"
        style={{
          position: "sticky",
          top: 60,
          zIndex: 20,
          background: "var(--mantine-color-body)",
        }}
      >
        {days.map((day) => (
          <Grid.Col
            span={1}
            key={`header-${startOfDay(day.day).toISOString().slice(0, 10)}`}
          >
            <ColumnHeader
              day={day}
              setReferenceDate={setReferenceDate}
              visibleProjects={visibleProjects}
            />
          </Grid.Col>
        ))}
      </Grid>

      {/* Next Button */}
      <Box w={49}>
        <ColumnHeader
          icon={<NextActionIcon onClick={() => handleNextAndPrev(1)} />}
          visibleProjects={visibleProjects}
        />
      </Box>
    </Group>
  );
}

/**
 * Floating tooltip showing time at current mouse position
 */
function FloatingTimeTooltip({
  x,
  y,
  formatDateTime,
  yToTime,
}: {
  x: number;
  y: number;
  formatDateTime: (date: Date) => string;
  yToTime: (y: number, day: Date) => Date;
}) {
  return (
    <Stack
      style={{
        position: "absolute",
        top: y + 20,
        left: x,
        background: "transparent",
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      <Text>{formatDateTime(yToTime(y, new Date()))}</Text>
    </Stack>
  );
}
