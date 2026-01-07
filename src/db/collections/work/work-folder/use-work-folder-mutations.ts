import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addWorkFolder,
  updateWorkFolder,
  deleteWorkFolder,
} from "./work-folder-mutations";
import {
  InsertWorkFolder,
  UpdateWorkFolder,
  WorkFolder,
} from "@/types/work.types";

/**
 * Hook for Work Folder operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Work Folders with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useWorkFolderMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Work Folder with automatic notification.
   */
  const handleAddWorkFolder = useCallback(
    async (
      newWorkFolder: InsertWorkFolder
    ): Promise<WorkFolder | undefined> => {
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
        const result = await addWorkFolder(newWorkFolder, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Ordners",
              "Error creating folder"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Ordner erfolgreich erstellt",
            "Folder successfully created"
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
   * Updates a Work Folder with automatic notification.
   */
  const handleUpdateWorkFolder = useCallback(
    async (id: string, item: UpdateWorkFolder) => {
      try {
        const result = await updateWorkFolder(id, item);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Ordners",
              "Error updating folder"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Ordner erfolgreich aktualisiert",
            "Folder successfully updated"
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
   * Deletes a Work Folder with automatic notification.
   */
  const handleDeleteWorkFolder = useCallback(
    async (id: string | string[]) => {
      try {
        const result = await deleteWorkFolder(id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Ordners",
              "Error deleting folder"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Ordner erfolgreich gelöscht",
            "Folder successfully deleted"
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
    addWorkFolder: handleAddWorkFolder,
    updateWorkFolder: handleUpdateWorkFolder,
    deleteWorkFolder: handleDeleteWorkFolder,
  };
};
