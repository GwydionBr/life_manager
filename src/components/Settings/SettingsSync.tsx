import { useEffect } from "react";
import { useSettings } from "@/db/collections/settings/settings-collection";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProfile } from "@/db/collections/profile/profile-collection";
import { useProfileStore } from "@/stores/profileStore";

/**
 * Component that syncs settings from React Query to Zustand store.
 * Should be mounted once in your app layout (e.g., in the dashboard layout).
 */
export function SettingsSync() {
  const { data: settings } = useSettings();
  const { data: profile } = useProfile();
  const { setSettingState } = useSettingsStore();
  const { setProfileState } = useProfileStore();

  useEffect(() => {
    if (settings) {
      setSettingState(settings);
    }
  }, [settings, setSettingState]);

  useEffect(() => {
    if (profile) {
      setProfileState(profile);
    }
  }, [profile, setProfileState]);

  return null;
}
