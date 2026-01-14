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
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import StartActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/StartActionIcons";
import StopActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/StopActionIcon";
import CancelActionIcon from "@/components/TimeTracker/TimeTrackerActionIcons/CancelActionIcon";
import XActionIcon from "@/components/UI/ActionIcons/XActionIcon";
import ModifyTimeTrackerModal from "@/components/TimeTracker/ModifyTimeTracker/ModifyTimeTrackerModal";
import TimeTrackerInfoHoverCard from "@/components/TimeTracker/TimeTrackerInfoHoverCard";
import { TimerData } from "@/stores/timeTrackerManagerStore";

interface TimeTrackerComponentBigMinProps {
  timer: TimerData;
  state: TimerState;
  activeSeconds: number;
  activeTime: string;
  roundedActiveTime: string;
  isSubmitting: boolean;
  timerRoundingSettings: TimerRoundingSettings; 
  storedActiveSeconds: number;
  color: string | null;
  backgroundColor: string;
  modifyActiveSeconds: (delta: number) => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  startTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  removeTimer: () => void;
}

export default function TimeTrackerComponentBigMin({
  timer,
  state,
  activeSeconds,
  activeTime,
  roundedActiveTime,
  isSubmitting,
  storedActiveSeconds,
  timerRoundingSettings,
  modifyActiveSeconds,
  setTempTimerRounding,
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
        <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
        <Group justify="center" align="center">
          <ModifyTimeTrackerModal
            activeTime={activeTime}
            state={state}
            timerRoundingSettings={timerRoundingSettings}
            activeSeconds={activeSeconds}
            storedActiveSeconds={storedActiveSeconds}
            modifyActiveSeconds={modifyActiveSeconds}
            setTempTimerRounding={setTempTimerRounding}
          />
          <TimeTrackerInfoHoverCard
            currency={timer.currency}
            timerRoundingSettings={timerRoundingSettings}
            projectTitle={timer.projectTitle}
            salary={timer.salary}
            hourlyPayment={timer.hourlyPayment}
          />
          <Text size="xs" c="dimmed" ta="center">
            {timer.projectTitle}
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
                state === TimerState.Running
                  ? "var(--mantine-color-blue-6)"
                  : "",
            }}
          >
            <Stack gap="xs" align="center">
              <Text size="xs" c="dimmed">
                {getLocalizedText("Aktiv", "Active")}
              </Text>
              {!timerRoundingSettings?.roundInTimeFragments ? (
                <Stack>
                  <Text size="xs" fw={state === TimerState.Running ? 700 : 400}>
                    {activeTime}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {roundedActiveTime}
                  </Text>
                </Stack>
              ) : (
                <Group>
                  <Text size="xs" fw={state === TimerState.Running ? 700 : 400}>
                    {activeTime}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {roundedActiveTime}
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>
          <Transition
            mounted={state === TimerState.Stopped}
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
            mounted={state === TimerState.Running}
            transition="fade-left"
            duration={400}
          >
            {(styles) => (
              <Group gap={5} align="center" justify="center" style={styles}>
                <StopActionIcon
                  stopTimer={submitTimer}
                  disabled={isSubmitting}
                />
                <CancelActionIcon
                  cancelTimer={cancelTimer}
                  disabled={isSubmitting}
                />
              </Group>
            )}
          </Transition>
        </Group>
      </Card>
    </Box>
  );
}
