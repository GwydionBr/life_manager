import { useIntl } from "@/hooks/useIntl";
import {
  IconClock,
  IconCheck,
  IconX,
  IconClockPlay,
  IconCalendarEvent,
  IconFolder,
  IconTag,
  IconNote,
} from "@tabler/icons-react";

import { CalendarAppointment } from "@/types/workCalendar.types";
import { alpha, Card, Stack, Text, Badge, Group, Divider } from "@mantine/core";

interface AppointmentHoverCardProps {
  appointment: CalendarAppointment;
  color: string;
}

/**
 * Get status icon for hover card
 */
function getStatusIcon(status: CalendarAppointment["status"]) {
  const iconSize = 16;
  switch (status) {
    case "upcoming":
      return <IconClock size={iconSize} />;
    case "active":
      return <IconClockPlay size={iconSize} />;
    case "completed":
      return <IconCheck size={iconSize} />;
    case "missed":
      return <IconX size={iconSize} />;
    case "converted":
      return <IconCalendarEvent size={iconSize} />;
    default:
      return <IconCalendarEvent size={iconSize} />;
  }
}

/**
 * Get status badge color
 */
function getStatusBadgeColor(status: CalendarAppointment["status"]) {
  switch (status) {
    case "upcoming":
      return "blue";
    case "active":
      return "teal";
    case "completed":
      return "green";
    case "missed":
      return "red";
    case "converted":
      return "violet";
    default:
      return "gray";
  }
}

/**
 * Get localized status text
 */
function getStatusText(
  status: CalendarAppointment["status"],
  getLocalizedText: (de: string, en: string) => string
) {
  switch (status) {
    case "upcoming":
      return getLocalizedText("Bevorstehend", "Upcoming");
    case "active":
      return getLocalizedText("Aktiv", "Active");
    case "completed":
      return getLocalizedText("Abgeschlossen", "Completed");
    case "missed":
      return getLocalizedText("Verpasst", "Missed");
    case "converted":
      return getLocalizedText("Konvertiert", "Converted");
    default:
      return status;
  }
}

/**
 * Get localized type text
 */
function getTypeText(
  type: CalendarAppointment["type"],
  getLocalizedText: (de: string, en: string) => string
) {
  switch (type) {
    case "work":
      return getLocalizedText("Arbeit", "Work");
    case "private":
      return getLocalizedText("Privat", "Private");
    case "meeting":
      return getLocalizedText("Meeting", "Meeting");
    case "blocked":
      return getLocalizedText("Gesperrt", "Blocked");
    default:
      return type;
  }
}

export default function AppointmentHoverCard({
  appointment,
  color,
}: AppointmentHoverCardProps) {
  const { formatTimeSpan, formatDateTime, getLocalizedText } = useIntl();
  const start = new Date(appointment.start_date);
  const end = new Date(appointment.end_date);

  return (
    <Card
      withBorder
      bg={alpha(color, 0.15)}
      style={{ borderColor: color, borderTop: `6px solid ${color}` }}
      miw={200}
      radius="md"
    >
      <Card.Section p="sm" style={{ borderBottom: `1px solid ${color}` }}>
        <Group gap="xs" justify="space-between" wrap="nowrap">
          <Text
            size="md"
            fw={600}
            style={{ flex: 1, minWidth: 0 }}
            lineClamp={2}
          >
            {appointment.title}
          </Text>
          <Badge
            size="sm"
            variant="light"
            color={getStatusBadgeColor(appointment.status)}
            leftSection={getStatusIcon(appointment.status)}
          >
            {getStatusText(appointment.status, getLocalizedText)}
          </Badge>
        </Group>
      </Card.Section>
      <Stack pt="sm" pb="xs" gap="sm" px="sm">
        {appointment.projectTitle && (
          <Group gap="xs" wrap="nowrap">
            <IconFolder size={16} style={{ color, flexShrink: 0 }} />
            <Text size="xs" fw={500} style={{ flex: 1 }}>
              {appointment.projectTitle}
            </Text>
          </Group>
        )}
        <Group gap="xs" wrap="nowrap">
          <IconTag size={16} style={{ color, flexShrink: 0 }} />
          <Badge size="xs" variant="outline">
            {getTypeText(appointment.type, getLocalizedText)}
          </Badge>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <IconClock size={16} style={{ color, flexShrink: 0 }} />
          <Stack gap={2} style={{ flex: 1 }}>
            <Text size="xs" fw={500}>
              {formatTimeSpan(start, end)}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDateTime(start)} - {formatDateTime(end)}
            </Text>
          </Stack>
        </Group>
      </Stack>
      {appointment.description && (
        <>
          <Divider color={color} opacity={0.3} />
          <Card.Section p="sm">
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <IconNote
                size={16}
                style={{ color, flexShrink: 0, marginTop: 2 }}
              />
              <Text size="xs" fw={500} style={{ flex: 1 }}>
                {appointment.description}
              </Text>
            </Group>
          </Card.Section>
        </>
      )}
      {appointment.work_time_entry_id && (
        <>
          <Divider color={color} opacity={0.3} />
          <Card.Section p="sm">
            <Group gap="xs" wrap="nowrap">
              <IconCheck
                size={16}
                style={{ color: "var(--mantine-color-green-6)", flexShrink: 0 }}
              />
              <Text size="xs" fw={500} c="green">
                {getLocalizedText(
                  "Als Time Entry gespeichert",
                  "Saved as Time Entry"
                )}
              </Text>
            </Group>
          </Card.Section>
        </>
      )}
    </Card>
  );
}
