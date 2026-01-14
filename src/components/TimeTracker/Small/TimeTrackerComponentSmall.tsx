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

import { TimerState } from "@/types/timeTracker.types";
import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface TimeTrackerComponentSmallProps {
  showSmall: boolean;
  timerState: TimeTrackerState;
  color: string | null;
  backgroundColor: string;
  setShowSmall: (showSmall: boolean) => void;
  submitTimer: () => void;
  startTimer: () => void;
  cancelTimer: () => void;
}

export default function TimeTrackerComponentSmall({
  showSmall,
  timerState,
  color,
  backgroundColor,
  setShowSmall: _setShowSmall,
  submitTimer,
  startTimer,
  cancelTimer,
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
            <LoadingOverlay visible={false} overlayProps={{ blur: 2 }} />
            <Stack gap={0}>
              <ModifyTimeTrackerModal timerState={timerState} />
              <TimeTrackerInfoHoverCard timerState={timerState} />
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
                  timerState.state === TimerState.Running
                    ? `2px solid var(--mantine-color-blue-6)`
                    : "none",
              }}
            >
              <Text fz={11} c="dimmed" ta="center">
                {getLocalizedText("Aktiv", "Active")}
              </Text>
              <Text
                fz={11}
                fw={timerState.state === TimerState.Running ? 700 : 400}
                ta="center"
              >
                {timerState.activeTime}
              </Text>
              <Text fz={11} c="dimmed" ta="center">
                {timerState.roundedActiveTime}
              </Text>
            </Card>
            {timerState.state === TimerState.Stopped && (
              <StartActionIcon startTimer={startTimer} />
            )}
            <Collapse
              in={timerState.state === TimerState.Running}
              transitionDuration={400}
            >
              <Stack gap="xs" align="center" justify="center">
                <StopActionIcon stopTimer={submitTimer} disabled={false} />
                <CancelActionIcon cancelTimer={cancelTimer} disabled={false} />
              </Stack>
            </Collapse>
          </Stack>
        </Collapse>
      </Stack>
    </Box>
  );
}
