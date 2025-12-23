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
import { Currency } from "@/types/settings.types";

interface TimeTrackerComponentBigMinProps {
  projectTitle: string;
  state: TimerState;
  activeSeconds: number;
  activeTime: string;
  pausedTime: string;
  roundedActiveTime: string;
  isSubmitting: boolean;
  timerRoundingSettings: TimerRoundingSettings;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  color: string | null;
  backgroundColor: string;
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  removeTimer: () => void;
}

export default function TimeTrackerComponentBigMin({
  projectTitle,
  state,
  activeSeconds,
  activeTime,
  pausedTime,
  roundedActiveTime,
  isSubmitting,
  storedActiveSeconds,
  storedPausedSeconds,
  timerRoundingSettings,
  currency,
  salary,
  hourlyPayment,
  modifyActiveSeconds,
  modifyPausedSeconds,
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
    <Box bg="var(--mantine-color-body)">
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
            pausedTime={pausedTime}
            state={state}
            timerRoundingSettings={timerRoundingSettings}
            activeSeconds={activeSeconds}
            storedActiveSeconds={storedActiveSeconds}
            storedPausedSeconds={storedPausedSeconds}
            modifyActiveSeconds={modifyActiveSeconds}
            modifyPausedSeconds={modifyPausedSeconds}
            setTempTimerRounding={setTempTimerRounding}
          />
          <TimeTrackerInfoHoverCard
            currency={currency}
            timerRoundingSettings={timerRoundingSettings}
            projectTitle={projectTitle}
            salary={salary}
            hourlyPayment={hourlyPayment}
          />
          <Text size="xs" c="dimmed" ta="center">
            {projectTitle}
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
                  <Text size="xs" fw={state === "running" ? 700 : 400}>
                    {activeTime}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {roundedActiveTime}
                  </Text>
                </Stack>
              ) : (
                <Group>
                  <Text size="xs" fw={state === "running" ? 700 : 400}>
                    {activeTime}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {roundedActiveTime}
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>
          {/* {!roundInTimeSections && (
          <Card
            shadow="sm"
            padding="xs"
            radius="md"
            withBorder
            style={{
              borderColor:
                state === TimerState.Paused
                  ? "var(--mantine-color-orange-6)"
                  : "",
            }}
          >
            <Stack>
              <Text size="xs" c="dimmed">
                {locale === "de-DE" ? "Pausiert" : "Paused"}
              </Text>
              <Text size="xs" fw={state === "paused" ? 700 : 400}>
                {pausedTime}
              </Text>
            </Stack>
          </Card>
        )} */}
          <Transition
            mounted={state === "stopped"}
            transition="fade-left"
            duration={400}
          >
            {(styles) => (
              <Box style={styles}>
                <StartActionIcon startTimer={startTimer} />
              </Box>
            )}
          </Transition>
          {/* {state === "running" && !roundInTimeSections && (
          <PauseActionIcon pauseTimer={pauseTimer} disabled={isSubmitting} />
        )}
        {state === "paused" && (
          <ResumeActionIcon resumeTimer={resumeTimer} disabled={isSubmitting} />
        )} */}
          <Transition
            mounted={state === "running" || state === "paused"}
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
