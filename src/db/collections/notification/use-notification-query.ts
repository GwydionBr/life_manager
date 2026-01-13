import { useLiveQuery, and, isNull, eq, lt } from "@tanstack/react-db";
import { notificationsCollection } from "./notification-collection";
import { Database } from "@/types/db.types";

type NotificationType = Database["public"]["Enums"]["notificationType"];

export const useNotifications = () =>
  useLiveQuery((q) => q.from({ notifications: notificationsCollection }));

export const useUnreadNotifications = () => {
  return useLiveQuery((q) => {
    return q
      .from({ notifications: notificationsCollection })
      .where(({ notifications }) =>
        and(
          isNull(notifications.read_at),
          isNull(notifications.dismissed_at),
          lt(notifications.scheduled_for, new Date().toISOString())
        )
      );
  });
};

/**
 * Query to check if a notification exists for a specific resource and type.
 * Used to prevent duplicate notifications for the same event.
 */
export const useNotificationByResourceAndType = (
  resourceId: string | null,
  type: NotificationType
) => {
  return useLiveQuery((q) => {
    if (!resourceId) {
      return q
        .from({ notifications: notificationsCollection })
        .where(() => false);
    }
    return q
      .from({ notifications: notificationsCollection })
      .where(({ notifications }) =>
        and(
          eq(notifications.resource_id, resourceId),
          eq(notifications.type, type)
        )
      );
  });
};

/**
 * Query to get recent notifications (not dismissed) sorted by creation date.
 * Used for the notification dropdown display.
 */
export const useRecentNotifications = (limit: number = 20) => {
  return useLiveQuery((q) => {
    return q
      .from({ notifications: notificationsCollection })
      .where(({ notifications }) =>
        and(
          isNull(notifications.dismissed_at),
          lt(notifications.scheduled_for, new Date().toISOString())
        )
      )
      .orderBy(({ notifications }) => notifications.created_at, "desc")
      .limit(limit);
  });
};
