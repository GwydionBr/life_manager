import { Badge } from "@mantine/core";
import { useIntl } from "@/hooks/useIntl";
import { Appointment } from "@/types/work.types";
import {
  AppointmentStatus,
  CalendarAppointment,
} from "@/types/workCalendar.types";
import {
  IconCalendarEvent,
  IconClock,
  IconClockPlay,
  IconCheck,
  IconX,
  IconClockQuestion,
} from "@tabler/icons-react";

interface AppointmentStatusBadgeProps {
  status: Appointment["status"];
  converted: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Badge component to display appointment status with appropriate colors.
 *
 * Color coding:
 * - upcoming: blue
 * - active: orange
 * - completed: green
 * - missed: red
 * - converted: teal
 */
export function AppointmentStatusBadge({
  status,
  size = "sm",
  converted,
}: AppointmentStatusBadgeProps) {
  const { getLocalizedText } = useIntl();

  /**
   * Get status icon for hover card
   */
  function getStatusIcon(status: CalendarAppointment["status"]) {
    const iconSize = 16;
    if (converted) {
      return <IconCalendarEvent size={iconSize} />;
    }
    switch (status) {
      case AppointmentStatus.UPCOMING:
        return <IconClock size={iconSize} />;
      case AppointmentStatus.ACTIVE:
        return <IconClockPlay size={iconSize} />;
      case AppointmentStatus.FINISHED:
        return <IconClockQuestion size={iconSize} />;
      case AppointmentStatus.COMPLETED:
        return <IconCheck size={iconSize} />;
      case AppointmentStatus.MISSED:
        return <IconX size={iconSize} />;
      default:
        return <IconCalendarEvent size={iconSize} />;
    }
  }

  /**
   * Get status badge color
   */
  function getStatusBadgeColor(status: CalendarAppointment["status"]) {
    if (converted) {
      return "violet";
    }
    switch (status) {
      case AppointmentStatus.UPCOMING:
        return "blue";
      case AppointmentStatus.ACTIVE:
        return "teal";
      case AppointmentStatus.FINISHED:
        return "lime";
      case AppointmentStatus.COMPLETED:
        return "green";
      case AppointmentStatus.MISSED:
        return "red";
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
    if (converted) {
      return getLocalizedText("Umgewandelt", "Converted");
    }
    switch (status) {
      case AppointmentStatus.UPCOMING:
        return getLocalizedText("Anstehend", "Upcoming");
      case AppointmentStatus.ACTIVE:
        return getLocalizedText("Aktiv", "Active");
      case AppointmentStatus.FINISHED:
        return getLocalizedText("Vorbei", "Finished");
      case AppointmentStatus.COMPLETED:
        return getLocalizedText("Abgeschlossen", "Completed");
      case AppointmentStatus.MISSED:
        return getLocalizedText("Verpasst", "Missed");
      default:
        return status;
    }
  }

  return (
    <Badge
      size={size}
      variant="light"
      color={getStatusBadgeColor(status)}
      leftSection={getStatusIcon(status)}
    >
      {getStatusText(status, getLocalizedText)}
    </Badge>
  );
}
