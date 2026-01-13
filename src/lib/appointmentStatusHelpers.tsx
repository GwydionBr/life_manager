import { Appointment } from "@/types/workCalendar.types";
import { IconClock, IconClockPlay, IconCheck, IconX, IconCalendarEvent } from "@tabler/icons-react";

/**
 * Get status-based styling for appointments
 */
export function getStatusStyles(status: Appointment["status"]) {
  switch (status) {
    case "upcoming":  
      return {
        borderColor: "var(--mantine-color-blue-6)",
        bgOpacity: 0.15,
        textOpacity: 1,
      };
    case "active":
      return {
        borderColor: "var(--mantine-color-teal-6)",
        bgOpacity: 0.25,
        textOpacity: 1,
      };
    case "completed":
      return {
        borderColor: "var(--mantine-color-green-6)",
        bgOpacity: 0.1,
        textOpacity: 0.7,
      };
    case "missed":
      return {
        borderColor: "var(--mantine-color-red-6)",
        bgOpacity: 0.1,
        textOpacity: 0.6,
      };
    case "converted":
      return {
        borderColor: "var(--mantine-color-violet-6)",
        bgOpacity: 0.1,
        textOpacity: 0.7,
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
export function getStatusIcon(status: Appointment["status"]) {
  const iconSize = 12;
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
 * Get localized status text
 */
export function getStatusText(
  status: Appointment["status"],
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
