import { useCallback } from "react";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import { updateProfile } from "./profile-mutations";
import { ProfileUpdate } from "@/types/profile.types";

/**
 * Hook for Profile operations with automatic notifications.
 *
 * This hook provides a user-friendly API for update operations
 * on Profiles with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useProfileMutations = () => {
  const { getLocalizedText } = useIntl();

  /**
   * Updates a Profile with automatic notification.
   */
  const handleUpdateProfile = useCallback(
    async (id: string, item: ProfileUpdate) => {
      try {
        const result = await updateProfile(id, item);

        if (!result) {
          showActionErrorNotification(
            getLocalizedText(
              "Fehler beim Aktualisieren des Profils",
              "Error updating profile"
            )
          );
          return;
        }

        showActionSuccessNotification(
          getLocalizedText(
            "Profil erfolgreich aktualisiert",
            "Profile successfully updated"
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

  return {
    updateProfile: handleUpdateProfile,
  };
};
