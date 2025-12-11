import { useEffect } from "react";
import { useSettings } from "@/queries/settings/use-settings";
import { useUserPreferences } from "@/stores/userPreferencesStore";

/**
 * Component that syncs settings from React Query to Zustand store.
 * Should be mounted once in your app layout (e.g., in the dashboard layout).
 */
export function SettingsSync() {
  const { data: settings } = useSettings();
  const setPreferences = useUserPreferences((state) => state.setPreferences);

  useEffect(() => {
    if (settings) {
      setPreferences(settings);
    }
  }, [settings, setPreferences]);

  return null;
}
