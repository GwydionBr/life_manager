import { useEffect } from "react";
import { useSettings } from "@/queries/settings/use-settings";
import { useSettingsStore } from "@/stores/settingsStore";

/**
 * Component that syncs settings from React Query to Zustand store.
 * Should be mounted once in your app layout (e.g., in the dashboard layout).
 */
export function SettingsSync() {
  const { data: settings } = useSettings();
  const { setSettingState } = useSettingsStore();

  useEffect(() => {
    if (settings) {
      setSettingState(settings);
    }
  }, [settings, setSettingState]);

  return null;
}
