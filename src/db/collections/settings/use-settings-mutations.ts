import { useCallback } from "react";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/notificationFunctions";
import { useIntl } from "@/hooks/useIntl";
import { updateSettings } from "./settings-mutations";
import { SettingsUpdate } from "@/types/settings.types";

/**
 * Hook for Settings operations with automatic notifications.
 *
 * This hook provides a user-friendly API for update operations
 * on Settings with integrated error handling and notifications.
 *
 * @returns Object with mutation functions
 */
export const useSettingsMutations = () => {
  const { getLocalizedText } = useIntl();

  /**
   * Updates Settings with automatic notification.
   */
  const handleUpdateSettings = useCallback(
    async (
      id: string,
      item: SettingsUpdate,
      showNotification: boolean = false
    ) => {
      try {
        const result = await updateSettings(id, item);

        if (!result) {
          console.error("Failed to update settings:", id, item);
          if (showNotification) {
            showActionErrorNotification(
              getLocalizedText(
                "Fehler beim Aktualisieren der Einstellungen",
                "Error updating settings"
              )
            );
          }
          return;
        }

        if (showNotification) {
          showActionSuccessNotification(
            getLocalizedText(
              "Einstellungen erfolgreich aktualisiert",
              "Settings successfully updated"
            )
          );
        }

        return true;
      } catch (error) {
        console.error(error);
        if (showNotification) {
          showActionErrorNotification(
            getLocalizedText(
              `Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          );
        }
      }
    },
    [getLocalizedText]
  );

  return {
    updateSettings: handleUpdateSettings,
  };
};
