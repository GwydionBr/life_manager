import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import { useIntl } from "@/hooks/useIntl";

import {
  addSingleCashflowMutation,
  updateSingleCashflowMutation,
  deleteSingleCashflowMutation,
} from "./single-cashflow-mutations";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";

import {
  InsertSingleCashFlow,
  SingleCashFlow,
  UpdateSingleCashFlow,
} from "@/types/finance.types";

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
      newSingleCashflow: InsertSingleCashFlow | InsertSingleCashFlow[]
    ): Promise<SingleCashFlow[] | undefined> => {
      // Check if user is logged in
      if (!profile?.id) {
        showActionErrorNotification(
          getLocalizedText(
            "Kein Benutzerprofil gefunden",
            "No user profile found"
          )
        );
        return undefined;
      }

      try {
        // Add single cashflows to database
        const result = await addSingleCashflowMutation(
          newSingleCashflow,
          profile.id
        );

        // Check if transaction failed
        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Einzel-Cashflows",
              "Error creating single cashflow"
            )
          );
          return undefined;
        }

        // Show success notification
        if (Array.isArray(newSingleCashflow)) {
          // Show success notification for multiple cashflows
          showActionSuccessNotification(
            getLocalizedText(
              ` ${result.length} Einzelne Cashflows erfolgreich erstellt`,
              ` ${result.length} Single cashflows successfully created`
            )
          );
        } else {
          // Show success notification for single cashflow
          showActionSuccessNotification(
            getLocalizedText(
              "Einzelner Cashflow erfolgreich erstellt",
              "Single cashflow successfully created"
            )
          );
        }
        return result;
      } catch (error) {
        console.error("Error adding single cashflow try/catch", error);
        // Show total error notification
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
      item: UpdateSingleCashFlow
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
        const result = await updateSingleCashflowMutation(id, item, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Einzel-Cashflows",
              "Error updating single cashflow"
            )
          );
          return false;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Einzelner Cashflow erfolgreich aktualisiert",
            "Single cashflow successfully updated"
          )
        );
        return result;
      } catch (error) {
        console.error("Error updating single cashflow try/catch", error);
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

  const handleDeleteSingleCashflow = useCallback(
    async (id: string | string[]): Promise<boolean> => {
      try {
        const result = await deleteSingleCashflowMutation(id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Einzel-Cashflows",
              "Error deleting single cashflow"
            )
          );
          return false;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Einzelner Cashflow erfolgreich gelöscht",
            "Single cashflow successfully deleted"
          )
        );

        return true;
      } catch (error) {
        console.error("Error deleting single cashflow try/catch", error);
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
    addSingleCashflow: handleAddSingleCashflow,
    updateSingleCashflow: handleUpdateSingleCashflow,
    deleteSingleCashflow: handleDeleteSingleCashflow,
  };
};
