import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addWorkProject,
  updateWorkProject,
  deleteWorkProject,
} from "./work-project-mutations";
import {
  InsertWorkProject,
  UpdateWorkProject,
  WorkProject,
} from "@/types/work.types";

/**
 * Hook for Work Project operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Work Projects with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useWorkProjectMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Work Project with automatic notification.
   */
  const handleAddWorkProject = useCallback(
    async (
      newWorkProject: InsertWorkProject,
      showNotification: boolean = false
    ): Promise<WorkProject | undefined> => {
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
        const result = await addWorkProject(newWorkProject, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Projekts",
              "Error creating project"
            )
          );
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Projekt erfolgreich erstellt",
              "Project successfully created"
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
   * Updates a Work Project with automatic notification.
   */
  const handleUpdateWorkProject = useCallback(
    async (
      id: string,
      item: UpdateWorkProject,
      showNotification: boolean = false
    ): Promise<boolean> => {
      if (!profile?.id) {
        console.error("No profile found");
        showActionErrorNotification(
          getLocalizedText(
            "Kein Benutzerprofil gefunden",
            "No user profile found"
          )
        );
        return false;
      }

      try {
        const result = await updateWorkProject(id, item, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Projekts",
              "Error updating project"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Projekt erfolgreich aktualisiert",
              "Project successfully updated"
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
    [profile?.id, getLocalizedText]
  );

  /**
   * Deletes a Work Project with automatic notification.
   */
  const handleDeleteWorkProject = useCallback(
    async (
      id: string | string[],
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await deleteWorkProject(id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Projekts",
              "Error deleting project"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Projekt erfolgreich gelöscht",
              "Project successfully deleted"
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
    addWorkProject: handleAddWorkProject,
    updateWorkProject: handleUpdateWorkProject,
    deleteWorkProject: handleDeleteWorkProject,
  };
};
