import { useHover } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useMemo } from "react";

import {
  Box,
  Card,
  Group,
  HoverCard,
  Stack,
  Text,
  Indicator,
} from "@mantine/core";

import { CalendarDay } from "@/types/workCalendar.types";
import { calculateSessionTimeForDay } from "../calendarUtils";
import { isToday } from "date-fns";
import { TimerState } from "@/types/timeTracker.types";
import { WorkProject } from "@/types/work.types";

interface ColumnHeaderProps {
  day?: CalendarDay;
  setReferenceDate?: (date: Date) => void;
  icon?: React.ReactNode;
  visibleProjects: WorkProject[];
}

export default function ColumnHeader({
  day,
  setReferenceDate,
  icon,
  visibleProjects,
}: ColumnHeaderProps) {
  const { hovered, ref } = useHover();
  const { formatDate, formatMoney, formatDuration } = useIntl();
  const { isTimerRunning, timers } = useTimeTrackerManager();
  const timer = useMemo(
    () => Object.values(timers).find((t) => t.state === TimerState.Running),
    [timers]
  );
  const isDayToday = day ? isToday(day.day) : false;
  const totalTime = useMemo(() => {
    if (!day) return 0;
    return day.sessions.reduce(
      (acc, session) => acc + calculateSessionTimeForDay(session, day.day),
      0
    );
  }, [day]);

  return (
    <HoverCard
      openDelay={300}
      closeDelay={100}
      disabled={!day || visibleProjects.length === 0 || totalTime === 0}
      position="bottom"
    >
      <HoverCard.Target>
        <Stack
          p={5}
          h="100%"
          align="center"
          onClick={() => {
            if (setReferenceDate && day) {
              setReferenceDate(day.day);
            }
          }}
          ref={ref}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            cursor: day ? "pointer" : "default",
            border: isDayToday
              ? "2px solid light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
              : day
                ? "1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))"
                : "none",
            backgroundColor: isDayToday
              ? hovered
                ? "light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-5))"
                : "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))"
              : hovered && day
                ? "light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))"
                : "var(--mantine-color-body)",
            borderTopLeftRadius: day ? 6 : 0,
            borderTopRightRadius: day ? 6 : 0,
          }}
        >
          {icon && icon}
          {day && (
            <Stack gap={4}>
              <Text fw={600}>{formatDate(day.day)}</Text>
              <Group justify="center">
                {timer && isToday(day.day) && (
                  <Indicator
                    size={10}
                    color="red"
                    processing={timer.state === TimerState.Running}
                  />
                )}
                <Text size="xs" c="dimmed" fw={500} ta="center">
                  {formatDuration(
                    totalTime +
                      (isToday(day.day) && isTimerRunning
                        ? (timer?.activeSeconds ?? 0)
                        : 0)
                  )}
                </Text>
              </Group>
            </Stack>
          )}
        </Stack>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap={4}>
          {visibleProjects.map((p) => {
            const totalTime =
              day?.sessions.reduce(
                (acc, session) =>
                  session.work_project_id === p.id
                    ? acc + calculateSessionTimeForDay(session, day.day)
                    : acc,
                0
              ) ?? 0;
            const earnings = (p.salary * totalTime) / 3600;

            if (totalTime === 0) return null;
            return (
              <Card withBorder key={p.id}>
                <Group>
                  <Box
                    w={10}
                    h={10}
                    bg={p.color ?? "var(--mantine-color-teal-6)"}
                    style={{ borderRadius: 5 }}
                  />
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>
                      {p.title}
                    </Text>
                    <Text size="xs" c="dimmed" fw={500}>
                      {formatDuration(totalTime)}
                    </Text>
                    {earnings > 0 && (
                      <Text size="xs" c="dimmed" fw={500}>
                        {formatMoney(earnings, p.currency)}
                      </Text>
                    )}
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
