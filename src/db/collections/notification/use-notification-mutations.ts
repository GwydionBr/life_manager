import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useNotifications } from "./use-notification-query";
import {
  addNotification,
  updateNotification,
  deleteNotification,
} from "./notification-mutations";
import {
  InsertNotification,
  UpdateNotification,
  Notification,
} from "@/types/system.types";
import { NotificationType } from "@/types/workCalendar.types";

/**
 * Hook for Notification operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Notifications with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useNotificationMutations = () => {
  const { data: profile } = useProfile();
  const { data: existingNotifications } = useNotifications();

  /**
   * Adds a new Notification with automatic notification.
   */
  const handleAddNotification = useCallback(
    async (
      newNotification: InsertNotification
    ): Promise<Notification | undefined> => {
      if (!profile?.id) {
        return undefined;
      }

      try {
        const result = await addNotification(newNotification, profile.id);

        return result;
      } catch (error) {
        console.error(error);
      }
    },
    [profile?.id]
  );

  /**
   * Updates a Notification with automatic notification.
   */
  const handleUpdateNotification = useCallback(
    async (id: string, item: UpdateNotification): Promise<boolean> => {
      try {
        const result = await updateNotification(id, item);

        return result;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    []
  );

  /**
   * Deletes a Notification with automatic notification.
   */
  const handleDeleteNotification = useCallback(
    async (id: string | string[]): Promise<boolean> => {
      try {
        const result = await deleteNotification(id);
        return result;
      } catch (error) {
        console.error(error);

        return false;
      }
    },
    []
  );

  /**
   * Marks a Notification as read.
   */
  const handleMarkAsRead = useCallback(
    async (id: string): Promise<boolean> => {
      return handleUpdateNotification(id, {
        read_at: new Date().toISOString(),
      });
    },
    [handleUpdateNotification]
  );

  /**
   * Marks a Notification as dismissed.
   */
  const handleDismiss = useCallback(
    async (id: string): Promise<boolean> => {
      return handleUpdateNotification(id, {
        dismissed_at: new Date().toISOString(),
      });
    },
    [handleUpdateNotification]
  );

  /**
   * Find an existing notification for a given resource and type.
   */
  const findNotification = useCallback(
    (resourceId: string, type: NotificationType) => {
      if (!existingNotifications) return null;
      return existingNotifications.find(
        (n) => n.resource_id === resourceId && n.type === type
      );
    },
    [existingNotifications]
  );

  return {
    addNotification: handleAddNotification,
    updateNotification: handleUpdateNotification,
    deleteNotification: handleDeleteNotification,
    markAsRead: handleMarkAsRead,
    dismiss: handleDismiss,
    findNotification,
  };
};
