import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "./bank-account-mutations";
import {
  InsertBankAccount,
  UpdateBankAccount,
  BankAccount,
} from "@/types/finance.types";

/**
 * Hook for Bank Account operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Bank Accounts with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useBankAccountMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Bank Account with automatic notification.
   */
  const handleAddBankAccount = useCallback(
    async (
      newBankAccount: InsertBankAccount
    ): Promise<BankAccount | undefined> => {
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
        const result = await addBankAccount(newBankAccount, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Bankkontos",
              "Error creating bank account"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Bankkonto erfolgreich erstellt",
            "Bank account successfully created"
          )
        );

        return result;
      } catch (error) {
        console.error(error);
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
   * Updates a Bank Account with automatic notification.
   */
  const handleUpdateBankAccount = useCallback(
    async (id: string, item: UpdateBankAccount) => {
      try {
        const result = await updateBankAccount(id, item);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Bankkontos",
              "Error updating bank account"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Bankkonto erfolgreich aktualisiert",
            "Bank account successfully updated"
          )
        );

        return true;
      } catch (error) {
        console.error(error);
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

  /**
   * Deletes a Bank Account with automatic notification.
   */
  const handleDeleteBankAccount = useCallback(
    async (id: string | string[]) => {
      try {
        const result = await deleteBankAccount(id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Bankkontos",
              "Error deleting bank account"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Bankkonto erfolgreich gelöscht",
            "Bank account successfully deleted"
          )
        );

        return result;
      } catch (error) {
        console.error(error);
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
    addBankAccount: handleAddBankAccount,
    updateBankAccount: handleUpdateBankAccount,
    deleteBankAccount: handleDeleteBankAccount,
  };
};
