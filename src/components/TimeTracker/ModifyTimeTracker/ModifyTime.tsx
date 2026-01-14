import { useState } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";

import {
  Stack,
  Text,
  Box,
  Group,
  Button,
  Alert,
  TextInput,
  Select,
  Card,
  Title,
  Paper,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconClock,
  IconPlayerPlay,
  IconPlus,
  IconMinus,
  IconSettings,
} from "@tabler/icons-react";
import TimeTrackerTimeRow from "../TimeTrackerRow/TimeTrackerTimeRow";
import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface ModifyTimeProps {
  timerState: TimeTrackerState;
}

export default function ModifyTime({ timerState }: ModifyTimeProps) {
  const { getLocalizedText } = useIntl();
  const [activeTimeInput, setActiveTimeInput] = useState("");
  const [timeUnit, setTimeUnit] = useState<"seconds" | "minutes" | "hours">(
    "minutes"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const { updateTimer } = useTimeTrackerManager();

  const handleActiveTimeChange = (change: number) => {
    updateTimer(timerState.id, {
      deltaStartTime: timerState.deltaStartTime + change,
    });
  };

  const parseTimeInput = (
    input: string,
    unit: "seconds" | "minutes" | "hours"
  ): number => {
    const value = parseFloat(input);
    if (isNaN(value)) return 0;

    switch (unit) {
      case "seconds":
        return value;
      case "minutes":
        return value * 60;
      case "hours":
        return value * 3600;
      default:
        return value;
    }
  };

  const getLocalizedTimeUnit = (
    unit: "seconds" | "minutes" | "hours"
  ): string => {
    switch (unit) {
      case "seconds":
        return getLocalizedText("Wert in Sekunden", "Value in Seconds");
      case "minutes":
        return getLocalizedText("Wert in Minuten", "Value in Minutes");
      case "hours":
        return getLocalizedText("Wert in Stunden", "Value in Hours");
      default:
        return getLocalizedText(`Wert in ${unit}`, `Value in ${unit}`);
    }
  };

  const handleCustomActiveTimeChange = () => {
    const seconds = parseTimeInput(activeTimeInput, timeUnit);
    if (seconds !== 0) {
      updateTimer(timerState.id, {
        deltaStartTime: timerState.deltaStartTime + seconds,
      });
      setActiveTimeInput("");
      setErrorMessage("");
    }
  };
  return (
    <Stack gap="lg">
      {/* Aktuelle Zeiten anzeigen */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4} c="dimmed">
            <IconClock size={18} style={{ marginRight: "8px" }} />
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

      {/* Schnelle Anpassungen */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconClock size={18} style={{ marginRight: "8px" }} />
          {getLocalizedText("Schnelle Anpassungen", "Quick Adjustments")}
        </Title>

        <Stack gap="md">
          {/* Aktive Zeit */}
          <Box>
            <Group mb="xs" gap="xs">
              <IconPlayerPlay size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm" fw={600} c="blue.7">
                {getLocalizedText("Aktive Zeit", "Active Time")}
              </Text>
            </Group>
            <Group gap="xs" justify="center">
              <Button.Group>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleActiveTimeChange(-300)}
                >
                  5 Min
                </Button>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconMinus size={14} />}
                  onClick={() => handleActiveTimeChange(-60)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleActiveTimeChange(60)}
                >
                  1 Min
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleActiveTimeChange(300)}
                >
                  5 Min
                </Button>
              </Button.Group>
            </Group>
          </Box>
        </Stack>
      </Card>

      {/* Benutzerdefinierte Anpassungen */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconSettings size={18} style={{ marginRight: "8px" }} />
          {getLocalizedText(
            "Benutzerdefinierte Anpassungen",
            "Custom Adjustments"
          )}
        </Title>

        <Stack gap="md">
          <Select
            label={getLocalizedText("Zeit-Einheit", "Time Unit")}
            value={timeUnit}
            onChange={(value) =>
              setTimeUnit(value as "seconds" | "minutes" | "hours")
            }
            data={[
              {
                value: "seconds",
                label: getLocalizedText("Sekunden", "Seconds"),
              },
              {
                value: "minutes",
                label: getLocalizedText("Minuten", "Minutes"),
              },
              {
                value: "hours",
                label: getLocalizedText("Stunden", "Hours"),
              },
            ]}
            styles={{
              label: {
                fontWeight: 600,
                marginBottom: "0.5rem",
              },
            }}
          />

          <Box>
            <Group gap="xs" align="end">
              <TextInput
                label={getLocalizedText(
                  "Aktive Zeit ändern",
                  "Change Active Time"
                )}
                placeholder={getLocalizedTimeUnit(timeUnit)}
                value={activeTimeInput}
                onChange={(event) =>
                  setActiveTimeInput(event.currentTarget.value)
                }
                style={{ flex: 1 }}
                leftSection={
                  <IconPlayerPlay
                    size={16}
                    color="var(--mantine-color-blue-6)"
                  />
                }
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  },
                }}
              />
              <Button
                variant="filled"
                color="blue"
                size="md"
                onClick={handleCustomActiveTimeChange}
                disabled={!activeTimeInput}
                leftSection={<IconPlus size={16} />}
              >
                {getLocalizedText("Anwenden", "Apply")}
              </Button>
            </Group>
          </Box>

          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
              radius="md"
            >
              {errorMessage}
            </Alert>
          )}
        </Stack>
      </Card>

      <Paper
        p="md"
        radius="md"
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
        withBorder
      >
        <Text size="xs" c="dimmed" ta="center" style={{ lineHeight: 1.4 }}>
          <IconAlertCircle
            size={12}
            color="red"
            style={{ marginRight: "4px", verticalAlign: "middle" }}
          />
          {getLocalizedText(
            "Hinweis: Negative Werte reduzieren die Zeit. Die Zeit kann nicht unter 0 fallen.",
            "Note: Negative values reduce time. Time cannot fall below 0."
          )}
        </Text>
      </Paper>
    </Stack>
  );
}
