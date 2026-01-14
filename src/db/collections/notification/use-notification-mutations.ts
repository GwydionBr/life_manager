import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useNotifications } from "./use-notification-query";
import { useIntl } from "@/hooks/useIntl";
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
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/lib/notificationFunctions";

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
  const { getLocalizedText } = useIntl();
  const { data: existingNotifications } = useNotifications();

  /**
   * Adds a new Notification with automatic notification.
   */
  const handleAddNotification = useCallback(
    async (
      newNotification: InsertNotification,
      showNotification: boolean = false
    ): Promise<Notification | undefined> => {
      if (!profile?.id) {
        console.error("No profile found");
        showActionErrorNotification(
          getLocalizedText(
            "Fehler beim Hinzufügen der Benachrichtigung",
            "Error adding notification"
          )
        );
        return;
      }

      try {
        const result = await addNotification(newNotification, profile.id);

        if (!result) {
          console.error("Failed to add notification:", newNotification);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Hinzufügen der Benachrichtigung",
              "Error adding notification"
            )
          );
          return;
        }
        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Benachrichtigung erfolgreich hinzugefügt",
              "Notification successfully added"
            )
          );
        }
        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            "Fehler beim Hinzufügen der Benachrichtigung",
            "Error adding notification"
          )
        );
        return;
      }
    },
    [profile?.id, getLocalizedText]
  );

  /**
   * Updates a Notification with automatic notification.
   */
  const handleUpdateNotification = useCallback(
    async (
      id: string,
      item: UpdateNotification,
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await updateNotification(id, item);

        if (!result) {
          console.error("Failed to update notification:", id);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren der Benachrichtigung",
              "Error updating notification"
            )
          );
          return false;
        }
        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Benachrichtigung erfolgreich aktualisiert",
              "Notification successfully updated"
            )
          );
        }
        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            "Fehler beim Aktualisieren der Benachrichtigung",
            "Error updating notification"
          )
        );
        return false;
      }
    },
    [getLocalizedText]
  );

  /**
   * Deletes a Notification with automatic notification.
   */
  const handleDeleteNotification = useCallback(
    async (
      id: string | string[],
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await deleteNotification(id);
        if (!result) {
          console.error("Failed to delete notification:", id);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen der Benachrichtigung",
              "Error deleting notification"
            )
          );
          return false;
        }
        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Benachrichtigung erfolgreich gelöscht",
              "Notification successfully deleted"
            )
          );
        }
        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            "Fehler beim Löschen der Benachrichtigung",
            "Error deleting notification"
          )
        );
        return false;
      }
    },
    [getLocalizedText]
  );

  /**
   * Marks a Notification as read.
   */
  const handleMarkAsRead = useCallback(
    async (id: string, showNotification: boolean = false): Promise<boolean> => {
      return handleUpdateNotification(
        id,
        {
          read_at: new Date().toISOString(),
        },
        showNotification
      );
    },
    [handleUpdateNotification]
  );

  /**
   * Marks a Notification as dismissed.
   */
  const handleDismiss = useCallback(
    async (id: string, showNotification: boolean = false): Promise<boolean> => {
      return handleUpdateNotification(
        id,
        {
          dismissed_at: new Date().toISOString(),
        },
        showNotification
      );
    },
    [handleUpdateNotification]
  );

  /**
   * Find an existing notification for a given resource and type.
   */
  const findNotification = useCallback(
    (resourceId: string, type: NotificationType): Notification | undefined => {
      if (!existingNotifications) return;
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
