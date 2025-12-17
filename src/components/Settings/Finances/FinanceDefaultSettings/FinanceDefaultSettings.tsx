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

  if (!settings) return null;

  const { default_finance_currency, show_change_curreny_window } = settings;

  const [showCCW, setShowCCW] = useState<"true" | "false" | "null">("null");

  useEffect(() => {
    setShowCCW(
      show_change_curreny_window === null
        ? "null"
        : show_change_curreny_window
          ? "true"
          : "false"
    );
  }, [show_change_curreny_window]);

  const handleCCWChange = (value: string) => {
    setShowCCW(value as "true" | "false" | "null");
    settingsCollection.update(settings.id, (draft) => {
      draft.show_change_curreny_window =
        value === "null" ? null : value === "true";
    });
  };

  return (
    <Stack w="100%">
      <SettingsRow
        title={getLocalizedText("Modulfarbe", "Module Color")}
        children={<FinanceColorSettings />}
      />
      <SettingsRow
        title={getLocalizedText(
          "Standard Finanzwährung",
          "Default Finance Currency"
        )}
        children={
          <Select
            data={currencies}
            label={getLocalizedText("Finanzwährung", "Currency")}
            placeholder={getLocalizedText(
              "Standard Finanzwährung auswählen",
              "Select Finance Currency"
            )}
            value={default_finance_currency}
            onChange={(value) =>
              settingsCollection.update(settings.id, (draft) => {
                draft.default_finance_currency = value as Currency;
              })
            }
          />
        }
      />
      <SettingsRow
        title={getLocalizedText("Auszahlung", "Payout")}
        children={
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
        }
      />
    </Stack>
  );
}
