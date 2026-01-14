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
  ThemeIcon,
} from "@mantine/core";
import { TimerState } from "@/types/timeTracker.types";
import {
  IconCalendar,
  IconPlayerPlay,
  IconPlayerStop,
  IconX,
} from "@tabler/icons-react";
import { getStatusColor } from "@/lib/workHelperFunctions";
import ModifyTimeTrackerModal from "../ModifyTimeTracker/ModifyTimeTrackerModal";
import TimeTrackerInfoHoverCard from "../TimeTrackerInfoHoverCard";
import XActionIcon from "@/components/UI/ActionIcons/XActionIcon";
import TimeTrackerMemoRow from "../TimeTrackerRow/TimeTrackerMemoRow";
import TimeTrackerFinanceRow from "../TimeTrackerRow/TimeTrackerFinanceRow";
import TimeTrackerTimeRow from "../TimeTrackerRow/TimeTrackerTimeRow";
import ExternalLinkActionIcon from "@/components/UI/ActionIcons/ExternalLinkActionIcon";
import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface TimeTrackerComponentBigMaxProps {
  timerState: TimeTrackerState;
  memo: string;
  color: string | null;
  backgroundColor: string;
  startTimer: () => void;
  submitTimer: () => void;
  cancelTimer: () => void;
  removeTimer: () => void;
  setMemo: (memo: string) => void;
}

export default function TimeTrackerComponentBigMax({
  timerState,
  memo,
  color,
  backgroundColor,
  startTimer,
  submitTimer,
  cancelTimer,
  removeTimer,
  setMemo,
}: TimeTrackerComponentBigMaxProps) {
  const { getLocalizedText } = useIntl();
  const navigate = useNavigate();

  const getLocaleState = () => {
    if (timerState.state === TimerState.Running) {
      return getLocalizedText("Aktiv", "Running");
    } else if (timerState.state === TimerState.Stopped) {
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
        <LoadingOverlay visible={false} overlayProps={{ blur: 2 }} />
        <Stack gap="md" align="center">
          {/* State Badge */}
          <Group justify="space-between" align="center" w="100%" wrap="nowrap">
            <Stack gap={0}>
              <ModifyTimeTrackerModal timerState={timerState} />
              <TimeTrackerInfoHoverCard timerState={timerState} />
            </Stack>
            <Stack align="center">
              <Badge size="lg" color={getStatusColor(timerState.state)}>
                {getLocaleState()}
              </Badge>
            </Stack>
            <Stack>
              <XActionIcon onClick={removeTimer} />
              <ExternalLinkActionIcon
                onClick={() => {
                  navigate({
                    to: "/work",
                    search: { projectId: timerState.projectId },
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
          <Stack gap={5} align="center">
            <Group justify="space-between" align="center">
              <Text size="xl" fw={700}>
                {timerState.projectTitle}
              </Text>
            </Group>
            {timerState.appointmentTitle && (
              <Group
                justify="center"
                align="center"
                gap="xs"
                wrap="nowrap"
              >
                <ThemeIcon size="xs" variant="transparent">
                  <IconCalendar size={18} />
                </ThemeIcon>
                <Text
                  size="xs"
                  fw={500}
                  maw={200}
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {timerState.appointmentTitle}
                </Text>
              </Group>
            )}
          </Stack>

          {/* Time Tracker Rows */}
          <Stack gap="md">
            <TimeTrackerMemoRow value={memo} setMemo={setMemo} />
            {timerState.hourlyPayment && (
              <TimeTrackerFinanceRow
                currency={timerState.currency}
                moneyEarned={timerState.moneyEarned ?? "0.00"}
                state={timerState.state}
                color={color}
              />
            )}
            <TimeTrackerTimeRow
              activeTime={timerState.activeTime}
              roundedActiveTime={timerState.roundedActiveTime}
              state={timerState.state}
              color={color}
            />
          </Stack>

          {/* Buttons */}
          <Stack gap="md" w="100%" align="center">
            {timerState.state === TimerState.Stopped && (
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

            <Collapse
              in={timerState.state !== TimerState.Stopped}
              transitionDuration={400}
              w="60%"
            >
              <Stack gap="md" align="center">
                <Button
                  fullWidth
                  onClick={submitTimer}
                  color="red"
                  leftSection={<IconPlayerStop size={20} />}
                  size="md"
                  disabled={false}
                >
                  {getLocalizedText("Stoppen", "Stop")}
                </Button>
                <Button
                  fullWidth
                  onClick={cancelTimer}
                  color="gray"
                  leftSection={<IconX size={20} />}
                  size="md"
                  disabled={false}
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
