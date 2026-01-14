import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconTransform } from "@tabler/icons-react";
import { useIntl } from "@/hooks/useIntl";
import { Appointment } from "@/types/work.types";

interface AppointmentConversionPromptAlertProps {
  appointment: Appointment;
  onConvert: () => void;
  onMarkAsMissed: () => void;
  onDismiss: () => void;
}

export function AppointmentConversionPromptAlert({
  appointment: _,
  onConvert,
  onMarkAsMissed,
  onDismiss,
}: AppointmentConversionPromptAlertProps) {
  const { getLocalizedText } = useIntl();

  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title={getLocalizedText("Termin ist vorbei", "Appointment has passed")}
      color="orange"
      variant="light"
    >
      <Stack gap="sm">
        <Text size="sm">
          {getLocalizedText(
            "Dieser Termin ist bereits vorbei. Möchten Sie ihn in einen Zeiteintrag umwandeln?",
            "This appointment has already passed. Would you like to convert it to a time entry?"
          )}
        </Text>
        <Group gap="sm">
          <Button
            size="xs"
            variant="light"
            color="teal"
            leftSection={<IconTransform size={14} />}
            onClick={onConvert}
          >
            {getLocalizedText("Umwandeln", "Convert")}
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={onMarkAsMissed}
          >
            {getLocalizedText("Als verpasst markieren", "Mark as Missed")}
          </Button>
          <Button size="xs" variant="subtle" color="gray" onClick={onDismiss}>
            {getLocalizedText("Abbrechen", "Cancel")}
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
