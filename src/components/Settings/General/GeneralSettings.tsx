import { useIntl } from "@/hooks/useIntl";

import { Stack } from "@mantine/core";
import SchemeButtonGroup from "./SchemeSettings";
import SettingsRow from "../SettingsRow";
import LocaleSettings from "./LocaleSettings";

export default function DefaultSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Stack w="100%" p="md">
      <SettingsRow
        title={getLocalizedText("Farbschema", "Color Scheme")}
        children={<SchemeButtonGroup />}
      />
      <SettingsRow
        title={getLocalizedText("Sprache & Format", "Language & Format")}
        children={<LocaleSettings />}
      />
    </Stack>
  );
}
