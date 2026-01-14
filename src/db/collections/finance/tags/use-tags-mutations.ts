import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
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
    async (
      newTag: InsertTag,
      showNotification: boolean = false
    ): Promise<Tag | undefined> => {
      if (!profile?.id) {
        console.error("No profile found");
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
          console.error("Failed to create tag:", newTag);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Tags",
              "Error creating tag"
            )
          );
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Tag erfolgreich erstellt",
              "Tag successfully created"
            )
          );
        }

        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        return;
      }
    },
    [profile?.id, getLocalizedText]
  );

  /**
   * Updates a Tag with automatic notification.
   */
  const handleUpdateTag = useCallback(
    async (
      id: string,
      item: UpdateTag,
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await updateTag(id, item);

        if (!result) {
          console.error("Failed to update tag:", id, item);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Tags",
              "Error updating tag"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Tag erfolgreich aktualisiert",
              "Tag successfully updated"
            )
          );
        }

        return true;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        return false;
      }
    },
    [getLocalizedText]
  );

  /**
   * Deletes a Tag with automatic notification.
   */
  const handleDeleteTag = useCallback(
    async (
      id: string | string[],
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await deleteTag(id);

        if (!result) {
          console.error("Failed to delete tag:", id);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Tags",
              "Error deleting tag"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Tag erfolgreich gelöscht",
              "Tag successfully deleted"
            )
          );
        }

        return result;
      } catch (error) {
        console.error(error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        return false;
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
