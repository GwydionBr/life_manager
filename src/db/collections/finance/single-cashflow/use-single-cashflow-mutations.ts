import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addSingleCashflow,
  updateSingleCashflow,
  deleteSingleCashflow,
  syncSingleCashflowCategories,
  getSingleCashflowWithCategories,
} from "./single-cashflow-mutations";
import { InsertSingleCashFlow, SingleCashFlow } from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";

/**
 * Hook for Single Cashflow operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Single Cashflows with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useSingleCashflowMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Single Cashflow with automatic notification.
   */
  const handleAddSingleCashflow = useCallback(
    async (
      newSingleCashflow: InsertSingleCashFlow
    ): Promise<SingleCashFlow | undefined> => {
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
        const cashflowId = newSingleCashflow.id || crypto.randomUUID();
        const transaction = addSingleCashflow(
          { ...newSingleCashflow, id: cashflowId },
          profile.id
        );
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Sync categories if provided
        if (
          newSingleCashflow.categories &&
          newSingleCashflow.categories.length > 0
        ) {
          await syncSingleCashflowCategories(
            cashflowId,
            newSingleCashflow.categories.map(
              (category) => category.finance_category.id
            ),
            profile.id
          );
        }

        // Get complete cashflow with categories
        const completeCashflow =
          await getSingleCashflowWithCategories(cashflowId);

        showActionSuccessNotification(
          getLocalizedText(
            "Einzelner Cashflow erfolgreich erstellt",
            "Single cashflow successfully created"
          )
        );

        return completeCashflow;
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
   * Updates a Single Cashflow with automatic notification.
   */
  const handleUpdateSingleCashflow = useCallback(
    async (
      id: string | string[],
      item: TablesUpdate<"single_cash_flow">,
      categoryIds?: string[]
    ): Promise<SingleCashFlow | undefined> => {
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
        const transaction = updateSingleCashflow(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Sync categories if provided
        const cashflowId = typeof id === "string" ? id : id[0];
        if (categoryIds !== undefined) {
          await syncSingleCashflowCategories(
            cashflowId,
            categoryIds,
            profile.id
          );
        }

        // Get complete cashflow with categories
        const completeCashflow =
          await getSingleCashflowWithCategories(cashflowId);

        showActionSuccessNotification(
          getLocalizedText(
            "Einzelner Cashflow erfolgreich aktualisiert",
            "Single cashflow successfully updated"
          )
        );

        return completeCashflow;
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
   * Deletes a Single Cashflow with automatic notification.
   */
  const handleDeleteSingleCashflow = useCallback(
    async (id: string | string[]) => {
      try {
        const transaction = deleteSingleCashflow(id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Einzelner Cashflow erfolgreich gelöscht",
            "Single cashflow successfully deleted"
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
    addSingleCashflow: handleAddSingleCashflow,
    updateSingleCashflow: handleUpdateSingleCashflow,
    deleteSingleCashflow: handleDeleteSingleCashflow,
    // Helper functions
    syncSingleCashflowCategories,
    getSingleCashflowWithCategories,
  };
};
