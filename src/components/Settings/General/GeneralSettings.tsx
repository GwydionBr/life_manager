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
      <SettingsRow
        title={getLocalizedText("Farbschema", "Color Scheme")}
        children={<SchemeButtonGroup />}
      />
      <SettingsRow
        title={getLocalizedText("Primärfarbe", "Primary Color")}
        children={<PrimaryColorSettings />}
      />
      <SettingsRow
        title={getLocalizedText("Sprache & Format", "Language & Format")}
        children={<LocaleSettings />}
      />
    </Stack>
  );
}
