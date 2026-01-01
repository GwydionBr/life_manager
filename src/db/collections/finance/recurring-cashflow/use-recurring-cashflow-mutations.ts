import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addRecurringCashflow,
  updateRecurringCashflow,
  deleteRecurringCashflow,
  syncRecurringCashflowCategories,
  getRecurringCashflowWithCategories,
} from "./recurring-cashflow-mutations";
import {
  InsertRecurringCashFlow,
  RecurringCashFlow,
} from "@/types/finance.types";
import { TablesUpdate } from "@/types/db.types";

/**
 * Hook for Recurring Cashflow operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Recurring Cashflows with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useRecurringCashflowMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Recurring Cashflow with automatic notification.
   */
  const handleAddRecurringCashflow = useCallback(
    async (
      newRecurringCashflow: InsertRecurringCashFlow
    ): Promise<RecurringCashFlow | undefined> => {
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
        const cashflowId = newRecurringCashflow.id || crypto.randomUUID();
        const transaction = addRecurringCashflow(
          { ...newRecurringCashflow, id: cashflowId },
          profile.id
        );
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Sync categories if provided
        if (
          newRecurringCashflow.categories &&
          newRecurringCashflow.categories.length > 0
        ) {
          await syncRecurringCashflowCategories(
            cashflowId,
            newRecurringCashflow.categories.map(
              (category) => category.finance_category.id
            ),
            profile.id
          );
        }

        // Get complete cashflow with categories
        const completeCashflow =
          await getRecurringCashflowWithCategories(cashflowId);

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich erstellt",
            "Recurring cashflow successfully created"
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
   * Updates a Recurring Cashflow with automatic notification.
   */
  const handleUpdateRecurringCashflow = useCallback(
    async (
      id: string | string[],
      item: TablesUpdate<"recurring_cash_flow">,
      categoryIds?: string[]
    ): Promise<RecurringCashFlow | undefined> => {
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
        const transaction = updateRecurringCashflow(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Sync categories if provided
        const cashflowId = typeof id === "string" ? id : id[0];
        if (categoryIds !== undefined) {
          await syncRecurringCashflowCategories(
            cashflowId,
            categoryIds,
            profile.id
          );
        }

        // Get complete cashflow with categories
        const completeCashflow =
          await getRecurringCashflowWithCategories(cashflowId);

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich aktualisiert",
            "Recurring cashflow successfully updated"
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
   * Deletes a Recurring Cashflow with automatic notification.
   */
  const handleDeleteRecurringCashflow = useCallback(
    async (id: string | string[]) => {
      try {
        const transaction = deleteRecurringCashflow(id);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich gelöscht",
            "Recurring cashflow successfully deleted"
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
    addRecurringCashflow: handleAddRecurringCashflow,
    updateRecurringCashflow: handleUpdateRecurringCashflow,
    deleteRecurringCashflow: handleDeleteRecurringCashflow,
    // Helper functions
    syncRecurringCashflowCategories,
    getRecurringCashflowWithCategories,
  };
};
