import { Badge } from "@mantine/core";
import { useIntl } from "@/hooks/useIntl";
import { Appointment } from "@/types/work.types";

interface AppointmentStatusBadgeProps {
  status: Appointment["status"];
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
}: AppointmentStatusBadgeProps) {
  const { getLocalizedText } = useIntl();

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return "blue";
      case "active":
        return "orange";
      case "completed":
        return "green";
      case "missed":
        return "red";
      case "converted":
        return "teal";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return getLocalizedText("Anstehend", "Upcoming");
      case "active":
        return getLocalizedText("Aktiv", "Active");
      case "completed":
        return getLocalizedText("Abgeschlossen", "Completed");
      case "missed":
        return getLocalizedText("Verpasst", "Missed");
      case "converted":
        return getLocalizedText("Umgewandelt", "Converted");
      default:
        return status;
    }
  };

  return (
    <Badge color={getStatusColor(status)} size={size} variant="light">
      {getStatusLabel(status)}
    </Badge>
  );
}
