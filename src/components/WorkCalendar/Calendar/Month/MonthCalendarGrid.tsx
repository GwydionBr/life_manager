import { useMemo } from "react";
import { useViewportSize } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useCalendarStore } from "@/stores/calendarStore";

import { Grid, Stack, Box, Text } from "@mantine/core";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  startOfDay,
} from "date-fns";
import { de } from "date-fns/locale";

import { CalendarDay } from "@/types/workCalendar.types";
import { MonthDayCell } from "./MonthDayCell";

interface MonthCalendarGridProps {
  /** Array of calendar days with sessions and appointments */
  days: CalendarDay[];
  /** Callback when a session is clicked */
  handleSessionClick: (sessionId: string) => void;
  /** Callback when an appointment is clicked */
  handleAppointmentClick?: (appointmentId: string) => void;
  /** Callback for prev/next navigation */
  handleNextAndPrev: (direction: number) => void;
  /** Callback when a day cell is clicked */
  handleDayClick: (date: Date) => void;
}

/** Weekday names (Monday = 0) */
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * Month calendar grid component.
 * Displays a 7×5-6 grid of day cells with events as compact chips.
 */
export default function MonthCalendarGrid({
  days,
  handleSessionClick,
  handleAppointmentClick,
  handleDayClick,
}: MonthCalendarGridProps) {
  const { getWeekdayName } = useIntl();
  const { monthViewDate } = useCalendarStore();
  const { height } = useViewportSize();

  // Get the first day of the month
  const monthStart = startOfMonth(monthViewDate);
  const monthEnd = endOfMonth(monthViewDate);

  // Get the start of the week containing the first day of the month
  const calendarStart = startOfWeek(monthStart, { locale: de });
  // Get the end of the week containing the last day of the month
  const calendarEnd = endOfWeek(monthEnd, { locale: de });

  // Generate all days in the calendar view (including previous/next month days)
  const calendarDays = useMemo(() => {
    const daysArray: Date[] = [];
    let currentDay = calendarStart;

    while (currentDay <= calendarEnd) {
      daysArray.push(new Date(currentDay));
      currentDay = addDays(currentDay, 1);
    }

    return daysArray;
  }, [calendarStart, calendarEnd]);

  // Create a map of date strings to CalendarDay for quick lookup
  const daysMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    days.forEach((day) => {
      const key = startOfDay(day.day).toISOString().slice(0, 10);
      map.set(key, day);
    });
    return map;
  }, [days]);

  // Get weekday names for header
  const weekdayNames = useMemo(() => {
    return WEEKDAYS.map((dayIndex) =>
      getWeekdayName(dayIndex === 0 ? 7 : dayIndex, "short")
    );
  }, [getWeekdayName]);

  // Group days into weeks (7 days per week)
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeksArray.push(calendarDays.slice(i, i + 7));
    }
    return weeksArray;
  }, [calendarDays]);

  const cellHeight = useMemo(
    () => (height - 145) / weeks.length,
    [height, weeks.length]
  );

  return (
    <Box w="100%" h="100%">
      <Stack w="100%">
        {/* Month Grid */}
        <Box
          style={{
            border:
              "3px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))",
          }}
        >
          {/* Weekday Headers */}
          <Grid columns={7} gutter={0}>
            {weekdayNames.map((dayName, index) => (
              <Grid.Col span={1} key={`header-${index}`}>
                <Box
                  p="xs"
                  ta="center"
                  fw={600}
                  style={{
                    borderBottom:
                      "2px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))",
                    background:
                      "light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))",
                  }}
                >
                  <Text size="sm">{dayName}</Text>
                </Box>
              </Grid.Col>
            ))}
          </Grid>

          {/* Week Rows */}
          {weeks.map((week, weekIndex) => (
            <Grid columns={7} gutter={0} key={`week-${weekIndex}`}>
              {week.map((day) => {
                const dayKey = startOfDay(day).toISOString().slice(0, 10);
                const calendarDay = daysMap.get(dayKey);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                return (
                  <Grid.Col span={1} key={`day-${dayKey}`}>
                    <MonthDayCell
                      day={day}
                      height={cellHeight}
                      calendarDay={calendarDay}
                      isCurrentMonth={isCurrentMonth}
                      isToday={isTodayDate}
                      handleDayClick={handleDayClick}
                      handleSessionClick={handleSessionClick}
                      handleAppointmentClick={handleAppointmentClick}
                    />
                  </Grid.Col>
                );
              })}
            </Grid>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}

/**
 * Individual day cell in the month grid
 */
