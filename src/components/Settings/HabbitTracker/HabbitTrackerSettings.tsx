import { useIntl } from "@/hooks/useIntl";
import { Stack } from "@mantine/core";
import SettingsRow from "@/components/Settings/SettingsRow";
import HabitColorSettings from "@/components/Settings/HabbitTracker/HabitColorSettings";

export default function HabbitTrackerSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Stack>
      <SettingsRow
        title={getLocalizedText("Modulfarbe", "Module Color")}
        children={<HabitColorSettings />}
      />
    </Stack>
  );
}
