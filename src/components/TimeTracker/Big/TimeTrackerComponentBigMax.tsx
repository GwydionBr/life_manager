import { useIntl } from "@/hooks/useIntl";
import { useNavigate } from "@tanstack/react-router";

import {
  Badge,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Button,
  Collapse,
  Box,
} from "@mantine/core";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import { IconPlayerPlay, IconPlayerStop, IconX } from "@tabler/icons-react";
import { getStatusColor } from "@/lib/workHelperFunctions";
import ModifyTimeTrackerModal from "../ModifyTimeTracker/ModifyTimeTrackerModal";
import TimeTrackerInfoHoverCard from "../TimeTrackerInfoHoverCard";
import XActionIcon from "@/components/UI/ActionIcons/XActionIcon";
import TimeTrackerMemoRow from "../TimeTrackerRow/TimeTrackerMemoRow";
import TimeTrackerFinanceRow from "../TimeTrackerRow/TimeTrackerFinanceRow";
import TimeTrackerTimeRow from "../TimeTrackerRow/TimeTrackerTimeRow";
import ExternalLinkActionIcon from "@/components/UI/ActionIcons/ExternalLinkActionIcon";
import { TimerData } from "@/stores/timeTrackerManagerStore";

interface TimeTrackerComponentBigMaxProps {
  timer: TimerData;
  state: TimerState;
  activeSeconds: number;
  activeTime: string;
  roundedActiveTime: string;
  isSubmitting: boolean;
  moneyEarned: string;
  storedActiveSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
  memo: string;
  color: string | null;
  backgroundColor: string;
  startTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  removeTimer: () => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  modifyActiveSeconds: (delta: number) => void;
  setMemo: (memo: string) => void;
}

export default function TimeTrackerComponentBigMax({
  timer,
  state,
  activeSeconds,
  activeTime,
  roundedActiveTime,
  isSubmitting,
  moneyEarned,
  storedActiveSeconds,
  timerRoundingSettings,
  memo,
  color,
  backgroundColor,
  startTimer,
  submitTimer,
  cancelTimer,
  modifyActiveSeconds,
  setTempTimerRounding,
  removeTimer,
  setMemo,
}: TimeTrackerComponentBigMaxProps) {
  const { getLocalizedText } = useIntl();
  const navigate = useNavigate();

  const getLocaleState = () => {
    if (state === TimerState.Running) {
      return getLocalizedText("Aktiv", "Running");
    } else if (state === TimerState.Stopped) {
      return getLocalizedText("Gestoppt", "Stopped");
    }
  };

  return (
    <Box
      bg="var(--mantine-color-body)"
      style={{ borderRadius: "var(--mantine-radius-md)" }}
    >
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
            </Stack>
            <Badge size="lg" color={getStatusColor(state)}>
              {getLocaleState()}
            </Badge>
            <Stack>
              <XActionIcon onClick={removeTimer} />
              <ExternalLinkActionIcon
                onClick={() => {
                  navigate({
                    to: "/work",
                    search: { projectId: timer.projectId },
                  });
                }}
                tooltipLabel={getLocalizedText(
                  "Projekt-Details",
                  "Project Details"
                )}
                iconSize={20}
                iconColor="var(--mantine-color-blue-6)"
              />
            </Stack>
          </Group>
          {/* Project Title */}
          <Group justify="space-between" align="center">
            <Text size="xl" fw={700}>
              {timer.projectTitle}
            </Text>
          </Group>

          {/* Time Tracker Rows */}
          <Stack gap="md">
            <TimeTrackerMemoRow value={memo} setMemo={setMemo} />
            {timer.hourlyPayment && (
              <TimeTrackerFinanceRow
                currency={timer.currency}
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
          </Stack>

          {/* Buttons */}
          <Stack gap="md" w="100%" align="center">
            {state === TimerState.Stopped && (
              <Button
                w="60%"
                onClick={startTimer}
                color="lime"
                leftSection={<IconPlayerPlay size={20} />}
                size="md"
              >
                {getLocalizedText("Starten", "Start")}
              </Button>
            )}

            <Collapse in={state !== TimerState.Stopped} transitionDuration={400} w="60%">
              <Stack gap="md" align="center">
                <Button
                  fullWidth
                  onClick={submitTimer}
                  color="red"
                  leftSection={<IconPlayerStop size={20} />}
                  size="md"
                  disabled={isSubmitting}
                >
                  {getLocalizedText("Stoppen", "Stop")}
                </Button>
                <Button
                  fullWidth
                  onClick={cancelTimer}
                  color="gray"
                  leftSection={<IconX size={20} />}
                  size="md"
                  disabled={isSubmitting}
                >
                  {getLocalizedText("Abbrechen", "Cancel")}
                </Button>
              </Stack>
            </Collapse>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}
