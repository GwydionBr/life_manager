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
  const { isTimerRunning, getRunningTimer } = useTimeTrackerManager();

  const timer = getRunningTimer();
  const { locale, format_24h } = useIntl();
  const { data: projects, isLoading: isProjectsLoading } = useWorkProjects();
  
  const project = useMemo(
    () => projects.find((p) => p.id === timer?.projectId),
    [projects, timer?.projectId]
  );

  const color = project?.color ?? "var(--mantine-color-red-6)";
  const backgroundColor = alpha(color, 0.1);

  if (!isToday(day)) {
    if (isYesterday(day) && isTimerRunning && timer) {
      // Check if the running timer started yesterday
      const timerStartDate = new Date(timer.startTime ?? 0);
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
            timer={timer}
            color={color}
            backgroundColor={backgroundColor}
            title={timer.projectTitle}
          />
        );
      }
    }
    return null;
  }

  if (!isTimerRunning || !timer) {
    return (
      <Stack
        gap={1}
        h={20}
        bg="light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))"
        style={{
          position: "absolute",
          top: toY(currentTime),
          left: 0,
          right: 0,
          zIndex: 15,
          borderTop: "2px solid var(--mantine-color-red-6)",
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

  const startTime = new Date(timer.startTime ?? 0);

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
      timer={timer}
      color={color}
      backgroundColor={backgroundColor}
      title={timer.projectTitle}
    />
  );
}
