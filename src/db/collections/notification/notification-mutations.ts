import { notificationsCollection } from "@/db/collections/notification/notification-collection";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";

type Notification = Tables<"notification">;
type InsertNotification = TablesInsert<"notification">;
type UpdateNotification = TablesUpdate<"notification">;

/**
 * Adds a new Notification.
 *
 * @param newNotification - The data of the new notification
 * @param userId - The user ID
 * @returns The new Notification or undefined if an error occurs
 */
export const addNotification = async (
  newNotification: InsertNotification,
  userId: string
) => {
  const notificationToInsert: Notification = {
    id: newNotification.id || crypto.randomUUID(),
    created_at: newNotification.created_at || new Date().toISOString(),
    user_id: userId,
    type: newNotification.type,
    dismissed_at: newNotification.dismissed_at || null,
    title: newNotification.title,
    body: newNotification.body || null,
    priority: newNotification.priority,
    resource_type: newNotification.resource_type || null,
    resource_id: newNotification.resource_id || null,
    read_at: newNotification.read_at || null,
    scheduled_for: newNotification.scheduled_for || null,
  };

  try {
    const transaction = notificationsCollection.insert(notificationToInsert);
    await transaction.isPersisted.promise;
    return notificationToInsert;
  } catch (error) {
    console.error(error);
    return;
  }
};

/**
 * Updates a Notification.
 *
 * @param id - The ID of the notification to update
 * @param item - The item to update
 * @returns Returns true if the notification was updated, false otherwise
 */
export const updateNotification = async (
  id: string,
  item: UpdateNotification
) => {
  try {
    const transaction = notificationsCollection.update(id, (draft) => {
      Object.assign(draft, item);
    });
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Deletes a Notification.
 *
 * @param id - The ID or IDs of the notification to delete
 * @returns True if the notification was deleted, false otherwise
 */
export const deleteNotification = async (id: string | string[]) => {
  try {
    const transaction = notificationsCollection.delete(id);
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Adds a notification silently without showing any UI feedback.
 * Used for automated notifications (e.g., appointment reminders).
 *
 * @param newNotification - The data of the new notification
 * @param userId - The user ID
 * @returns The new Notification or undefined if an error occurs
 */
export const addNotificationSilent = async (
  newNotification: InsertNotification,
  userId: string
): Promise<Notification | undefined> => {
  const notificationToInsert: Notification = {
    id: newNotification.id || crypto.randomUUID(),
    created_at: newNotification.created_at || new Date().toISOString(),
    user_id: userId,
    type: newNotification.type,
    dismissed_at: newNotification.dismissed_at || null,
    title: newNotification.title,
    body: newNotification.body || null,
    priority: newNotification.priority,
    resource_type: newNotification.resource_type || null,
    resource_id: newNotification.resource_id || null,
    read_at: newNotification.read_at || null,
    scheduled_for: newNotification.scheduled_for || null,
  };

  try {
    const transaction = notificationsCollection.insert(notificationToInsert);
    await transaction.isPersisted.promise;
    return notificationToInsert;
  } catch (error) {
    console.error("Error creating silent notification:", error);
    return undefined;
  }
};

/**
 * Checks if a notification already exists for a given resource and type.
 *
 * @param resourceId - The resource ID to check
 * @param type - The notification type
 * @returns True if notification exists, false otherwise
 */
export const checkNotificationExists = async (
  resourceId: string,
  type: Notification["type"]
): Promise<boolean> => {
  try {
    const notifications = Array.from(notificationsCollection.state.values());
    return notifications.some(
      (n) => n.resource_id === resourceId && n.type === type
    );
  } catch (error) {
    console.error("Error checking notification existence:", error);
    return false;
  }
};
