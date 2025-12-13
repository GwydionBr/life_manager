import { useIntl } from "@/hooks/useIntl";
import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import CalendarTimeSettings from "./CalendarTimeSettings";
import CalendarColorSettings from "./CalendarColorSettings";

export default function CalendarSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Stack>
      <SettingsRow
        title={getLocalizedText("Modulfarbe", "Module Color")}
        children={<CalendarColorSettings />}
      />
      <SettingsRow
        title={getLocalizedText("Kalenderzeit", "Calendar Time")}
        children={<CalendarTimeSettings />}
      />
    </Stack>
  );
}
