import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useIntl } from "@/hooks/useIntl";

import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/toastFunctions";
import {
  addPayout,
  updatePayout,
  deletePayout,
} from "@/db/collections/finance/payout/payout-mutations";
import {
  FinanceProject,
  Payout,
  ProjectAdjustment,
} from "@/types/finance.types";
import { Tables, TablesUpdate } from "@/types/db.types";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";
import { Currency } from "@/types/settings.types";
import { addSingleCashflowMutation } from "@/db/collections/finance/single-cashflow/single-cashflow-mutations";
import { updateWorkTimeEntry } from "@/db/collections/work/work-time-entry/work-time-entry-mutations";
import { updateProjectAdjustment } from "@/db/collections/finance/project-adjustment/project-adjustment-mutations";
import { updateFinanceProject } from "@/db/collections/finance/finance-project/finance-project-mutations";

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

  /**
   * Handles the payout of a finance project adjustment.
   * @param projectAdjustment - The project adjustment to payout
   * @param financeProject - The finance project to payout
   * @param showNotification - Whether to show notification messages
   * @returns True if the payout was successful, false if an error occurs
   */
  const handleFinanceProjectAdjustmentPayout = useCallback(
    async (
      projectAdjustment: ProjectAdjustment,
      financeProject: FinanceProject,
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
        const singleCashflowResult = await addSingleCashflowMutation(
          {
            title: projectAdjustment.description ?? "Auszahlung",
            amount: projectAdjustment.amount,
            currency: financeProject.currency,
            tags: financeProject.tags,
            finance_project_id: financeProject.id,
          },
          profile.id
        );

        if (!singleCashflowResult) {
          console.error("Failed to create single cashflow:", projectAdjustment);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen der Auszahlung",
              "Error creating payout"
            )
          );
          return false;
        }

        const adjustmentResult = await updateProjectAdjustment(
          projectAdjustment.id,
          {
            single_cashflow_id: singleCashflowResult[0].id,
          }
        );
        if (!adjustmentResult) {
          console.error(
            "Failed to update project adjustment:",
            projectAdjustment.id,
            {
              single_cashflow_id: singleCashflowResult[0].id,
            }
          );
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen der Projektanpassung",
              "Error creating project adjustment"
            )
          );
          return false;
        }
        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Auszahlung erfolgreich erstellt",
              "Payout successfully created"
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
    [profile?.id, getLocalizedText]
  );

  /**
   * Handles the payout of a finance project.
   * @param financeProject - The finance project to payout
   * @param payoutWholeProject - Whether to payout the whole project
   * @param showNotification - Whether to show notification messages
   * @returns True if the payout was successful, false if an error occurs
   */
  const handleFinanceProjectPayout = useCallback(
    async (
      financeProject: FinanceProject,
      payoutWholeProject: boolean,
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
        const singleCashflowResult = await addSingleCashflowMutation(
          {
            title: financeProject.title,
            amount: financeProject.start_amount,
            currency: financeProject.currency,
            tags: financeProject.tags,
            finance_project_id: financeProject.id,
          },
          profile.id
        );
        if (!singleCashflowResult) {
          console.error("Failed to create single cashflow:", financeProject);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen der Auszahlung",
              "Error creating payout"
            )
          );
          return false;
        }

        const financeProjectResult = await updateFinanceProject(
          financeProject.id,
          {
            single_cashflow_id: singleCashflowResult[0].id,
            tags: financeProject.tags,
            contact: financeProject.contact,
            adjustments: financeProject.adjustments,
          },
          profile.id
        );
        if (!financeProjectResult) {
          console.error(
            "Failed to update finance project:",
            financeProject.id,
            {
              single_cashflow_id: singleCashflowResult[0].id,
            }
          );
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen der Projektanpassung",
              "Error creating project adjustment"
            )
          );
          return false;
        }

        if (payoutWholeProject) {
          financeProject.adjustments
            .filter((adjustment) => !adjustment.single_cashflow_id)
            .forEach(async (adjustment) => {
              await handleFinanceProjectAdjustmentPayout(
                adjustment,
                financeProject,
                showNotification
              );
            });
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Auszahlung erfolgreich erstellt",
              "Payout successfully created"
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
    [profile?.id, getLocalizedText, handleFinanceProjectAdjustmentPayout]
  );

  /**
   * Adds a new Payout with automatic notification and side effects.
   * @param project - The project to add the payout for
   * @param title - The title of the payout
   * @param timeEntries - The time entries to add the payout for
   * @param endCurrency - The currency of the payout
   * @param endValue - The value of the payout
   * @param showNotification - Whether to show notification messages
   * @returns The payout or undefined if an error occurs
   */
  const handleAddHourlyPayout = useCallback(
    async (
      project: WorkProject,
      title: string,
      timeEntries: WorkTimeEntry[],
      endCurrency?: Currency,
      endValue?: number,
      showNotification: boolean = false
    ): Promise<Payout | undefined> => {
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
          work_project_id: project.id,
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
            tags: project.tags,
          },
          profile.id
        );

        if (!singleCashflowResult) {
          console.error(
            "Failed to create single cashflow:",
            singleCashflowResult
          );
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen der Auszahlung",
              "Error creating payout"
            )
          );
          return;
        }

        // Update work time entries
        const workTimeEntryResult = await updateWorkTimeEntry(
          timeEntries.map((timeEntry) => timeEntry.id),
          {
            payout_id: payoutData.id,
            paid: true,
            single_cashflow_id: singleCashflowId,
          }
        );

        if (!workTimeEntryResult) {
          console.error(
            "Failed to update work time entries:",
            timeEntries.map((timeEntry) => timeEntry.id)
          );
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren der Arbeitszeiten",
              "Error updating work time entries"
            )
          );
          return;
        }

        if (result.error) {
          console.error("Failed to add payout:", payoutData);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen der Auszahlung",
              "Error creating payout"
            )
          );
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Auszahlung erfolgreich erstellt",
              "Payout successfully created"
            )
          );
        }
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
   * Updates a Payout with automatic notification and side effects.
   * @param id - The ID of the payout to update
   * @param item - The item to update
   * @param showNotification - Whether to show notification messages
   * @returns The payout or undefined if an error occurs
   */
  const handleUpdatePayout = useCallback(
    async (
      id: string | string[],
      item: TablesUpdate<"payout">,
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
        const transaction = updatePayout(id, item);
        const result = await transaction.isPersisted.promise;

        if (result.error) {
          console.error("Failed to update payout:", id, item);
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren der Auszahlung",
              "Error updating payout"
            )
          );
          return false;
        }

        // Wait a bit for side effects to complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Auszahlung erfolgreich aktualisiert",
              "Payout successfully updated"
            )
          );
        }
        return true;
      } catch (error) {
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
   * Deletes a Payout with automatic notification and side effects.
   * @param id - The ID of the payout to delete
   * @param showNotification - Whether to show notification messages
   * @returns True if the payout was deleted, false if an error occurs
   */
  const handleDeletePayout = useCallback(
    async (
      id: string | string[],
      showNotification: boolean = false
    ): Promise<boolean> => {
      const transaction = deletePayout(id);
      const result = await transaction.isPersisted.promise;

      if (result.error) {
        console.error("Failed to delete payout:", id);
        showActionErrorNotification(
          getLocalizedText(
            "Fehler beim Löschen der Auszahlung",
            "Error deleting payout"
          )
        );
        return false;
      }

      if (showNotification) {
        showActionSuccessNotification(
          getLocalizedText(
            "Auszahlung erfolgreich gelöscht",
            "Payout successfully deleted"
          )
        );
      }
      return true;
    },
    [getLocalizedText]
  );

  return {
    addHourlyPayout: handleAddHourlyPayout,
    updatePayout: handleUpdatePayout,
    deletePayout: handleDeletePayout,
    financeProjectAdjustmentPayout: handleFinanceProjectAdjustmentPayout,
    financeProjectPayout: handleFinanceProjectPayout,
  };
};
