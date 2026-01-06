import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import TimeTrackerRow from "@/components/TimeTracker/TimeTrackerRow/TimeTrackerRow";

import { TimerState } from "@/types/timeTracker.types";

interface TimeTrackerTimeRowProps {
  activeTime: string;
  roundedActiveTime: string;
  state: TimerState;
  color: string | null;
}

export default function TimeTrackerTimeRow({
  activeTime,
  roundedActiveTime,
  state,
  color,
}: TimeTrackerTimeRowProps) {
  return (
    <TimeTrackerRow
      style={{
        border:
          state === TimerState.Running
            ? "2px solid var(--mantine-color-blue-6)"
            : `1px solid ${color ?? "light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))"}`,
      }}
      icon={
        <ThemeIcon
          variant="transparent"
          color="var(--mantine-color-blue-6)"
          w="100%"
        >
          <IconClock size={22} />
        </ThemeIcon>
      }
    >
      <Group justify="space-between" px="md">
        <Text fw={600}>{activeTime}</Text>
        <Text c="dimmed">{roundedActiveTime}</Text>
      </Group>
    </TimeTrackerRow>
  );
}
