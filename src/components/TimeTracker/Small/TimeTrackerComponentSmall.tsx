import { useIntl } from "@/hooks/useIntl";

import {
  Stack,
  Text,
  Collapse,
  Divider,
  LoadingOverlay,
  Card,
} from "@mantine/core";

import StartActionIcon from "../TimeTrackerActionIcons/StartActionIcons";
import StopActionIcon from "../TimeTrackerActionIcons/StopActionIcon";
import CancelActionIcon from "../TimeTrackerActionIcons/CancelActionIcon";
import TimeTrackerInfoHoverCard from "../TimeTrackerInfoHoverCard";
import ModifyTimeTrackerModal from "../ModifyTimeTracker/ModifyTimeTrackerModal";

import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import { Currency } from "@/types/settings.types";

interface TimeTrackerComponentSmallProps {
  showSmall: boolean;
  isSubmitting: boolean;
  roundedActiveTime: string;
  state: TimerState;
  activeTime: string;
  pausedTime: string;
  activeSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
  projectTitle: string;
  salary: number;
  currency: Currency;
  hourlyPayment: boolean;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  color: string | null;
  backgroundColor: string;
  setShowSmall: (showSmall: boolean) => void;
  submitTimer: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  cancelTimer: () => void;
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
}

export default function TimeTrackerComponentSmall({
  showSmall,
  isSubmitting,
  roundedActiveTime,
  state,
  activeTime,
  pausedTime,
  activeSeconds,
  timerRoundingSettings,
  projectTitle,
  salary,
  currency,
  hourlyPayment,
  color,
  backgroundColor,
  setShowSmall,
  storedActiveSeconds,
  storedPausedSeconds,
  submitTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  cancelTimer,
  modifyActiveSeconds,
  modifyPausedSeconds,
  setTempTimerRounding,
}: TimeTrackerComponentSmallProps) {
  const { getLocalizedText } = useIntl();

  return (
    <Stack
      w={50}
      align="center"
      justify="center"
      pb="xs"
      gap="xs"
      bg={backgroundColor}
      style={{
        borderTop: `2px solid ${color ?? "teal"}`,
        borderBottom: `2px solid ${color ?? "teal"}`,
      }}
    >
      <Collapse in={showSmall} transitionDuration={400}>
        <Stack gap="xs" align="center" justify="center" pos="relative">
          <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
          <Stack gap={0}>
            <ModifyTimeTrackerModal
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setTempTimerRounding={setTempTimerRounding}
              activeTime={activeTime}
              pausedTime={pausedTime}
              state={state}
              activeSeconds={activeSeconds}
              timerRoundingSettings={timerRoundingSettings}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
            />
            <TimeTrackerInfoHoverCard
              currency={currency}
              timerRoundingSettings={timerRoundingSettings}
              projectTitle={projectTitle}
              salary={salary}
              hourlyPayment={hourlyPayment}
            />
          </Stack>
          <Divider />
          <Card
            w={47}
            shadow="sm"
            padding={0}
            py={8}
            mr={1}
            radius="md"
            withBorder
            style={{
              border:
                state === TimerState.Running
                  ? `2px solid var(--mantine-color-blue-6)`
                  : "none",
            }}
          >
            <Text fz={11} c="dimmed" ta="center">
              {getLocalizedText("Aktiv", "Active")}
            </Text>
            <Text fz={11} fw={state === "running" ? 700 : 400} ta="center">
              {activeTime}
            </Text>
            <Text fz={11} c="dimmed" ta="center">
              {roundedActiveTime}
            </Text>
          </Card>
          {/* {!roundInTimeSections && (
            <Card
              w={47}
              shadow="sm"
              padding={0}
              py={8}
              mr={1}
              radius="md"
              withBorder
              style={{
                borderColor:
                  state === TimerState.Paused
                    ? "var(--mantine-color-orange-6)"
                    : "",
              }}
            >
              <Text fz={11} c="dimmed" ta="center">
                {getLocalizedText("Pausiert", "Paused")}
              </Text>
              <Text fz={11} fw={state === "paused" ? 700 : 400} ta="center">
                {pausedTime}
              </Text>
            </Card>
          )} */}
          {state === "stopped" && <StartActionIcon startTimer={startTimer} />}
          {/* {state === "running" && !roundInTimeSections && (
            <PauseActionIcon pauseTimer={pauseTimer} disabled={isSubmitting} />
          )}
          {state === "paused" && (
            <ResumeActionIcon
              resumeTimer={resumeTimer}
              disabled={isSubmitting}
            />
          )} */}
          <Collapse
            in={state === "running" || state === "paused"}
            transitionDuration={400}
          >
            <Stack gap="xs" align="center" justify="center">
              <StopActionIcon stopTimer={submitTimer} disabled={isSubmitting} />
              <CancelActionIcon
                cancelTimer={cancelTimer}
                disabled={isSubmitting}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Collapse>
    </Stack>
  );
}
