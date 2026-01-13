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
  IconPlayerPlay,
} from "@tabler/icons-react";

import { CalendarAppointment } from "@/types/workCalendar.types";
import {
  alpha,
  Card,
  Stack,
  Text,
  Badge,
  Group,
  Divider,
  Button,
} from "@mantine/core";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import {
  canStartTimerFromAppointment,
  shouldShowTimerButton,
  getProjectRoundingSettings,
} from "@/lib/appointmentTimerHelpers";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";

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

  // Timer integration
  const { data: projects } = useWorkProjects();
  const { data: settings } = useSettings();
  const { updateAppointment } = useAppointmentMutations();
  const { addTimer, getAllTimers } = useTimeTrackerManager();

  // Check if we should show the timer button
  const existingTimers = getAllTimers();
  const showTimer =
    canStartTimerFromAppointment(appointment) &&
    shouldShowTimerButton(appointment, existingTimers);

  const handleStartTimer = async () => {
    // Find the project
    const project = projects?.find((p) => p.id === appointment.work_project_id);

    if (!project) {
      showActionErrorNotification(
        getLocalizedText("Projekt nicht gefunden", "Project not found")
      );
      return;
    }

    // Get rounding settings
    const roundingSettings = getProjectRoundingSettings(project, {
      roundingInterval: settings?.rounding_interval ?? 0,
      roundingDirection: settings?.rounding_direction ?? "up",
      roundInTimeFragments: settings?.round_in_time_sections ?? false,
      timeFragmentInterval: settings?.time_section_interval ?? 15,
    });

    // Add timer with appointment metadata
    const result = addTimer(project, roundingSettings, {
      appointmentId: appointment.id,
      appointmentTitle: appointment.title,
    });

    if (result.success) {
      // Update appointment status to active
      await updateAppointment(appointment.id, { status: "active" });

      showActionSuccessNotification(
        getLocalizedText("Timer gestartet", "Timer started")
      );
    } else {
      showActionErrorNotification(
        result.error
          ? getLocalizedText(result.error.german, result.error.english)
          : getLocalizedText(
              "Timer konnte nicht gestartet werden",
              "Failed to start timer"
            )
      );
    }
  };

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
        {showTimer && (
          <Button
            size="xs"
            variant="light"
            color="teal"
            leftSection={<IconPlayerPlay size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleStartTimer();
            }}
            fullWidth
          >
            {getLocalizedText("Timer starten", "Start Timer")}
          </Button>
        )}
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
