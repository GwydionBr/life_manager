import { useState, useMemo } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";

import {
  Stack,
  Text,
  Box,
  Group,
  Button,
  Card,
  Title,
  NumberInput,
  Divider,
  Badge,
  SimpleGrid,
  RangeSlider,
  rem,
  ActionIcon,
} from "@mantine/core";
import {
  IconClock,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconMinus,
  IconCalendarTime,
  IconArrowRight,
  IconTimeline,
} from "@tabler/icons-react";
import TimeTrackerTimeRow from "../TimeTrackerRow/TimeTrackerTimeRow";
import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface ModifyTimeProps {
  timerState: TimeTrackerState;
}

export default function ModifyTime({ timerState }: ModifyTimeProps) {
  const { getLocalizedText, formatDuration, formatDateTime } = useIntl();
  const [startTimeMinutes, setStartTimeMinutes] = useState<number>(0);
  const [endTimeMinutes, setEndTimeMinutes] = useState<number>(0);
  const { updateTimer } = useTimeTrackerManager();

  // // Format timestamp to readable time
  // const formatTime = (timestamp: number | null | undefined): string => {
  //   if (!timestamp) return "--:--";
  //   const date = new Date(timestamp);
  //   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  // };

  // Calculate slider values and range
  const sliderData = useMemo(() => {
    const originalStartTime = timerState.startTime || Date.now();
    const originalEndTime = Date.now();
    const effectiveStartTime =
      timerState.effectiveStartTime || originalStartTime;
    const effectiveEndTime = timerState.effectiveEndTime || originalEndTime;

    // Calculate total time range in minutes
    const totalRangeMs = originalEndTime - originalStartTime;
    const totalRangeMinutes = Math.max(
      Math.ceil(totalRangeMs / (60 * 1000)),
      60
    ); // Minimum 60 minutes

    // Add buffer for adjustments (30% on each side)
    const buffer = Math.ceil(totalRangeMinutes * 0.3);
    const minValue = -buffer;
    const maxValue = totalRangeMinutes + buffer;

    // Calculate current positions relative to original start
    const startPosition = Math.round(
      (effectiveStartTime - originalStartTime) / (60 * 1000)
    );
    const endPosition = Math.round(
      (effectiveEndTime - originalStartTime) / (60 * 1000)
    );

    return {
      minValue,
      maxValue,
      startPosition,
      endPosition,
      originalStartTime,
      originalEndTime,
    };
  }, [timerState]);

  // Handle start time adjustment
  const handleStartTimeChange = (minutes: number) => {
    // To add more active time, we need to subtract from start time (shift it backward)
    // So we negate the change
    const deltaChange = -minutes * 60;
    updateTimer(timerState.id, {
      deltaStartTime: timerState.deltaStartTime + deltaChange,
    });
  };

  // Handle end time adjustment
  const handleEndTimeChange = (minutes: number) => {
    // To add more active time, we add to end time (shift it forward)
    const deltaChange = minutes * 60;
    updateTimer(timerState.id, {
      deltaEndTime: timerState.deltaEndTime + deltaChange,
    });
  };

  // Handle slider change
  const handleSliderChange = (value: [number, number]) => {
    const [newStartPos, newEndPos] = value;

    // Calculate the difference from current position
    const startDiff = newStartPos - sliderData.startPosition;
    const endDiff = newEndPos - sliderData.endPosition;

    // Convert to seconds and apply
    const newDeltaStartTime = timerState.deltaStartTime - startDiff * 60;
    const newDeltaEndTime = timerState.deltaEndTime + endDiff * 60;

    updateTimer(timerState.id, {
      deltaStartTime: newDeltaStartTime,
      deltaEndTime: newDeltaEndTime,
    });
  };

  // Apply custom start time change
  const handleApplyStartTime = () => {
    if (startTimeMinutes !== 0) {
      handleStartTimeChange(startTimeMinutes);
      setStartTimeMinutes(0);
    }
  };

  // Apply custom end time change
  const handleApplyEndTime = () => {
    if (endTimeMinutes !== 0) {
      handleEndTimeChange(endTimeMinutes);
      setEndTimeMinutes(0);
    }
  };

  return (
    <Stack gap="lg">
      {/* Current Times Overview */}
      <Card
        withBorder
        shadow="sm"
        radius="md"
        p="lg"
        bg="light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-8))"
      >
        <Group justify="space-between" mb="md">
          <Title order={4}>
            <IconClock size={20} style={{ marginRight: "8px" }} />
            {getLocalizedText("Aktuelle Zeiten", "Current Times")}
          </Title>
        </Group>

        <Group gap="xl" justify="center">
          <TimeTrackerTimeRow
            activeTime={timerState.activeTime}
            roundedActiveTime={timerState.roundedActiveTime}
            state={timerState.state}
            color={null}
          />
        </Group>
      </Card>

      {/* Start and End Times */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>
            <IconCalendarTime size={20} style={{ marginRight: "8px" }} />
            {getLocalizedText("Zeitpunkte", "Time Points")}
          </Title>
        </Group>

        <SimpleGrid cols={2} spacing="md">
          {/* Start Time */}
          <Box>
            <Group gap="xs" mb="xs">
              <IconPlayerPlay size={16} color="var(--mantine-color-green-6)" />
              <Text
                size="sm"
                fw={600}
                c="light-dark(var(--mantine-color-green-7), var(--mantine-color-green-4))"
              >
                {getLocalizedText("Startzeit", "Start Time")}
              </Text>
              <Group>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="md"
                  onClick={() => handleStartTimeChange(-1)}
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="green"
                  size="md"
                  onClick={() => handleStartTimeChange(1)}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Group>
            </Group>
            <Card
              withBorder
              p="sm"
              bg="light-dark(var(--mantine-color-green-0), var(--mantine-color-dark-8))"
            >
              <Stack gap="xs">
                <Group gap="xs" justify="space-between">
                  <Text size="xs" c="dimmed">
                    {getLocalizedText("Original:", "Original:")}
                  </Text>
                  <Text size="sm" fw={500}>
                    {formatDateTime(new Date(timerState.startTime ?? 0))}
                  </Text>
                </Group>
                {timerState.deltaStartTime !== 0 && (
                  <>
                    <Divider />
                    <Group gap="xs" justify="space-between">
                      <Text size="xs" c="dimmed">
                        {getLocalizedText("Anpassung:", "Adjustment:")}
                      </Text>
                      <Badge
                        size="sm"
                        color={timerState.deltaStartTime < 0 ? "green" : "red"}
                      >
                        {timerState.deltaStartTime > 0 ? "+" : ""}
                        {Math.round(timerState.deltaStartTime / 60)} min
                      </Badge>
                    </Group>
                    <Divider />
                    <Group gap="xs" justify="space-between">
                      <Text size="xs" c="dimmed" fw={600}>
                        {getLocalizedText("Effektiv:", "Effective:")}
                      </Text>
                      <Text
                        size="sm"
                        fw={700}
                        c="light-dark(var(--mantine-color-green-8), var(--mantine-color-green-3))"
                      >
                        {formatDateTime(new Date(timerState.effectiveStartTime ?? 0))}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>
            </Card>
          </Box>

          {/* End Time */}
          <Box>
            <Group gap="xs" mb="xs">
              <IconPlayerStop size={16} color="var(--mantine-color-red-6)" />
              <Text
                size="sm"
                fw={600}
                c="light-dark(var(--mantine-color-red-7), var(--mantine-color-red-4))"
              >
                {getLocalizedText("Endzeit", "End Time")}
              </Text>
              <Group>
                <ActionIcon
                  variant="light"
                  color="red"
                  size="md"
                  onClick={() => handleEndTimeChange(-1)}
                >
                  <IconMinus size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="green"
                  size="md"
                  onClick={() => handleEndTimeChange(1)}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Group>
            </Group>
            <Card
              withBorder
              p="sm"
              bg="light-dark(var(--mantine-color-red-0), var(--mantine-color-dark-8))"
            >
              <Stack gap="xs">
                <Group gap="xs" justify="space-between">
                  <Text size="xs" c="dimmed">
                    {getLocalizedText("Original:", "Original:")}
                  </Text>
                  <Text size="sm" fw={500}>
                    {timerState.state === "running"
                      ? getLocalizedText("Läuft...", "Running...")
                      : formatDateTime(new Date(Date.now()))}
                  </Text>
                </Group>
                {timerState.deltaEndTime !== 0 && (
                  <>
                    <Divider />
                    <Group gap="xs" justify="space-between">
                      <Text size="xs" c="dimmed">
                        {getLocalizedText("Anpassung:", "Adjustment:")}
                      </Text>
                      <Badge
                        size="sm"
                        color={timerState.deltaEndTime > 0 ? "green" : "red"}
                      >
                        {timerState.deltaEndTime > 0 ? "+" : ""}
                        {Math.round(timerState.deltaEndTime / 60)} min
                      </Badge>
                    </Group>
                    <Divider />
                    <Group gap="xs" justify="space-between">
                      <Text size="xs" c="dimmed" fw={600}>
                        {getLocalizedText("Effektiv:", "Effective:")}
                      </Text>
                      <Text
                        size="sm"
                        fw={700}
                        c="light-dark(var(--mantine-color-red-8), var(--mantine-color-red-3))"
                      >
                        {formatDateTime(new Date(timerState.effectiveEndTime ?? 0))}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>
            </Card>
          </Box>
        </SimpleGrid>
      </Card>

      {/* Visual Timeline Slider */}
      <Card
        withBorder
        shadow="sm"
        radius="md"
        p="lg"
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
      >
        <Group justify="space-between" mb="md">
          <Title order={4}>
            <IconTimeline size={20} style={{ marginRight: "8px" }} />
            {getLocalizedText("Visueller Zeitstrahl", "Visual Timeline")}
          </Title>
        </Group>

        <Text size="sm" c="dimmed" mb="lg">
          {getLocalizedText(
            "Verschieben Sie die Markierungen um Start- und Endzeit anzupassen",
            "Move the markers to adjust start and end time"
          )}
        </Text>

        <Box px="md" pb="md">
          <Stack gap="xs">
            {/* Time labels above slider */}
            <Group justify="space-between" mb="xs">
              <Group gap={4}>
                <IconPlayerPlay
                  size={14}
                  color="var(--mantine-color-green-6)"
                />
                <Text
                  size="xs"
                  fw={600}
                  c="light-dark(var(--mantine-color-green-7), var(--mantine-color-green-4))"
                >
                  {formatDateTime(new Date(timerState.effectiveStartTime ?? 0))}
                </Text>
              </Group>
              <Group gap={4}>
                <IconPlayerStop size={14} color="var(--mantine-color-red-6)" />
                <Text
                  size="xs"
                  fw={600}
                  c="light-dark(var(--mantine-color-red-7), var(--mantine-color-red-4))"
                >
                  {formatDateTime(new Date(timerState.effectiveEndTime ?? 0))}
                </Text>
              </Group>
            </Group>

            {/* The actual slider */}
            <RangeSlider
              value={[sliderData.startPosition, sliderData.endPosition]}
              onChange={handleSliderChange}
              min={sliderData.minValue}
              max={sliderData.maxValue}
              step={1}
              minRange={1}
              size="lg"
              color="blue"
              thumbSize={24}
              marks={[
                {
                  value: 0,
                  label: formatDateTime(new Date(sliderData.originalStartTime)),
                },
                {
                  value: Math.round(
                    (sliderData.originalEndTime -
                      sliderData.originalStartTime) /
                      (60 * 1000)
                  ),
                  label: formatDateTime(new Date(sliderData.originalEndTime)),
                },
              ]}
              styles={{
                thumb: {
                  borderWidth: rem(2),
                  padding: rem(3),
                },
                label: {
                  fontSize: rem(11),
                  fontWeight: 600,
                },
                markLabel: {
                  fontSize: rem(10),
                  marginTop: rem(8),
                },
              }}
            />

            {/* Duration display */}
            <Group justify="center" mt="md">
              <Badge size="lg" variant="light" color="blue">
                <Group gap={4}>
                  <IconClock size={14} />
                  <Text size="sm">
                    {getLocalizedText("Dauer:", "Duration:")}{" "}
                    {timerState.activeTime}
                  </Text>
                </Group>
              </Badge>
            </Group>
          </Stack>
        </Box>
      </Card>

      {/* Start Time Adjustments */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title
          order={4}
          mb="md"
          c="light-dark(var(--mantine-color-green-7), var(--mantine-color-green-4))"
        >
          <IconPlayerPlay size={18} style={{ marginRight: "8px" }} />
          {getLocalizedText("Startzeit anpassen", "Adjust Start Time")}
        </Title>

        <Text size="sm" c="dimmed" mb="md">
          {getLocalizedText(
            "Zeit hinzufügen verschiebt die Startzeit nach hinten (mehr Arbeitszeit)",
            "Adding time shifts start time backward (more work time)"
          )}
        </Text>

        <Stack gap="md">
          {/* Quick Adjustments */}
          <Box>
            <Text size="sm" fw={600} mb="xs">
              {getLocalizedText("Schnelle Anpassungen", "Quick Adjustments")}
            </Text>
            <Group gap="xs" justify="center">
              <Button.Group>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleStartTimeChange(-5)}
                >
                  5 Min
                </Button>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleStartTimeChange(-1)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleStartTimeChange(1)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleStartTimeChange(5)}
                >
                  5 Min
                </Button>
              </Button.Group>
            </Group>
          </Box>

          {/* Custom Adjustment */}
          <Box>
            <Text size="sm" fw={600} mb="xs">
              {getLocalizedText(
                "Benutzerdefinierte Anpassung",
                "Custom Adjustment"
              )}
            </Text>
            <Group gap="xs" align="end">
              <NumberInput
                placeholder={getLocalizedText("Minuten", "Minutes")}
                value={startTimeMinutes}
                onChange={(value) => setStartTimeMinutes(Number(value) || 0)}
                style={{ flex: 1 }}
                leftSection={<IconClock size={16} />}
                allowNegative
                description={getLocalizedText(
                  "Positive Werte = mehr Zeit, Negative = weniger Zeit",
                  "Positive values = more time, Negative = less time"
                )}
              />
              <Button
                variant="filled"
                color="green"
                size="md"
                onClick={handleApplyStartTime}
                disabled={startTimeMinutes === 0}
                leftSection={<IconArrowRight size={16} />}
              >
                {getLocalizedText("Anwenden", "Apply")}
              </Button>
            </Group>
          </Box>
        </Stack>
      </Card>

      {/* End Time Adjustments */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title
          order={4}
          mb="md"
          c="light-dark(var(--mantine-color-red-7), var(--mantine-color-red-4))"
        >
          <IconPlayerStop size={18} style={{ marginRight: "8px" }} />
          {getLocalizedText("Endzeit anpassen", "Adjust End Time")}
        </Title>

        <Text size="sm" c="dimmed" mb="md">
          {getLocalizedText(
            "Zeit hinzufügen verschiebt die Endzeit nach vorne (mehr Arbeitszeit)",
            "Adding time shifts end time forward (more work time)"
          )}
        </Text>

        <Stack gap="md">
          {/* Quick Adjustments */}
          <Box>
            <Text size="sm" fw={600} mb="xs">
              {getLocalizedText("Schnelle Anpassungen", "Quick Adjustments")}
            </Text>
            <Group gap="xs" justify="center">
              <Button.Group>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleEndTimeChange(-5)}
                >
                  5 Min
                </Button>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleEndTimeChange(-1)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleEndTimeChange(1)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleEndTimeChange(5)}
                >
                  5 Min
                </Button>
              </Button.Group>
            </Group>
          </Box>

          {/* Custom Adjustment */}
          <Box>
            <Text size="sm" fw={600} mb="xs">
              {getLocalizedText(
                "Benutzerdefinierte Anpassung",
                "Custom Adjustment"
              )}
            </Text>
            <Group gap="xs" align="end">
              <NumberInput
                placeholder={getLocalizedText("Minuten", "Minutes")}
                value={endTimeMinutes}
                onChange={(value) => setEndTimeMinutes(Number(value) || 0)}
                style={{ flex: 1 }}
                leftSection={<IconClock size={16} />}
                allowNegative
                description={getLocalizedText(
                  "Positive Werte = mehr Zeit, Negative = weniger Zeit",
                  "Positive values = more time, Negative = less time"
                )}
              />
              <Button
                variant="filled"
                color="red"
                size="md"
                onClick={handleApplyEndTime}
                disabled={endTimeMinutes === 0}
                leftSection={<IconArrowRight size={16} />}
              >
                {getLocalizedText("Anwenden", "Apply")}
              </Button>
            </Group>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
