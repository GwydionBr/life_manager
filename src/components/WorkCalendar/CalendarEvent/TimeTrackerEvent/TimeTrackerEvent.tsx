import { useMemo } from "react";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useIntl } from "@/hooks/useIntl";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";

import { alpha, Stack, Text } from "@mantine/core";
import { endOfDay, isToday, isYesterday, startOfDay } from "date-fns";
import ActiveTimeTracker from "./ActiveTimeTracker";

interface TimeTrackerEventProps {
  toY: (date: Date) => number;
  currentTime: Date;
  day: Date;
}
export default function TimeTrackerEvent({
  toY,
  currentTime,
  day,
}: TimeTrackerEventProps) {
  const { timers, runningTimerCount, activeTimerData } =
    useTimeTrackerManager();

  const activeTimer = useMemo(
    () => Object.values(activeTimerData).find((t) => t.activeSeconds > 0),
    [activeTimerData]
  );

  const timer = useMemo(
    () => Object.values(timers).find((t) => t.id === activeTimer?.id),
    [timers, activeTimer?.id]
  );

  const { locale, format_24h } = useIntl();
  const { data: projects } = useWorkProjects();

  const project = useMemo(
    () => projects.find((p) => p.id === activeTimer?.projectId),
    [projects, activeTimer?.projectId]
  );

  const color = project?.color ?? "var(--mantine-color-red-6)";
  const backgroundColor = alpha(color, 0.1);

  if (!isToday(day)) {
    if (isYesterday(day) && runningTimerCount > 0 && timer && activeTimer) {
      // Check if the running timer started yesterday
      const timerStartDate = new Date(
        (timer.startTime ?? 0) + timer.deltaStartTime * 1000
      );
      if (isYesterday(timerStartDate)) {
        // Timer started yesterday, show it from start time to end of day
        const top = toY(timerStartDate);
        const end = endOfDay(day);
        const bottom = toY(end);
        const height = Math.max(bottom - top, 4);

        return (
          <ActiveTimeTracker
            isYesterday={true}
            realHeight={height}
            height={height}
            top={top}
            bottom={bottom}
            activeTimer={activeTimer}
            color={color}
            backgroundColor={backgroundColor}
            title={project?.title ?? ""}
          />
        );
      }
    }
    return null;
  }

  if (runningTimerCount === 0 || !timer || !activeTimer) {
    return (
      <Stack
        gap={1}
        h={20}
        bg="light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))"
        style={{
          position: "absolute",
          top: toY(currentTime) - 20,
          left: 0,
          right: 0,
          zIndex: 15,
          borderBottom: "2px solid var(--mantine-color-red-6)",
        }}
      >
        <Text size="xs" c="red" ta="center" fw={600}>
          {currentTime.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: !format_24h,
          })}
        </Text>
      </Stack>
    );
  }

  const startTime = new Date(
    (timer.startTime ?? 0) + timer.deltaStartTime * 1000
  );

  const top = toY(isToday(startTime) ? startTime : startOfDay(currentTime));
  const bottom = toY(currentTime);
  const realHeight = bottom - top;
  const height = Math.max(realHeight, 20);

  return (
    <ActiveTimeTracker
      isYesterday={top < 5 ? false : null}
      realHeight={realHeight}
      height={height}
      top={top}
      bottom={bottom}
      activeTimer={activeTimer}
      color={color}
      backgroundColor={backgroundColor}
      title={project?.title ?? ""}
    />
  );
}
