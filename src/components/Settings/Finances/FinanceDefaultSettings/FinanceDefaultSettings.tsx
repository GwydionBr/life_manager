import { useEffect, useState } from "react";
import {
  useSettings,
  settingsCollection,
} from "@/db/collections/settings/settings-collection";
import { useIntl } from "@/hooks/useIntl";

import { Radio, Select, Stack } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import SettingsRow from "@/components/Settings/SettingsRow";
import FinanceColorSettings from "@/components/Settings/Finances/FinanceColorSettings";

export default function FinanceDefaultSettings() {
  const { getLocalizedText } = useIntl();
  const { data: settings } = useSettings();

  const [showCCW, setShowCCW] = useState<"true" | "false" | "null">("null");

  useEffect(() => {
    setShowCCW(
      settings?.show_change_curreny_window === null
        ? "null"
        : settings?.show_change_curreny_window
          ? "true"
          : "false"
    );
  }, [settings?.show_change_curreny_window]);

  const handleCCWChange = (value: string) => {
    setShowCCW(value as "true" | "false" | "null");
    settingsCollection.update(settings?.id || "", (draft) => {
      draft.show_change_curreny_window =
        value === "null" ? null : value === "true";
    });
  };

  if (!settings) return null;

  return (
    <Stack w="100%">
      <SettingsRow title={getLocalizedText("Modulfarbe", "Module Color")}>
        <FinanceColorSettings />
      </SettingsRow>
      <SettingsRow
        title={getLocalizedText(
          "Standard Finanzwährung",
          "Default Finance Currency"
        )}
      >
        <Select
          data={currencies}
          label={getLocalizedText("Finanzwährung", "Currency")}
          placeholder={getLocalizedText(
            "Standard Finanzwährung auswählen",
            "Select Finance Currency"
          )}
          value={settings?.default_finance_currency || "USD"}
          onChange={(value) =>
            settingsCollection.update(settings.id, (draft) => {
              draft.default_finance_currency = value as Currency;
            })
          }
        />
      </SettingsRow>
      <SettingsRow title={getLocalizedText("Auszahlung", "Payout")}>
        <Radio.Group
          label={getLocalizedText(
            "Währungswechsel Fenster anzeigen",
            "Show currency change window"
          )}
          value={showCCW}
          onChange={(value) => handleCCWChange(value)}
        >
          <Stack mt="sm">
            <Radio
              value="null"
              label={getLocalizedText("Immer anzeigen", "Always show")}
            />
            <Radio
              value="true"
              label={getLocalizedText(
                "Nur wenn es einen Unterschied zu der Standardwährung gibt",
                "Only if there is a difference to the default currency"
              )}
            />
            <Radio
              value="false"
              label={getLocalizedText("Nicht anzeigen", "Do not show")}
            />
          </Stack>
        </Radio.Group>
      </SettingsRow>
    </Stack>
  );
}
