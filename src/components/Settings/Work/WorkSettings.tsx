import { useIntl } from "@/hooks/useIntl";

import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import SelectTimerRounding from "./RoundingSettings";
import WorkDefaultSettings from "./WorkDefaultSettings";
import TimeTrackerSettings from "./TimeTrackerSettings";

export default function WorkSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Stack>
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
