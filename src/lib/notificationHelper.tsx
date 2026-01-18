import { Notification as NotificationData } from "@/types/system.types";
import { IconBell, IconAlertCircle, IconCalendar } from "@tabler/icons-react";

/**
 * Returns an icon component based on the notification type.
 */
export const getNotificationIcon = (type: NotificationData["type"]) => {
  switch (type) {
    case "appointment.reminder":
      return <IconBell size={20} />;
    case "appointment.start":
      return <IconCalendar size={20} />;
    case "system.version":
      return <IconAlertCircle size={20} />;
    default:
      return <IconBell size={20} />;
  }
};

/**
 * Returns a color based on the notification type.
 */
export const getNotificationColor = (type: NotificationData["type"]) => {
  switch (type) {
    case "appointment.reminder":
      return "blue";
    case "appointment.start":
      return "orange";
    case "system.version":
      return "yellow";
    default:
      return "blue";
  }
};
