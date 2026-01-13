import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addProjectAdjustment,
  updateProjectAdjustment,
  deleteProjectAdjustment,
} from "./project-adjustment-mutations";
import {
  InsertProjectAdjustment,
  UpdateProjectAdjustment,
  ProjectAdjustment,
} from "@/types/finance.types";

/**
 * Hook for Project Adjustment operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Project Adjustments with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useProjectAdjustmentMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Project Adjustment with automatic notification.
   */
  const handleAddProjectAdjustment = useCallback(
    async (
      newProjectAdjustment: InsertProjectAdjustment,
      showNotification: boolean = false
    ): Promise<ProjectAdjustment | undefined> => {
      if (!profile?.id) {
        console.error("No profile found");
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              "Kein Benutzerprofil gefunden",
              "No user profile found"
            )
          );
        }
        return;
      }

      try {
        const result = await addProjectAdjustment(
          newProjectAdjustment,
          profile.id
        );

        if (!result) {
          console.error(
            "Failed to create project adjustment:",
            newProjectAdjustment
          );
          if (showNotification) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Erstellen der Projektanpassung",
                "Error creating project adjustment"
              )
            );
          }
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Projektanpassung erfolgreich erstellt",
              "Project adjustment successfully created"
            )
          );
        }

        return result;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }
    },
    [profile?.id, getLocalizedText]
  );

  /**
   * Updates a Project Adjustment with automatic notification.
   */
  const handleUpdateProjectAdjustment = useCallback(
    async (
      id: string,
      item: UpdateProjectAdjustment,
      showNotification: boolean = false
    ) => {
      try {
        const result = await updateProjectAdjustment(id, item);

        if (!result) {
          console.error("Failed to update project adjustment:", id, item);
          if (showNotification) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Aktualisieren der Projektanpassung",
                "Error updating project adjustment"
              )
            );
          }
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Projektanpassung erfolgreich aktualisiert",
              "Project adjustment successfully updated"
            )
          );
        }

        return true;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }
    },
    [getLocalizedText]
  );

  /**
   * Deletes a Project Adjustment with automatic notification.
   */
  const handleDeleteProjectAdjustment = useCallback(
    async (id: string | string[], showNotification: boolean = false) => {
      try {
        const result = await deleteProjectAdjustment(id);

        if (!result) {
          console.error("Failed to delete project adjustment:", id);
          if (showNotification) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Löschen der Projektanpassung",
                "Error deleting project adjustment"
              )
            );
          }
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Projektanpassung erfolgreich gelöscht",
              "Project adjustment successfully deleted"
            )
          );
        }

        return result;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }
    },
    [getLocalizedText]
  );

  return {
    addProjectAdjustment: handleAddProjectAdjustment,
    updateProjectAdjustment: handleUpdateProjectAdjustment,
    deleteProjectAdjustment: handleDeleteProjectAdjustment,
  };
};
