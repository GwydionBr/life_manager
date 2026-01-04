import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import { addPayout, updatePayout, deletePayout } from "./payout-mutations";
import {
  FinanceProject,
  Payout,
  ProjectAdjustment,
} from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";
import { Currency } from "@/types/settings.types";
import { addSingleCashflowMutation } from "../single-cashflow/single-cashflow-mutations";
import { updateWorkTimeEntry } from "../../work/work-time-entry/work-time-entry-mutations";
import { updateProjectAdjustment } from "../project-adjustment/project-adjustment-mutations";

/**
 * Hook for Payout operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Payouts with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const usePayoutMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  const handleFinanceProjectAdjustmentPayout = useCallback(
    async (
      projectAdjustment: ProjectAdjustment,
      financeProject: FinanceProject
    ) => {
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
        const { promise, data } = await addSingleCashflowMutation(
          {
            title: projectAdjustment.description ?? "Auszahlung",
            amount: projectAdjustment.amount,
            currency: financeProject.currency,
            categories: financeProject.categories,
          },
          profile.id
        );

        const adjustmentResult = await updateProjectAdjustment(
          projectAdjustment.id,
          {
            single_cash_flow_id: data[0].id,
          }
        );
        if (promise.error) {
          showActionErrorNotification(promise.error.message);
          return;
        }
        if (adjustmentResult.error) {
          showActionErrorNotification(adjustmentResult.error.message);
          return;
        }
        showActionSuccessNotification(
          getLocalizedText(
            "Auszahlung erfolgreich erstellt",
            "Payout successfully created"
          )
        );
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
   * Adds a new Payout with automatic notification and side effects.
   */
  const handleAddHourlyPayout = useCallback(
    async (
      project: WorkProject,
      title: string,
      timeEntries: WorkTimeEntry[],
      endCurrency?: Currency,
      endValue?: number
    ): Promise<Payout | undefined> => {
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
        const totalAmount = timeEntries
          .reduce(
            (acc, timeEntry) =>
              acc + timeEntry.salary * (timeEntry.active_seconds / 3600),
            0
          )
          .toFixed(2);

        // Create payout data
        const payoutData: Tables<"payout"> = {
          id: crypto.randomUUID(),
          title,
          user_id: profile.id,
          created_at: new Date().toISOString(),
          timer_project_id: project.id,
          currency: endCurrency ? endCurrency : project.currency,
          value: endValue ? endValue : parseFloat(totalAmount),
          start_currency: endCurrency ? project.currency : null,
          start_value: endValue ? parseFloat(totalAmount) : null,
        };
        const transaction = addPayout(payoutData);
        const result = await transaction.isPersisted.promise;

        const singleCashflowId = crypto.randomUUID();
        // Create single cashflow data
        const singleCashflowResult = await addSingleCashflowMutation(
          {
            id: singleCashflowId,
            title,
            amount: endValue ? endValue : parseFloat(totalAmount),
            currency: endCurrency ? endCurrency : project.currency,
            payout_id: payoutData.id,
            categories: project.categories,
          },
          profile.id
        );

        // Update work time entries
        const workTimeEntryResult = await updateWorkTimeEntry(
          timeEntries.map((timeEntry) => timeEntry.id),
          {
            payout_id: payoutData.id,
            paid: true,
            single_cash_flow_id: singleCashflowId,
          }
        );

        console.log(singleCashflowResult);
        console.log(workTimeEntryResult);

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Auszahlung erfolgreich erstellt",
            "Payout successfully created"
          )
        );
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
   * Updates a Payout with automatic notification and side effects.
   */
  const handleUpdatePayout = useCallback(
    async (
      id: string | string[],
      item: TablesUpdate<"payout">
    ): Promise<Payout | undefined> => {
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
        const transaction = updatePayout(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          showActionErrorNotification(result.error.message);
          return;
        }

        // Wait a bit for side effects to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        showActionSuccessNotification(
          getLocalizedText(
            "Auszahlung erfolgreich aktualisiert",
            "Payout successfully updated"
          )
        );
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
   * Deletes a Payout with automatic notification and side effects.
   */
  const handleDeletePayout = useCallback(
    async (id: string | string[]) => {
      const transaction = deletePayout(id);
      const result = await transaction.isPersisted.promise;

      if (result.error) {
        showActionErrorNotification(result.error.message);
        return;
      }
    },
    [getLocalizedText]
  );

  return {
    addHourlyPayout: handleAddHourlyPayout,
    updatePayout: handleUpdatePayout,
    deletePayout: handleDeletePayout,
    financeProjectAdjustmentPayout: handleFinanceProjectAdjustmentPayout,
  };
};
