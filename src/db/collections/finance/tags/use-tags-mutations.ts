import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import { addTag, updateTag, deleteTag } from "./tags-mutations";
import { InsertTag, UpdateTag, Tag } from "@/types/finance.types";

/**
 * Hook for Tag operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Tags with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useTagsMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Tag with automatic notification.
   */
  const handleAddTag = useCallback(
    async (newTag: InsertTag): Promise<Tag | undefined> => {
      if (!profile?.id) {
        showActionErrorNotification(
          getLocalizedText(
            "Kein Benutzerprofil gefunden",
            "No user profile found"
          )
        );
        return;
      }

      try {
        const result = await addTag(newTag, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Tags",
              "Error creating tag"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Tag erfolgreich erstellt",
            "Tag successfully created"
          )
        );

        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [profile?.id, getLocalizedText]
  );

  /**
   * Updates a Tag with automatic notification.
   */
  const handleUpdateTag = useCallback(
    async (id: string, item: UpdateTag) => {
      try {
        const result = await updateTag(id, item);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Tags",
              "Error updating tag"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Tag erfolgreich aktualisiert",
            "Tag successfully updated"
          )
        );

        return true;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [getLocalizedText]
  );

  /**
   * Deletes a Tag with automatic notification.
   */
  const handleDeleteTag = useCallback(
    async (id: string | string[]) => {
      try {
        const result = await deleteTag(id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Tags",
              "Error deleting tag"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Tag erfolgreich gelöscht",
            "Tag successfully deleted"
          )
        );

        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [getLocalizedText]
  );

  return {
    addTag: handleAddTag,
    updateTag: handleUpdateTag,
    deleteTag: handleDeleteTag,
  };
};
