import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/toastFunctions";
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
      newWorkFolder: InsertWorkFolder,
      showNotification: boolean = false
    ): Promise<WorkFolder | undefined> => {
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
        const result = await addWorkFolder(newWorkFolder, profile.id);

        if (!result) {
          console.error("Failed to create work folder:", newWorkFolder);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Ordners",
              "Error creating folder"
            )
          );
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Ordner erfolgreich erstellt",
              "Folder successfully created"
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
   * Updates a Work Folder with automatic notification.
   */
  const handleUpdateWorkFolder = useCallback(
    async (
      id: string,
      item: UpdateWorkFolder,
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await updateWorkFolder(id, item);

        if (!result) {
          console.error("Failed to update work folder:", id, item);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Ordners",
              "Error updating folder"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Ordner erfolgreich aktualisiert",
              "Folder successfully updated"
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

  /**
   * Deletes a Work Folder with automatic notification.
   */
  const handleDeleteWorkFolder = useCallback(
    async (
      id: string | string[],
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await deleteWorkFolder(id);

        if (!result) {
          console.error("Failed to delete work folder:", id);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Ordners",
              "Error deleting folder"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Ordner erfolgreich gelöscht",
              "Folder successfully deleted"
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
    addWorkFolder: handleAddWorkFolder,
    updateWorkFolder: handleUpdateWorkFolder,
    deleteWorkFolder: handleDeleteWorkFolder,
  };
};
