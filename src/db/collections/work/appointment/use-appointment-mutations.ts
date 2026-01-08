import { useCallback } from "react";
import { useProfile } from "@/db/collections/profile/use-profile-query";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import {
  addAppointment,
  updateAppointment,
  deleteAppointment,
} from "./appointment-mutations";
import {
  InsertAppointment,
  UpdateAppointment,
  Appointment,
} from "@/types/work.types";

/**
 * Hook for Appointment operations with automatic notifications.
 *
 * This hook provides a user-friendly API for CRUD operations
 * on Appointments with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useAppointmentMutations = () => {
  const { data: profile } = useProfile();
  const { getLocalizedText } = useIntl();

  /**
   * Adds a new Appointment with automatic notification.
   */
  const handleAddAppointment = useCallback(
    async (
      newAppointment: InsertAppointment
    ): Promise<Appointment | undefined> => {
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
        const result = await addAppointment(newAppointment, profile.id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Erstellen des Termins",
              "Error creating appointment"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Termin erfolgreich erstellt",
            "Appointment successfully created"
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
   * Updates an Appointment with automatic notification.
   */
  const handleUpdateAppointment = useCallback(
    async (id: string, item: UpdateAppointment): Promise<boolean> => {
      try {
        const result = await updateAppointment(id, item);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Termins",
              "Error updating appointment"
            )
          );
          return false;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Termin erfolgreich aktualisiert",
            "Appointment successfully updated"
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
        return false;
      }
    },
    [getLocalizedText]
  );

  /**
   * Deletes an Appointment with automatic notification.
   */
  const handleDeleteAppointment = useCallback(
    async (id: string | string[]): Promise<boolean> => {
      try {
        const result = await deleteAppointment(id);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Löschen des Termins",
              "Error deleting appointment"
            )
          );
          return false;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Termin erfolgreich gelöscht",
            "Appointment successfully deleted"
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
        return false;
      }
    },
    [getLocalizedText]
  );

  return {
    addAppointment: handleAddAppointment,
    updateAppointment: handleUpdateAppointment,
    deleteAppointment: handleDeleteAppointment,
  };
};
