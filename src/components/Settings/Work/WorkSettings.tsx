import { useIntl } from "@/hooks/useIntl";

import { Stack } from "@mantine/core";
import SettingsRow from "@/components/Settings/SettingsRow";
import SelectTimerRounding from "@/components/Settings/Work/RoundingSettings";
import WorkDefaultSettings from "@/components/Settings/Work/WorkDefaultSettings";
import TimeTrackerSettings from "@/components/Settings/Work/TimeTrackerSettings";
import WorkColorSettings from "@/components/Settings/Work/WorkColorSettings";

export default function WorkSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Stack>
      <SettingsRow
        title={getLocalizedText("Modulfarbe", "Module Color")}
        children={<WorkColorSettings />}
      />
      <SettingsRow
        title={getLocalizedText("Zeiterfassung", "Time Tracker")}
        children={<TimeTrackerSettings />}
      />
      <SettingsRow
        title={getLocalizedText(
          "Rundung der Zeiterfassung",
          "Time Tracker Rounding"
        )}
        children={<SelectTimerRounding />}
      />
      <SettingsRow
        title={getLocalizedText(
          "Arbeitsmanager Einstellungen",
          "Work Manager Settings"
        )}
        children={<WorkDefaultSettings />}
      />
    </Stack>
  );
}
