import { useIntl } from "@/hooks/useIntl";

import {
  Stack,
  Text,
  Collapse,
  Divider,
  LoadingOverlay,
  Card,
  Box,
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
  activeSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
  projectTitle: string;
  salary: number;
  currency: Currency;
  hourlyPayment: boolean;
  storedActiveSeconds: number;
  color: string | null;
  backgroundColor: string;
  setShowSmall: (showSmall: boolean) => void;
  submitTimer: () => void;
  startTimer: () => void;
  cancelTimer: () => void;
  modifyActiveSeconds: (delta: number) => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
}

export default function TimeTrackerComponentSmall({
  showSmall,
  isSubmitting,
  roundedActiveTime,
  state,
  activeTime,
  activeSeconds,
  timerRoundingSettings,
  projectTitle,
  salary,
  currency,
  hourlyPayment,
  color,
  backgroundColor,
  setShowSmall: _setShowSmall,
  storedActiveSeconds,
  submitTimer,
  startTimer,
  cancelTimer,
  modifyActiveSeconds,
  setTempTimerRounding,
}: TimeTrackerComponentSmallProps) {
  const { getLocalizedText } = useIntl();

  return (
    <Box bg="var(--mantine-color-body)">
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
                setTempTimerRounding={setTempTimerRounding}
                activeTime={activeTime}
                state={state}
                activeSeconds={activeSeconds}
                timerRoundingSettings={timerRoundingSettings}
                storedActiveSeconds={storedActiveSeconds}
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
            {state === TimerState.Stopped && (
              <StartActionIcon startTimer={startTimer} />
            )}
            <Collapse
              in={state === TimerState.Running}
              transitionDuration={400}
            >
              <Stack gap="xs" align="center" justify="center">
                <StopActionIcon
                  stopTimer={submitTimer}
                  disabled={isSubmitting}
                />
                <CancelActionIcon
                  cancelTimer={cancelTimer}
                  disabled={isSubmitting}
                />
              </Stack>
            </Collapse>
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}
