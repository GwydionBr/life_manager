import { useEffect, useState } from "react";
import { useMouse, useDisclosure, useHover } from "@mantine/hooks";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";

import { Grid, Stack, Group, Box, Text } from "@mantine/core";
import { DayColumn } from "@/components/WorkCalendar/DayColumn";
import { TimeColumn } from "@/components/WorkCalendar/TimeColumn";
import ColumnHeader from "@/components/WorkCalendar/Calendar/ColumnHeader";
import PrevActionIcon from "@/components/UI/ActionIcons/PrevActionIcon";
import NextActionIcon from "@/components/UI/ActionIcons/NextActionIcon";
import NewSessionModal from "@/components/Work/WorkTimeEntry/NewTimeEntryModal";

import { clamp } from "@/components/WorkCalendar/calendarUtils";

import { getStartOfDay } from "@/components/WorkCalendar/calendarUtils";

import { CalendarDay } from "@/types/workCalendar.types";
import { WorkProject } from "@/types/work.types";

interface CalendarGridProps {
  days: CalendarDay[];
  isFetching: boolean;
  hourMultiplier: number;
  rasterHeight: number;
  setReferenceDate: (date: Date) => void;
  handleSessionClick: (sessionId: string) => void;
  handleAppointmentClick?: (appointmentId: string) => void;
  handleNextAndPrev: (direction: number) => void;
  visibleProjects: WorkProject[];
}
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
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [startNewSession, setStartNewSession] = useState<number | null>(null);
  const [endNewSession, setEndNewSession] = useState<number | null>(null);
  const [newSessionDay, setNewSessionDay] = useState<Date | null>(null);
  const [
    sessionFormModalOpened,
    { open: openSessionFormModal, close: closeSessionFormModal },
  ] = useDisclosure(false);
  const { addingMode } = useCalendarStore();
  const {
    default_currency,
    default_salary_amount,
    default_project_hourly_payment,
    rounding_interval,
    round_in_time_sections,
    show_calendar_time,
  } = useSettingsStore();
  const { formatDateTime } = useIntl();

  const { ref, x, y } = useMouse();
  const { hovered, ref: hoverRef } = useHover();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  function handleClick() {
    if (newSessionDay && startNewSession) {
      openSessionFormModal();
      return;
    }
  }

  const timeToY = (date: Date) => {
    // Convert a date to a Y-position within the day timeline
    const minutes = date.getHours() * 60 + date.getMinutes();
    const totalMinutes = 24 * 60;
    const y =
      (minutes / totalMinutes) *
      (totalMinutes / 60) *
      rasterHeight *
      hourMultiplier;
    return clamp(y, 0, 24 * rasterHeight * hourMultiplier);
  };

  // yToTime soll die exakte Umkehrfunktion von timeToY sein, ohne Rundungsfehler.
  const yToTime = (y: number, day: Date) => {
    const minutes = (y / (rasterHeight * hourMultiplier)) * 60;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes - hours * 60); // exaktere Minutenberechnung
    return new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hours,
      mins,
      0,
      0
    );
  };

  function snapYToInterval(inputY: number, day: Date) {
    if (!round_in_time_sections || !rounding_interval) return inputY;
    const date = yToTime(inputY, day);
    const totalMinutes = date.getHours() * 60 + date.getMinutes();
    const minutesToRound = totalMinutes % rounding_interval;
    const minutesToAdd =
      minutesToRound > rounding_interval / 2
        ? rounding_interval - minutesToRound
        : -minutesToRound;
    const totalMinutesRounded = totalMinutes + minutesToAdd;
    const snapped = new Date(date);
    const hours = Math.floor(totalMinutesRounded / 60);
    const minutes = totalMinutesRounded % 60;
    snapped.setHours(hours, minutes, 0, 0);
    return Math.round(timeToY(snapped));
  }

  return (
    <Box w="100%">
      <Stack w="100%">
        {/* Header */}
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
          <Box w={49}>
            <ColumnHeader
              icon={<PrevActionIcon onClick={() => handleNextAndPrev(-1)} />}
              visibleProjects={visibleProjects}
            />
          </Box>
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
            {days.map((d) => {
              return (
                <Grid.Col
                  span={1}
                  key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
                >
                  <ColumnHeader
                    day={d}
                    setReferenceDate={setReferenceDate}
                    visibleProjects={visibleProjects}
                  />
                </Grid.Col>
              );
            })}
          </Grid>
          <Box w={49}>
            <ColumnHeader
              icon={<NextActionIcon onClick={() => handleNextAndPrev(1)} />}
              visibleProjects={visibleProjects}
            />
          </Box>
        </Group>
        {/* Body */}
        <Group gap={0} wrap="nowrap" align="flex-start" pb="lg">
          <Stack w={42} align="center">
            <TimeColumn
              hourHeight={rasterHeight}
              hourMultiplier={hourMultiplier}
              currentTime={currentTime}
              timeToY={timeToY}
            />
          </Stack>
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
                {!addingMode && hovered && show_calendar_time && (
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
                )}
                {days.map((d) => {
                  return (
                    <Grid.Col
                      span={1}
                      key={`day-${getStartOfDay(d.day).toISOString().slice(0, 10)}`}
                    >
                      <DayColumn
                        day={d.day}
                        y={y}
                        yToTime={yToTime}
                        timeToY={timeToY}
                        isFetching={isFetching}
                        currentTime={currentTime}
                        sessions={d.sessions}
                        appointments={d.appointments}
                        handleSessionClick={handleSessionClick}
                        handleAppointmentClick={handleAppointmentClick}
                        hourMultiplier={hourMultiplier}
                        rasterHeight={rasterHeight}
                        startNewSession={startNewSession}
                        setStartNewSession={setStartNewSession}
                        newSessionDay={newSessionDay}
                        setNewSessionDay={setNewSessionDay}
                        setEndNewSession={setEndNewSession}
                        snapYToInterval={(y) => snapYToInterval(y, d.day)}
                      />
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Box>
          </Stack>
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

      <NewSessionModal
        opened={sessionFormModalOpened}
        onClose={() => {
          closeSessionFormModal();
          setStartNewSession(null);
          setNewSessionDay(null);
        }}
        initialValues={
          newSessionDay && startNewSession && endNewSession
            ? {
                start_time: yToTime(
                  Math.min(startNewSession, endNewSession),
                  newSessionDay
                ).toISOString(),
                end_time: yToTime(
                  Math.max(startNewSession, endNewSession),
                  newSessionDay
                ).toISOString(),
                active_seconds:
                  (new Date(
                    yToTime(
                      Math.max(startNewSession, endNewSession),
                      newSessionDay
                    )
                  ).getTime() -
                    new Date(
                      yToTime(
                        Math.min(startNewSession, endNewSession),
                        newSessionDay
                      )
                    ).getTime()) /
                  1000,
                paused_seconds: 0,
                currency: default_currency,
                salary: default_salary_amount,
                hourly_payment: default_project_hourly_payment,
              }
            : undefined
        }
      />
    </Box>
  );
}
