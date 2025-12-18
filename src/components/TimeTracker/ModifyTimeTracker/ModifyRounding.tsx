import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";

import {
  Stack,
  Text,
  Box,
  Group,
  Button,
  Card,
  Title,
  Select,
  NumberInput,
  Alert,
  Paper,
  Switch,
  Collapse,
  Anchor,
} from "@mantine/core";
import {
  IconSettings,
  IconClock,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  getRoundingInTimeFragments,
  getRoundingModes,
} from "@/constants/settings";
import { RoundingDirection } from "@/types/settings.types";
import { getRoundedSeconds } from "@/lib/workHelperFunctions";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import { getRoundingLabel } from "@/lib/timeTrackerFunctions";
import { SettingsTab } from "@/stores/settingsStore";

interface ModifyRoundingProps {
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  activeSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
  onClose: () => void;
}

export default function ModifyRounding({
  setTempTimerRounding,
  activeSeconds,
  timerRoundingSettings,
  onClose,
}: ModifyRoundingProps) {
  const { getLocalizedText } = useIntl();
  const { locale, setSelectedTab, setIsModalOpen } = useSettingsStore();
  const [roundingSettings, setRoundingSettings] =
    useState<TimerRoundingSettings>(timerRoundingSettings);
  const [loading, setLoading] = useState(false);
  const [previewRoundedSeconds, setPreviewRoundedSeconds] = useState(0);

  useEffect(() => {
    // Initialize with current time tracker settings
    setRoundingSettings(timerRoundingSettings);
  }, [timerRoundingSettings]);

  // Calculate preview of rounded seconds
  useEffect(() => {
    const rounded = getRoundedSeconds(
      activeSeconds,
      roundingSettings.roundingInterval,
      roundingSettings.roundingDirection
    );
    setPreviewRoundedSeconds(rounded);
  }, [roundingSettings, activeSeconds]);

  async function handleApplyRounding() {
    setLoading(true);

    // Update time tracker rounding settings only
    setTempTimerRounding(roundingSettings);

    setLoading(false);
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const hasChanges = roundingSettings !== timerRoundingSettings;

  return (
    <Stack gap="lg">
      {/* Current Rounding Settings */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4} c="dimmed">
            <IconSettings size={18} style={{ marginRight: "8px" }} />
            {getLocalizedText(
              "Aktuelle Rundungs-Einstellungen",
              "Current Rounding Settings"
            )}
          </Title>
        </Group>

        <Group gap="xl" justify="center">
          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              {getLocalizedText("Aktuelle Rundung", "Current Rounding")}
            </Text>
            <Text fw={600}>
              {timerRoundingSettings.roundInTimeFragments
                ? timerRoundingSettings.timeFragmentInterval
                : timerRoundingSettings.roundingInterval}{" "}
              min
            </Text>
          </Box>

          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              {getLocalizedText("Aktueller Modus", "Current Mode")}
            </Text>
            <Text fw={600}>
              {getRoundingLabel(
                timerRoundingSettings.roundingDirection,
                timerRoundingSettings.roundInTimeFragments,
                locale
              )}
            </Text>
          </Box>
        </Group>
      </Card>

      {/* Rounding Configuration */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconSettings size={18} style={{ marginRight: "8px" }} />
          {getLocalizedText("Rundungs-Einstellungen", "Rounding Configuration")}
        </Title>

        <Stack gap="md">
          <Switch
            label={getLocalizedText(
              "Runden in Zeitabschnitten",
              "Round in time fragments"
            )}
            checked={roundingSettings.roundInTimeFragments}
            onChange={(event) =>
              setRoundingSettings({
                ...roundingSettings,
                roundInTimeFragments: event.currentTarget.checked,
              })
            }
          />
          <Collapse in={!roundingSettings.roundInTimeFragments}>
            <Group gap="md" align="end">
              <NumberInput
                label={getLocalizedText(
                  "Rundungsintervall",
                  "Rounding Interval"
                )}
                suffix={getLocalizedText(" Minuten", " minutes")}
                value={roundingSettings.roundingInterval}
                onChange={(value) =>
                  setRoundingSettings({
                    ...roundingSettings,
                    roundingInterval: Number(value),
                  })
                }
                min={1}
                max={1440}
                w={150}
              />
              <Select
                label={getLocalizedText("Rundungs-Modus", "Rounding Mode")}
                value={roundingSettings.roundingDirection}
                onChange={(value) =>
                  setRoundingSettings({
                    ...roundingSettings,
                    roundingDirection: value as RoundingDirection,
                  })
                }
                data={getRoundingModes(locale)}
                w={200}
              />
            </Group>
          </Collapse>
          <Collapse in={roundingSettings.roundInTimeFragments}>
            <Group>
              <Select
                w={200}
                data={getRoundingInTimeFragments(locale)}
                label={getLocalizedText(
                  "Zeitabschnittsintervall",
                  "Time Fragment Interval"
                )}
                placeholder={getLocalizedText(
                  "Intervall auswählen",
                  "Select Default Rounding Amount"
                )}
                value={roundingSettings.timeFragmentInterval.toString()}
                onChange={(value) =>
                  setRoundingSettings({
                    ...roundingSettings,
                    timeFragmentInterval: Number(value),
                  })
                }
              />
            </Group>
          </Collapse>

          {hasChanges && (
            <Button
              onClick={handleApplyRounding}
              loading={loading}
              disabled={loading}
              leftSection={<IconSettings size={16} />}
            >
              {getLocalizedText(
                "Rundungs-Einstellungen anwenden",
                "Apply Rounding Settings"
              )}
            </Button>
          )}
        </Stack>
      </Card>

      {/* Preview */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Title order={4} mb="md" c="dimmed">
          <IconClock size={18} style={{ marginRight: "8px" }} />
          {getLocalizedText("Rundungs-Vorschau", "Rounding Preview")}
        </Title>

        <Stack gap="md">
          <Group gap="xl" justify="center">
            <Box>
              <Text size="sm" c="dimmed" mb="xs">
                {getLocalizedText("Aktive Zeit", "Current Active Time")}
              </Text>
              <Text fw={600} c="blue.7">
                {formatTime(activeSeconds)}
              </Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb="xs">
                {getLocalizedText(
                  "Gerundete aktive Zeit",
                  "Rounded Active Time"
                )}
              </Text>
              <Text fw={600} c="green.7">
                {formatTime(previewRoundedSeconds)}
              </Text>
            </Box>
          </Group>

          {activeSeconds !== previewRoundedSeconds && (
            <Alert
              icon={<IconInfoCircle size="1rem" />}
              color="blue"
              variant="light"
              radius="md"
            >
              <Text size="sm">
                {getLocalizedText(
                  "Zeit wird angepasst um",
                  "Time will be adjusted by"
                )}
                {formatTime(Math.abs(previewRoundedSeconds - activeSeconds))}(
                {previewRoundedSeconds > activeSeconds ? "+" : "-"})
              </Text>
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
            `Hinweis: Rundungs-Einstellungen beeinflussen, wie die Zeit berechnet und gespeichert wird.
             Die Rundungsänderungen werden nur für diesen Zeitrechner beibehalten und werden nach 
             Erstellung einer Zeitaufnahme zurückgesetzt. Um bleibende Rundungsänderungen zu erhalten,
             können Sie die Rundungs-Einstellungen im Projekt oder in den`,
            `Note: Rounding settings affect how time is calculated and saved.
             The rounding changes are kept for this time tracker only and will be reset after creating a time entry.
             To keep permanent rounding changes, you can save the rounding settings in the project or in the`
          )}{" "}
          <Anchor
            component="button"
            onClick={() => {
              setIsModalOpen(true);
              setSelectedTab(SettingsTab.WORK);
              onClose();
            }}
            c="blue"
            fw={500}
            inline
          >
            {getLocalizedText("Arbeits-Einstellungen", "Work Settings")}
          </Anchor>{" "}
          {getLocalizedText("speichern.", "save.")}
        </Text>
      </Paper>
    </Stack>
  );
}
