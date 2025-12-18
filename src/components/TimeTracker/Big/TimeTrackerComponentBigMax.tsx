import { useIntl } from "@/hooks/useIntl";

import {
  Badge,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Button,
  Collapse,
} from "@mantine/core";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import { IconPlayerPlay, IconPlayerStop, IconX } from "@tabler/icons-react";
import { Currency } from "@/types/settings.types";
import { getStatusColor } from "@/lib/workHelperFunctions";
import ModifyTimeTrackerModal from "../ModifyTimeTracker/ModifyTimeTrackerModal";
import TimeTrackerInfoHoverCard from "../TimeTrackerInfoHoverCard";
import XActionIcon from "@/components/UI/ActionIcons/XActionIcon";
import TimeTrackerMemoRow from "../TimeTrackerRow/TimeTrackerMemoRow";
import TimeTrackerFinanceRow from "../TimeTrackerRow/TimeTrackerFinanceRow";
import TimeTrackerTimeRow from "../TimeTrackerRow/TimeTrackerTimeRow";

interface TimeTrackerComponentBigMaxProps {
  projectTitle: string;
  state: TimerState;
  activeSeconds: number;
  activeTime: string;
  pausedTime: string;
  roundedActiveTime: string;
  isSubmitting: boolean;
  moneyEarned: string;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  memo: string;
  color: string | null;
  backgroundColor: string;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  removeTimer: () => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setMemo: (memo: string) => void;
}

export default function TimeTrackerComponentBigMax({
  projectTitle,
  state,
  activeSeconds,
  activeTime,
  pausedTime,
  roundedActiveTime,
  isSubmitting,
  moneyEarned,
  storedActiveSeconds,
  storedPausedSeconds,
  timerRoundingSettings,
  currency,
  salary,
  hourlyPayment,
  memo,
  color,
  backgroundColor,
  startTimer,
  submitTimer,
  cancelTimer,
  modifyActiveSeconds,
  modifyPausedSeconds,
  setTempTimerRounding,
  removeTimer,
  setMemo,
}: TimeTrackerComponentBigMaxProps) {
  const { getLocalizedText } = useIntl();

  const getLocaleState = () => {
    if (state === TimerState.Running) {
      return getLocalizedText("Aktiv", "Running");
    } else if (state === TimerState.Paused) {
      return getLocalizedText("Pausiert", "Paused");
    } else if (state === TimerState.Stopped) {
      return getLocalizedText("Gestoppt", "Stopped");
    }
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      w={270}
      bg={backgroundColor}
      style={{ border: `2px solid ${color ?? "teal"}` }}
    >
      <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
      <Stack gap="md" align="center">
        {/* State Badge */}
        <Group justify="space-between" align="center" w="100%">
          <Stack gap={0}>
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
          </Stack>
          <Badge size="lg" color={getStatusColor(state)}>
            {getLocaleState()}
          </Badge>
          <XActionIcon onClick={removeTimer} />
        </Group>
        {/* Project Title */}
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>
            {projectTitle}
          </Text>
        </Group>

        {/* Time Tracker Rows */}
        <Stack gap="md">
          <TimeTrackerMemoRow value={memo} setMemo={setMemo} />
          {hourlyPayment && (
            <TimeTrackerFinanceRow
              currency={currency}
              moneyEarned={moneyEarned}
              state={state}
              color={color}
            />
          )}
          <TimeTrackerTimeRow
            activeTime={activeTime}
            roundedActiveTime={roundedActiveTime}
            state={state}
            color={color}
          />
          {/* {!roundInTimeSections && (
            <TimeTrackerRow
              icon={
                <IconPlayerPause
                  size={20}
                  color="var(--mantine-color-orange-6)"
                />
              }
              value={pausedTime}
              state={state}
              activationState={TimerState.Paused}
              color="var(--mantine-color-orange-6)"
            />
          )} */}
        </Stack>

        {/* Buttons */}
        <Stack gap="md" w="100%" align="center">
          {state === "stopped" && (
            <Button
              w="60%"
              onClick={startTimer}
              color="lime"
              leftSection={<IconPlayerPlay size={20} />}
              size="md"
            >
              Start
            </Button>
          )}
          {/* {state === "running" && !roundInTimeSections && (
            <Button
              w="60%"
              onClick={pauseTimer}
              color="yellow"
              leftSection={<IconPlayerPause size={20} />}
              size="md"
              disabled={isSubmitting}
            >
              Pause
            </Button>
          )} */}
          {/* {state === "paused" && (
            <Button
              w="60%"
              onClick={resumeTimer}
              color="blue"
              leftSection={<IconPlayerPlay size={20} />}
              size="md"
              disabled={isSubmitting}
            >
              Resume
            </Button>
          )} */}

          <Collapse in={state !== "stopped"} transitionDuration={400} w="60%">
            <Stack gap="md" align="center">
              <Button
                fullWidth
                onClick={submitTimer}
                color="red"
                leftSection={<IconPlayerStop size={20} />}
                size="md"
                disabled={isSubmitting}
              >
                Stop
              </Button>
              <Button
                fullWidth
                onClick={cancelTimer}
                color="gray"
                leftSection={<IconX size={20} />}
                size="md"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Stack>
          </Collapse>
        </Stack>
      </Stack>
    </Card>
  );
}
