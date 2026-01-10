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
  Divider,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import {
  IconClock,
  IconCurrencyEuro,
  IconCurrencyDollar,
  IconCalendar,
  IconHourglass,
} from "@tabler/icons-react";

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
  const { formatDate, formatMoney, formatDuration, getLocalizedText } = useIntl();
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
        <Card
          p="sm"
          h="100%"
          onClick={() => {
            if (setReferenceDate && day) {
              setReferenceDate(day.day);
            }
          }}
          ref={ref}
          withBorder={!!day}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            cursor: day ? "pointer" : "default",
            border: isDayToday
              ? "2px solid light-dark(var(--mantine-color-blue-6), var(--mantine-color-blue-5))"
              : day
                ? "1px solid light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-4))"
                : "none",
            backgroundColor: isDayToday
              ? hovered
                ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-6))"
                : "light-dark(var(--mantine-color-blue-1), var(--mantine-color-dark-7))"
              : hovered && day
                ? "light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))"
                : "var(--mantine-color-body)",
            borderTopLeftRadius: day ? 8 : 0,
            borderTopRightRadius: day ? 8 : 0,
            transition: "all 0.2s ease",
            boxShadow: hovered && day ? "var(--mantine-shadow-sm)" : "none",
          }}
        >
          <Stack gap="xs" align="center" justify="center" h="100%">
            {icon && (
              <Box style={{ opacity: isDayToday ? 1 : 0.7 }}>{icon}</Box>
            )}
            {day && (
              <Stack gap={6} align="center" w="100%">
                <Group gap={6} justify="center" wrap="nowrap">
                  {isDayToday && (
                    <Badge
                      size="xs"
                      variant="light"
                      color="blue"
                      leftSection={<IconCalendar size={12} />}
                    >
                      {getLocalizedText("Heute", "Today")}
                    </Badge>
                  )}
                  {!isDayToday && (
                    <Text fw={700} size="sm" c="dimmed">
                      {formatDate(day.day)}
                    </Text>
                  )}
                  {isDayToday && (
                    <Text fw={700} size="sm">
                      {formatDate(day.day)}
                    </Text>
                  )}
                </Group>
                <Group justify="center" gap={6} wrap="nowrap">
                  {timer && isToday(day.day) && (
                    <Indicator
                      size={12}
                      color="red"
                      processing={timer.state === TimerState.Running}
                      withBorder
                    />
                  )}
                  <Group gap={4} wrap="nowrap">
                    <IconHourglass size={14} strokeWidth={1.5} />
                    <Badge
                      variant="light"
                      size="sm"
                      color={isDayToday ? "blue" : "gray"}
                      style={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {formatDuration(
                        totalTime +
                          (isToday(day.day) && isTimerRunning
                            ? (timer?.activeSeconds ?? 0)
                            : 0)
                      )}
                    </Badge>
                  </Group>
                </Group>
              </Stack>
            )}
          </Stack>
        </Card>
      </HoverCard.Target>
      <HoverCard.Dropdown
        style={{
          border:
            "1px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-2))",
          boxShadow: "var(--mantine-shadow-sm)",
        }}
      >
        <Stack gap="xs" p="xs">
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
              <Card
                key={p.id}
                withBorder
                p="sm"
                style={{
                  borderLeft: `4px solid ${p.color ?? "var(--mantine-color-teal-6)"}`,
                }}
              >
                <Stack gap="xs">
                  <Group gap="sm" align="flex-start">
                    <ThemeIcon
                      size="md"
                      radius="xl"
                      variant="light"
                      color={p.color ?? "teal"}
                    >
                      <Box
                        w={8}
                        h={8}
                        bg={p.color ?? "var(--mantine-color-teal-6)"}
                        style={{ borderRadius: "50%" }}
                      />
                    </ThemeIcon>
                    <Stack gap={2} style={{ flex: 1 }}>
                      <Text size="sm" fw={600}>
                        {p.title}
                      </Text>
                      <Group gap="md" mt={4}>
                        <Group gap={4}>
                          <IconHourglass size={14} strokeWidth={1.5}/>
                          <Text size="xs" c="dimmed" fw={500}>
                            {formatDuration(totalTime)}
                          </Text>
                        </Group>
                        {earnings > 0 && (
                          <Group gap={4}>
                            {p.currency === "EUR" ? (
                              <IconCurrencyEuro size={14} strokeWidth={1.5}/>
                            ) : (
                              <IconCurrencyDollar size={14} strokeWidth={1.5}/>
                            )}
                            <Text size="xs" c="dimmed" fw={500}>
                              {formatMoney(earnings, p.currency)}
                            </Text>
                          </Group>
                        )}
                      </Group>
                    </Stack>
                  </Group>
                </Stack>
              </Card>
            );
          })}
          {visibleProjects.length > 1 && (
            <>
              <Divider />
              <Card
                p="sm"
                bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
              >
                <Stack gap="xs">
                  <Group gap="md" justify="space-between">
                    <Group gap={4}>
                      <IconHourglass size={16} strokeWidth={1.5}/>
                      <Text size="sm" fw={600}>
                        {getLocalizedText("Gesamt", "Total")}
                      </Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {formatDuration(totalTime)}
                    </Text>
                  </Group>
                  {(() => {
                    const totalEarnings = visibleProjects.reduce((acc, p) => {
                      const projectTime =
                        day?.sessions.reduce(
                          (timeAcc, session) =>
                            session.work_project_id === p.id
                              ? timeAcc +
                                calculateSessionTimeForDay(session, day.day)
                              : timeAcc,
                          0
                        ) ?? 0;
                      return acc + (p.salary * projectTime) / 3600;
                    }, 0);
                    const primaryCurrency = visibleProjects[0]?.currency;
                    const allSameCurrency = visibleProjects.every(
                      (p) => p.currency === primaryCurrency
                    );

                    if (
                      totalEarnings > 0 &&
                      allSameCurrency &&
                      primaryCurrency
                    ) {
                      return (
                        <Group gap="md" justify="space-between">
                          <Group gap={4}>
                            {primaryCurrency === "EUR" ? (
                              <IconCurrencyEuro size={16} />
                            ) : (
                              <IconCurrencyDollar size={16} />
                            )}
                            <Text size="sm" fw={600}>
                              {getLocalizedText("Gesamt", "Total")}
                            </Text>
                          </Group>
                          <Text size="sm" fw={600}>
                            {formatMoney(totalEarnings, primaryCurrency)}
                          </Text>
                        </Group>
                      );
                    }
                    return null;
                  })()}
                </Stack>
              </Card>
            </>
          )}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
