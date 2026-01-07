import { useMemo } from "react";
import { useIntl } from "@/hooks/useIntl";
import { settingsCollection } from "@/db/collections/settings/settings-collection";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Select, Text } from "@mantine/core";

import { Locale } from "@/types/settings.types";
import ReactCountryFlag from "react-country-flag";
import { locales } from "@/constants/settings";

export default function LocaleSettings() {
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();
  const { setSettingState } = useSettingsStore();

  const currentLocale = useMemo(
    () => locales.find((l) => l.value === settings?.locale),
    [settings?.locale]
  );

  if (!settings) return null;

  return (
    <Group>
      <Select
        data={locales}
        label={getLocalizedText("Sprache & Format", "Language & Format")}
        placeholder={getLocalizedText(
          "Sprache & Format auswählen",
          "Select Language & Format"
        )}
        value={settings.locale}
        allowDeselect={false}
        onChange={(value) => {
          settingsCollection.update(settings.id, (draft) => {
            draft.locale = value as Locale;
          });
          setSettingState({ locale: value as Locale });
        }}
        leftSection={
          currentLocale && (
            <ReactCountryFlag
              countryCode={currentLocale.flag}
              svg
              style={{
                width: "1.2em",
                height: "1.2em",
              }}
            />
          )
        }
        renderOption={({ option, ...others }) => {
          const localeData = locales.find((l) => l.value === option.value);
          return (
            <div {...others}>
              <Group gap="xs">
                <ReactCountryFlag
                  countryCode={localeData?.flag || "US"}
                  svg
                  style={{ width: "1.2em", height: "1.2em" }}
                />
                <Text>{option.label}</Text>
              </Group>
            </div>
          );
        }}
      />
      <Select
        data={[
          { value: "24h", label: "24h" },
          { value: "12h", label: "12h" },
        ]}
        label={getLocalizedText("Zeitformat", "Time Format")}
        placeholder={getLocalizedText(
          "Zeitformat auswählen",
          "Select Time Format"
        )}
        value={settings.format_24h ? "24h" : "12h"}
        onChange={(value) => {
          settingsCollection.update(settings.id, (draft) => {
            draft.format_24h = value === "24h";
          });
          setSettingState({ format_24h: value === "24h" });
        }}
      />
    </Group>
  );
}
