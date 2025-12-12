"use client";

import { useState, useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useSettings } from "@/queries/settings/use-settings";
import { useUpdateSettings } from "@/queries/settings/use-update-settings";

import { Button, Group, NumberInput, Select, Switch } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";

export default function WorkDefaultSettings() {
  const { data: settings } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { getLocalizedText } = useIntl();

  const [salaryAmount, setSalaryAmount] = useState(0);

  if (!settings) return null;

  useEffect(() => {
    setSalaryAmount(settings.default_salary_amount);
  }, [settings.default_salary_amount]);

  function handleCustomSubmit() {
    updateSettings({ default_salary_amount: salaryAmount });
  }

  const { default_salary_amount, default_project_hourly_payment, default_currency} = settings;

  return (
    <Group>
      {salaryAmount !== default_salary_amount && (
        <Button
          mt="lg"
          onClick={handleCustomSubmit}
          loading={isPending}
          disabled={isPending}
        >
          {getLocalizedText("Speichern", "Save")}
        </Button>
      )}
      <NumberInput
        w={120}
        label={getLocalizedText("Standard Gehalt", "Default Salary")}
        allowNegative={false}
        allowDecimal={false}
        allowLeadingZeros={false}
        aria-label={getLocalizedText(
          "Standard Gehalt auswählen",
          "Select Default Salary"
        )}
        placeholder={getLocalizedText(
          "Standard Gehalt auswählen",
          "Select Default Salary"
        )}
        value={salaryAmount}
        onChange={(value) => setSalaryAmount(value as number)}
      />
      <Select
        data={currencies}
        label={getLocalizedText(
          "Standard Gehalt Währung",
          "Default Salary Currency"
        )}
        aria-label={getLocalizedText(
          "Standard Währung auswählen",
          "Select Default Salary Currency"
        )}
        placeholder={getLocalizedText(
          "Standard Währung auswählen",
          "Select Salary Currency"
        )}
        value={default_currency}
        onChange={(value) => updateSettings({ default_currency: value as Currency })}
      />
      <Switch
        mt="lg"
        label={getLocalizedText("Stundenlohn", "Hourly Payment")}
        checked={default_project_hourly_payment}
        onChange={(event) =>
          updateSettings({ default_project_hourly_payment: event.currentTarget.checked })
        }
      />
    </Group>
  );
}
