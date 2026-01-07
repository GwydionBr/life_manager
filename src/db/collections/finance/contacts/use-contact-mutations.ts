import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/profile-collection";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import { addContact, updateContact, deleteContact } from "./contact-mutations";
import { InsertContact, UpdateContact, Contact } from "@/types/finance.types";

/**
 * Hook for Contact operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Contacts with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useContactMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Contact with automatic notification.
   */
  const handleAddContact = useCallback(
    async (newContact: InsertContact): Promise<Contact | undefined> => {
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
        const result = await addContact(newContact, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Kontakts",
              "Error creating contact"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Kontakt erfolgreich erstellt",
            "Contact successfully created"
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
   * Updates a Contact with automatic notification.
   */
  const handleUpdateContact = useCallback(
    async (id: string, item: UpdateContact) => {
      try {
        const result = await updateContact(id, item);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Kontakts",
              "Error updating contact"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Kontakt erfolgreich aktualisiert",
            "Contact successfully updated"
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
   * Deletes a Contact with automatic notification.
   */
  const handleDeleteContact = useCallback(
    async (id: string | string[]) => {
      try {
        const result = await deleteContact(id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Kontakts",
              "Error deleting contact"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Kontakt erfolgreich gelöscht",
            "Contact successfully deleted"
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
    addContact: handleAddContact,
    updateContact: handleUpdateContact,
    deleteContact: handleDeleteContact,
  };
};
