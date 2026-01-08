import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
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
        const result = await addRecurringCashflowMutation(
          { ...newRecurringCashflow },
          profile.id
        );

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des wiederkehrenden Cashflows",
              "Error creating recurring cashflow"
            )
          );
          return;
        }

        const singleCashflowsToInsert = processRecurringCashFlows([result], []);

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
    ): Promise<boolean> => {
      if (!profile?.id) {
        showActionErrorNotification(
          getLocalizedText(
            "Kein Benutzerprofil gefunden",
            "No user profile found"
          )
        );
        return false;
      }

      try {
        const result = await updateRecurringCashflowMutation(
          id,
          item,
          profile.id
        );

        if (shouldUpdateSingleCashFlows) {
          const singleCashflowsToUpdate = singleCashflows.filter(
            (cashflow) => cashflow.recurring_cashflow_id === id
          );

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

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des wiederkehrenden Cashflows",
              "Error updating recurring cashflow"
            )
          );
          return false;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Wiederkehrender Cashflow erfolgreich aktualisiert",
            "Recurring cashflow successfully updated"
          )
        );

        return true;
      } catch (error) {
        console.error("Error updating recurring cashflow try/catch", error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        return false;
      }
    },
    [profile?.id, getLocalizedText, singleCashflows]
  );

  /**
   * Deletes a Recurring Cashflow with automatic notification.
   */
  const handleDeleteRecurringCashflow = useCallback(
    async (
      id: string | string[],
      mode: DeleteRecurringCashFlowMode
    ): Promise<boolean> => {
      try {
        const ids = Array.isArray(id) ? id : [id];
        if (mode === DeleteRecurringCashFlowMode.keep_unlinked) {
          const result = await deleteRecurringCashflowMutation(ids);
          if (!result) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Löschen des wiederkehrenden Cashflows",
                "Error deleting recurring cashflow"
              )
            );
            return false;
          }
          showActionSuccessNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow erfolgreich gelöscht (Verknüpfung entfernt)",
              "Recurring cashflow successfully deleted (unlinked)"
            )
          );
          return true;
        } else if (mode === DeleteRecurringCashFlowMode.delete_all) {
          const singleCashflowsToDelete = singleCashflows.filter((cashflow) =>
            ids.includes(cashflow.recurring_cashflow_id ?? "")
          );
          const result = await deleteRecurringCashflowMutation(ids);
          if (!result) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Löschen des wiederkehrenden Cashflows",
                "Error deleting recurring cashflow"
              )
            );
            return false;
          }
          const singleCashflowResult = await deleteSingleCashflowMutation(
            singleCashflowsToDelete.map((cashflow) => cashflow.id)
          );
          if (!singleCashflowResult) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Löschen der verknüpften Einmal-Cashflows",
                "Error deleting linked single cashflows"
              )
            );
            return false;
          }
          showActionSuccessNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow und alle verknüpften Einmal-Cashflows erfolgreich gelöscht",
              "Recurring cashflow and all linked single cashflows successfully deleted"
            )
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting recurring cashflow try/catch", error);
        showActionErrorNotification(
          getLocalizedText(
            `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
        return false;
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
