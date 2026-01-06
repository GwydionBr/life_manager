import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addWorkProject,
  updateWorkProject,
  deleteWorkProject,
  syncProjectTags,
  getWorkProjectWithTags,
} from "./work-project-mutations";
import { UpdateWorkProject, WorkProject } from "@/types/work.types";
import { Tables, TablesUpdate } from "@/types/db.types";

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
    async (newWorkProject: WorkProject): Promise<WorkProject | undefined> => {
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
        const transaction = addWorkProject(newWorkProject, profile.id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Sync tags if provided
        if (newWorkProject.tags && newWorkProject.tags.length > 0) {
          await syncProjectTags(
            newWorkProject.id,
            newWorkProject.tags.map((tag) => tag.id),
            profile.id
          );
        }

        // Get complete project with tags
        const completeProject = await getWorkProjectWithTags(newWorkProject.id);

        showActionSuccessNotification(
          getLocalizedText(
            "Projekt erfolgreich erstellt",
            "Project successfully created"
          )
        );

        return completeProject;
      } catch (error) {
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
   * Updates a Work Project with automatic notification.
   */
  const handleUpdateWorkProject = useCallback(
    async (
      id: string | string[],
      item: UpdateWorkProject
    ): Promise<WorkProject | undefined> => {
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
        const transaction = updateWorkProject(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Sync tags if provided
        const projectId = typeof id === "string" ? id : id[0];
        if (item.tags && item.tags.length > 0) {
          await syncProjectTags(
            projectId,
            item.tags.map((tag) => tag.id),
            profile.id
          );
        }

        // Get complete project with tags
        const completeProject = await getWorkProjectWithTags(projectId);

        showActionSuccessNotification(
          getLocalizedText(
            "Projekt erfolgreich aktualisiert",
            "Project successfully updated"
          )
        );

        return completeProject;
      } catch (error) {
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
   * Deletes a Work Project with automatic notification.
   */
  const handleDeleteWorkProject = useCallback(
    async (id: string | string[]) => {
      try {
        const transaction = deleteWorkProject(id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Projekt erfolgreich gelöscht",
            "Project successfully deleted"
          )
        );

        return result;
      } catch (error) {
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
    addWorkProject: handleAddWorkProject,
    updateWorkProject: handleUpdateWorkProject,
    deleteWorkProject: handleDeleteWorkProject,
    // Helper functions
    syncProjectTags: syncProjectTags,
    getWorkProjectWithTags: getWorkProjectWithTags,
  };
};
