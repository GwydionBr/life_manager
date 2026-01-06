import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addRecurringCashflowMutation,
  updateRecurringCashflowMutation,
  deleteRecurringCashflowMutation,
} from "./recurring-cashflow-mutations";
import {
  InsertRecurringCashFlow,
  RecurringCashFlow,
  DeleteRecurringCashFlowMode,
  UpdateRecurringCashFlow,
} from "@/types/finance.types";
import { processRecurringCashFlows } from "@/lib/helper/processRecurringCashflows";
import {
  addSingleCashflowMutation,
  deleteSingleCashflowMutation,
  updateSingleCashflowMutation,
} from "../single-cashflow/single-cashflow-mutations";
import { useSingleCashflowsQuery } from "../single-cashflow/use-single-cashflow-query";

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
  const { data: singleCashflows } = useSingleCashflowsQuery();
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
        const { promise, data } = await addRecurringCashflowMutation(
          { ...newRecurringCashflow },
          profile.id
        );

        if (promise.error) {
          console.error("Error adding recurring cashflow", promise.error);
          showActionErrorNotification(promise.error.message);
          return;
        }

        const singleCashflowsToInsert = processRecurringCashFlows([data], []);

        await addSingleCashflowMutation(singleCashflowsToInsert, profile.id);

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich erstellt",
            "Recurring cashflow successfully created"
          )
        );
      } catch (error) {
        console.error("Error adding recurring cashflow try/catch", error);
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
      id: string,
      item: UpdateRecurringCashFlow,
      shouldUpdateSingleCashFlows: boolean = false
    ): Promise<void> => {
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
        const promise = await updateRecurringCashflowMutation(
          id,
          item,
          profile.id
        );

        if (shouldUpdateSingleCashFlows) {
          const singleCashflowsToUpdate = singleCashflows.filter(
            (cashflow) => cashflow.recurring_cashflow_id === id
          );
          console.log("singleCashflowsToUpdate", singleCashflowsToUpdate);
          await updateSingleCashflowMutation(
            singleCashflowsToUpdate.map((cashflow) => cashflow.id),
            {
              title: item.title,
              amount: item.amount,
              currency: item.currency,
              tags: item.tags,
            },
            profile.id
          );
        }

        if (promise.error) {
          showActionErrorNotification(promise.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich aktualisiert",
            "Recurring cashflow successfully updated"
          )
        );

        // return completeCashflow;
      } catch (error) {
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [profile?.id, getLocalizedText, singleCashflows]
  );

  /**
   * Deletes a Recurring Cashflow with automatic notification.
   */
  const handleDeleteRecurringCashflow = useCallback(
    async (id: string | string[], mode: DeleteRecurringCashFlowMode) => {
      try {
        const ids = Array.isArray(id) ? id : [id];
        if (mode === DeleteRecurringCashFlowMode.keep_unlinked) {
          const transaction = deleteRecurringCashflowMutation(ids);
          await transaction.isPersisted.promise;
          showActionSuccessNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow erfolgreich gelöscht (Verknüpfung entfernt)",
              "Recurring cashflow successfully deleted (unlinked)"
            )
          );
        } else if (mode === DeleteRecurringCashFlowMode.delete_all) {
          const singleCashflowsToDelete = singleCashflows.filter((cashflow) =>
            ids.includes(cashflow.recurring_cashflow_id ?? "")
          );
          const transaction = deleteRecurringCashflowMutation(ids);
          await transaction.isPersisted.promise;
          deleteSingleCashflowMutation(
            singleCashflowsToDelete.map((cashflow) => cashflow.id)
          );
          showActionSuccessNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow und alle verknüpften Einmal-Cashflows erfolgreich gelöscht",
              "Recurring cashflow and all linked single cashflows successfully deleted"
            )
          );
        }
      } catch (error) {
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    },
    [getLocalizedText, singleCashflows]
  );

  return {
    addRecurringCashflow: handleAddRecurringCashflow,
    updateRecurringCashflow: handleUpdateRecurringCashflow,
    deleteRecurringCashflow: handleDeleteRecurringCashflow,
  };
};
