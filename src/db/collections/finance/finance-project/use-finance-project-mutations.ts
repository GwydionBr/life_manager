import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/toastFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addFinanceProject,
  updateFinanceProject,
  deleteFinanceProject,
  syncFinanceProjectTags,
} from "./finance-project-mutations";
import {
  FinanceProject,
  InsertFinanceProject,
  UpdateFinanceProject,
} from "@/types/finance.types";

/**
 * Hook for Finance Project operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Finance Projects with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useFinanceProjectMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Finance Project with automatic notification.
   */
  const handleAddFinanceProject = useCallback(
    async (
      newFinanceProject: InsertFinanceProject,
      showNotification: boolean = false
    ): Promise<FinanceProject | undefined> => {
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
        const result = await addFinanceProject(newFinanceProject, profile.id);

        if (!result) {
          console.error("Failed to create finance project:", newFinanceProject);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Finanzprojekts",
              "Error creating finance project"
            )
          );
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Finanzprojekt erfolgreich erstellt",
              "Finance project successfully created"
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
   * Updates a Finance Project with automatic notification.
   */
  const handleUpdateFinanceProject = useCallback(
    async (
      id: string | string[],
      item: UpdateFinanceProject,
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
        const result = await updateFinanceProject(id, item, profile.id);

        if (!result) {
          console.error("Failed to update finance project:", id, item);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Finanzprojekts",
              "Error updating finance project"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Finanzprojekt erfolgreich aktualisiert",
              "Finance project successfully updated"
            )
          );
        }

        return true;
      } catch (error) {
        console.log(error);
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
   * Deletes a Finance Project with automatic notification.
   */
  const handleDeleteFinanceProject = useCallback(
    async (
      id: string | string[],
      showNotification: boolean = false
    ): Promise<boolean> => {
      try {
        const result = await deleteFinanceProject(id);

        if (!result) {
          console.error("Failed to delete finance project:", id);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Finanzprojekts",
              "Error deleting finance project"
            )
          );
          return false;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Finanzprojekt erfolgreich gelöscht",
              "Finance project successfully deleted"
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

  return {
    addFinanceProject: handleAddFinanceProject,
    updateFinanceProject: handleUpdateFinanceProject,
    deleteFinanceProject: handleDeleteFinanceProject,
    // Helper functions
    syncFinanceProjectTags: syncFinanceProjectTags,
  };
};
