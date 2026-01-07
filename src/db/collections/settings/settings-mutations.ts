import { settingsCollection } from "@/db/collections/settings/settings-collection";
import { SettingsUpdate } from "@/types/settings.types";

/**
 * Updates Settings.
 *
 * @param id - The ID of the settings to update
 * @param item - The item to update
 * @returns Returns true if the settings were updated, false otherwise
 */
export const updateSettings = async (id: string, item: SettingsUpdate) => {
  try {
    const transaction = settingsCollection.update(id, (draft) => {
      Object.assign(draft, item);
    });
    await transaction.isPersisted.promise;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
