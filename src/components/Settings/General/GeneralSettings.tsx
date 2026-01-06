import { useIntl } from "@/hooks/useIntl";

import { Stack } from "@mantine/core";
import SchemeButtonGroup from "@/components/Settings/General/SchemeSettings";
import SettingsRow from "@/components/Settings/SettingsRow";
import LocaleSettings from "@/components/Settings/General/LocaleSettings";
import PrimaryColorSettings from "@/components/Settings/General/PrimaryColorSettings";

export default function DefaultSettings() {
  const { getLocalizedText } = useIntl();
  return (
    <Stack w="100%" p="md">
      <SettingsRow title={getLocalizedText("Farbschema", "Color Scheme")}>
        <SchemeButtonGroup />
      </SettingsRow>
      <SettingsRow title={getLocalizedText("Primärfarbe", "Primary Color")}>
        <PrimaryColorSettings />
      </SettingsRow>
      <SettingsRow
        title={getLocalizedText("Sprache & Format", "Language & Format")}
      >
        <LocaleSettings />
      </SettingsRow>
    </Stack>
  );
}
