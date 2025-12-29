import { db } from "@/db/powersync/db";
import { useCalendarStore } from "@/stores/calendarStore";
import { useProfileStore } from "@/stores/profileStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useGroupStore } from "@/stores/groupStore";

/**
 * Cleans up all stores and database on logout
 * This ensures that no user data persists after logout
 */
export async function cleanupOnLogout() {
  const errors: Error[] = [];

  // Reset all stores that have a resetStore method
  try {
    useCalendarStore.getState().resetStore();
    useTimeTrackerManager.getState().resetStore();
    useWorkStore.getState().resetStore();
    useGroupStore.getState().resetStore();
    useProfileStore.getState().resetStore();
    useSettingsStore.getState().resetStore();
  } catch (error) {
    console.error("Error resetting stores:", error);
    errors.push(error as Error);
  }

  // Disconnect and clear PowerSync database (clears all synced data and local-only tables)
  try {
    await db.disconnectAndClear({ clearLocal: true });
  } catch (error) {
    console.warn("Error disconnecting PowerSync (may be expected):", error);
    // Don't add to errors array as this is often expected
  }

  // Clear all localStorage items related to stores
  try {
    const storeKeys = [
      "calendar-store",
      "profile",
      "settings",
      "time-tracker-manager-storage",
      "work-store",
    ];

    storeKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn(`Failed to remove localStorage key: ${key}`, err);
      }
    });
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    errors.push(error as Error);
  }

  // Clear IndexedDB databases (PowerSync uses IndexedDB for storage)
  try {
    if (typeof indexedDB !== "undefined" && indexedDB.databases) {
      const databases = await indexedDB.databases();
      for (const database of databases) {
        if (database.name) {
          try {
            indexedDB.deleteDatabase(database.name);
          } catch (err) {
            console.warn(`Failed to delete database: ${database.name}`, err);
          }
        }
      }
    }
  } catch (error) {
    console.warn("Error clearing IndexedDB:", error);
    // Don't add to errors array as this is not critical
  }

  if (errors.length === 0) {
    console.log("✅ Successfully cleaned up all data on logout");
  } else {
    console.warn(
      `⚠️ Cleanup completed with ${errors.length} non-critical error(s)`
    );
  }
}
