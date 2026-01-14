import { useIntl } from "@/hooks/useIntl";

import {
  Box,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import { TimerState } from "@/types/timeTracker.types";
import StartActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/StartActionIcons";
import StopActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/StopActionIcon";
import CancelActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/CancelActionIcon";
import XActionIcon from "@/components/UI/ActionIcons/XActionIcon";
import ModifyTimeTrackerModal from "@/components/TimeTracker/ModifyTimeTracker/ModifyTimeTrackerModal";
import TimeTrackerInfoHoverCard from "@/components/TimeTracker/TimeTrackerInfoHoverCard";
import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface TimeTrackerComponentBigMinProps {
  timerState: TimeTrackerState;
  color: string | null;
  backgroundColor: string;
  startTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  removeTimer: () => void;
}

export default function TimeTrackerComponentBigMin({
  timerState,
  startTimer,
  submitTimer,
  cancelTimer,
  removeTimer,
  color,
  backgroundColor,
}: TimeTrackerComponentBigMinProps) {
  const { getLocalizedText } = useIntl();

  return (
    <Box
      bg="var(--mantine-color-body)"
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    >
      <Card
        shadow="sm"
        padding="xs"
        radius="md"
        withBorder
        w={270}
        bg={backgroundColor}
        style={{ border: `2px solid ${color ?? "teal"}` }}
      >
        <LoadingOverlay visible={false} overlayProps={{ blur: 2 }} />
        <Group justify="center" align="center">
          <ModifyTimeTrackerModal
            timerState={timerState}
          />
          <TimeTrackerInfoHoverCard
            timerState={timerState}
          />
          <Text size="xs" c="dimmed" ta="center">
            {timerState.projectTitle}
          </Text>
          <XActionIcon onClick={removeTimer} size="xs" />
        </Group>
        <Group align="center" justify="center" gap={5}>
          <Card
            shadow="sm"
            padding="xs"
            radius="md"
            withBorder
            style={{
              borderColor:
                timerState.state === TimerState.Running
                  ? "var(--mantine-color-blue-6)"
                  : "",
            }}
          >
            <Stack gap="xs" align="center">
              <Text size="xs" c="dimmed">
                {getLocalizedText("Aktiv", "Active")}
              </Text>
              {!timerState.timerRoundingSettings?.roundInTimeFragments ? (
                <Stack>
                  <Text size="xs" fw={timerState.state === TimerState.Running ? 700 : 400}>
                    {timerState.activeTime}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {timerState.roundedActiveTime}
                  </Text>
                </Stack>
              ) : (
                <Group>
                  <Text size="xs" fw={timerState.state === TimerState.Running ? 700 : 400}>
                    {timerState.activeTime}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {timerState.roundedActiveTime}
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>
          <Transition
            mounted={timerState.state === TimerState.Stopped}
            transition="fade-left"
            duration={400}
          >
            {(styles) => (
              <Box style={styles}>
                <StartActionIcon startTimer={startTimer} />
              </Box>
            )}
          </Transition>
          <Transition
            mounted={timerState.state === TimerState.Running}
            transition="fade-left"
            duration={400}
          >
            {(styles) => (
              <Group gap={5} align="center" justify="center" style={styles}>
                <StopActionIcon
                  stopTimer={submitTimer}
                  disabled={false}
                />
                <CancelActionIcon
                  cancelTimer={cancelTimer}
                  disabled={false}
                />
              </Group>
            )}
          </Transition>
        </Group>
      </Card>
    </Box>
  );
}
