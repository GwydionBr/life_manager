import { useIntl } from "@/hooks/useIntl";
import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import CalendarTimeSettings from "./CalendarTimeSettings";

export default function CalendarSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Stack>
      <SettingsRow
        title={getLocalizedText("Kalenderzeit", "Calendar Time")}
        children={<CalendarTimeSettings />}
      />
    </Stack>
  );
}
