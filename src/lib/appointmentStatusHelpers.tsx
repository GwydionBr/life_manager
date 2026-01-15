import { AppointmentStatus } from "@/types/workCalendar.types";
import {
  IconClock,
  IconClockPlay,
  IconCheck,
  IconX,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { AppointmentStatusType } from "@/types/workCalendar.types";

/**
 * Get status-based styling for appointments
 */
export function getStatusStyles(
  status: AppointmentStatusType,
  converted: boolean
) {
  if (converted) {
    return {
      borderColor: "var(--mantine-color-violet-6)",
      bgOpacity: 0.1,
      textOpacity: 0.7,
    };
  }
  switch (status) {
    case AppointmentStatus.UPCOMING:
      return {
        borderColor: "var(--mantine-color-blue-6)",
        bgOpacity: 0.15,
        textOpacity: 1,
      };
    case AppointmentStatus.ACTIVE:
      return {
        borderColor: "var(--mantine-color-teal-6)",
        bgOpacity: 0.25,
        textOpacity: 1,
      };
    case AppointmentStatus.COMPLETED:
      return {
        borderColor: "var(--mantine-color-green-6)",
        bgOpacity: 0.1,
        textOpacity: 0.7,
      };
    case AppointmentStatus.MISSED:
      return {
        borderColor: "var(--mantine-color-red-6)",
        bgOpacity: 0.1,
        textOpacity: 0.6,
      };
    default:
      return {
        borderColor: "var(--mantine-color-gray-6)",
        bgOpacity: 0.15,
        textOpacity: 1,
      };
  }
}

/**
 * Get status icon
 */
export function getStatusIcon(
  status: AppointmentStatusType,
  converted: boolean
) {
  const iconSize = 12;
  if (converted) {
    return <IconCalendarEvent size={iconSize} />;
  }
  switch (status) {
    case AppointmentStatus.UPCOMING:
      return <IconClock size={iconSize} />;
    case AppointmentStatus.ACTIVE:
      return <IconClockPlay size={iconSize} />;
    case AppointmentStatus.COMPLETED:
      return <IconCheck size={iconSize} />;
    case AppointmentStatus.MISSED:
      return <IconX size={iconSize} />;
    default:
      return <IconCalendarEvent size={iconSize} />;
  }
}

/**
 * Get localized status text
 */
export function getStatusText(
  status: AppointmentStatusType,
  converted: boolean,
  getLocalizedText: (de: string, en: string) => string
) {
  if (converted) {
    return getLocalizedText("Konvertiert", "Converted");
  }
  switch (status) {
    case AppointmentStatus.UPCOMING:
      return getLocalizedText("Bevorstehend", "Upcoming");
    case AppointmentStatus.ACTIVE:
      return getLocalizedText("Aktiv", "Active");
    case AppointmentStatus.COMPLETED:
      return getLocalizedText("Abgeschlossen", "Completed");
    case AppointmentStatus.MISSED:
      return getLocalizedText("Verpasst", "Missed");
    default:
      return status;
  }
}
