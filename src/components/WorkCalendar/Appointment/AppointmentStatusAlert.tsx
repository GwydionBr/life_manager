import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useIntl } from "@/hooks/useIntl";
import { Appointment } from "@/types/work.types";
import { AppointmentStatus } from "@/types/workCalendar.types";

interface AppointmentStatusAlertProps {
  appointment: Appointment;
  onMarkAsCompleted: () => void;
  onMarkAsMissed: () => void;
  onConvert: () => void;
  onDismiss: () => void;
}

export function AppointmentStatusAlert({
  appointment,
  onMarkAsCompleted,
  onMarkAsMissed,
  onConvert,
  onDismiss,
}: AppointmentStatusAlertProps) {
  const { getLocalizedText } = useIntl();

  const isMissed = appointment.status === AppointmentStatus.MISSED;
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const hasProject = appointment.work_project_id !== null;

  return (
    <Alert
      icon={<IconExclamationCircle size={16} />}
      title={getLocalizedText(
        isMissed
          ? "Termin als verpasst markiert"
          : "Termin als abgeschlossen markiert",
        isMissed
          ? "Appointment Marked as Missed"
          : "Appointment Marked as Completed"
      )}
      color={isMissed ? "red" : "green"}
      variant="light"
    >
      <Stack gap="sm">
        <Text size="sm">
          {isMissed
            ? getLocalizedText(
                hasProject
                  ? "Wenn es fälschlicherweise als verpasst markiert wurde, kannst Du den Termin in einen Zeiteintrag umwandeln oder als abgeschlossen markieren."
                  : "Wenn es fälschlicherweise als verpasst markiert wurde, kannst Du den Termin als abgeschlossen markieren.",
                hasProject
                  ? "If it was mistakenly marked as missed, you can convert the appointment to a time entry or mark it as completed."
                  : "If it was mistakenly marked as missed, you can mark it as completed."
              )
            : getLocalizedText(
                hasProject
                  ? "Wenn Du den Termin in einen Zeiteintrag umwandeln möchtest, kannst du das jetzt tun."
                  : "Wenn Du ein Projekt hinzufügst, kannst Du den Termin in einen Zeiteintrag umwandeln.",
                hasProject
                  ? "If you want to convert the appointment to a time entry, you can do that now."
                  : "If you add a project, you can convert the appointment to a time entry."
              )}
        </Text>
        <Group gap="sm">
          {isMissed && hasProject && (
            <Button size="xs" variant="light" color="teal" onClick={onConvert}>
              {getLocalizedText(
                "In Zeiteintrag umwandeln",
                "Convert to Time Entry"
              )}
            </Button>
          )}
          {isMissed && (
            <Button
              size="xs"
              variant="light"
              color="green"
              onClick={onMarkAsCompleted}
            >
              {getLocalizedText(
                "Als abgeschlossen markieren",
                "Mark as Completed"
              )}
            </Button>
          )}
          {isCompleted && hasProject && (
            <Button size="xs" variant="light" color="teal" onClick={onConvert}>
              {getLocalizedText(
                "In Zeiteintrag umwandeln",
                "Convert to Time Entry"
              )}
            </Button>
          )}
          {isCompleted && (
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={onMarkAsMissed}
            >
              {getLocalizedText("Als verpasst markieren", "Mark as Missed")}
            </Button>
          )}
          <Button size="xs" variant="subtle" color="gray" onClick={onDismiss}>
            {getLocalizedText("Schließen", "Close")}
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
}
