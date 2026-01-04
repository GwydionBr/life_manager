import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addFinanceProject,
  updateFinanceProject,
  deleteFinanceProject,
  syncFinanceProjectCategories,
  getFinanceProjectWithCategories,
} from "./finance-project-mutations";
import { FinanceProject, InsertFinanceProject } from "@/types/finance.types";
import { TablesUpdate } from "@/types/db.types";

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
      newFinanceProject: InsertFinanceProject
    ): Promise<FinanceProject | undefined> => {
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
        const { promise, data } = await addFinanceProject(
          newFinanceProject,
          profile.id
        );

        if (promise.error) {
          showActionErrorNotification(promise.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Finanzprojekt erfolgreich erstellt",
            "Finance project successfully created"
          )
        );

        return data;
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
   * Updates a Finance Project with automatic notification.
   */
  const handleUpdateFinanceProject = useCallback(
    async (
      id: string | string[],
      item: TablesUpdate<"finance_project">,
      categoryIds?: string[]
    ): Promise<FinanceProject | undefined> => {
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
        const transaction = updateFinanceProject(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Sync categories if provided
        const projectId = typeof id === "string" ? id : id[0];
        if (categoryIds !== undefined) {
          await syncFinanceProjectCategories(
            projectId,
            categoryIds,
            profile.id
          );
        }

        // Get complete project with categories
        const completeProject =
          await getFinanceProjectWithCategories(projectId);

        showActionSuccessNotification(
          getLocalizedText(
            "Finanzprojekt erfolgreich aktualisiert",
            "Finance project successfully updated"
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
   * Deletes a Finance Project with automatic notification.
   */
  const handleDeleteFinanceProject = useCallback(
    async (id: string | string[]) => {
      try {
        const transaction = deleteFinanceProject(id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Finanzprojekt erfolgreich gelöscht",
            "Finance project successfully deleted"
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
    addFinanceProject: handleAddFinanceProject,
    updateFinanceProject: handleUpdateFinanceProject,
    deleteFinanceProject: handleDeleteFinanceProject,
    // Helper functions
    syncFinanceProjectCategories,
    getFinanceProjectWithCategories,
  };
};
