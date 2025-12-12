import { useState } from "react";
import { useIntl } from "@/hooks/useIntl";

import { Grid } from "@mantine/core";
import SettingsNavbar from "@/components/Navbar/SettingsNavbar";
import FinanceCategorySettings from "./FinanceCategory/FinanceCategorySettings";
import FinanceRuleSettings from "./FinanceRuleSettings/FinanceRuleSettings";
import FinanceDefaultSettings from "./FinanceDefaultSettings/FinanceDefaultSettings";
import FinanceClientSettings from "./FinanceClient/FinanceClientSettings";
import { IconCategory, IconUsers, IconBuildingBank } from "@tabler/icons-react";
import FinanceBankAccountSettings from "./FinanceBankAccount/FinanceBankAccountSettings";

enum FinanceSettingType {
  DEFAULT = "default",
  CATEGORIES = "categories",
  RULES = "rules",
  CLIENTS = "clients",
  BANK_ACCOUNTS = "bank-accounts",
}

export default function FinanceSettings() {
  const { getLocalizedText } = useIntl();
  const [activeSetting, setActiveSetting] = useState<FinanceSettingType>(
    FinanceSettingType.DEFAULT
  );

  return (
    <Grid align="flex-start" h="100%" w="100%">
      <Grid.Col
        span={{ base: 4, sm: 3, lg: 2 }}
        h="100%"
        style={{ position: "sticky", top: 60, zIndex: 100 }}
      >
        <SettingsNavbar
          items={[
            {
              title: getLocalizedText("Standard", "Default"),
              onClick: () => setActiveSetting(FinanceSettingType.DEFAULT),
              active: activeSetting === FinanceSettingType.DEFAULT,
            },
            {
              title: getLocalizedText("Kategorien", "Categories"),
              icon: <IconCategory size={20} />,
              onClick: () => setActiveSetting(FinanceSettingType.CATEGORIES),
              active: activeSetting === FinanceSettingType.CATEGORIES,
            },
            {
              title: getLocalizedText("Kunden", "Clients"),
              icon: <IconUsers size={20} />,
              onClick: () => setActiveSetting(FinanceSettingType.CLIENTS),
              active: activeSetting === FinanceSettingType.CLIENTS,
            },
            {
              title: getLocalizedText("Bankkonten", "Bank Accounts"),
              icon: <IconBuildingBank size={20} />,
              onClick: () => setActiveSetting(FinanceSettingType.BANK_ACCOUNTS),
              active: activeSetting === FinanceSettingType.BANK_ACCOUNTS,
            },
          ]}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 8, sm: 9, lg: 10 }} h="100%">
        {activeSetting === FinanceSettingType.DEFAULT && (
          <FinanceDefaultSettings />
        )}
        {activeSetting === FinanceSettingType.CATEGORIES && (
          <FinanceCategorySettings />
        )}
        {activeSetting === FinanceSettingType.CLIENTS && (
          <FinanceClientSettings />
        )}
        {activeSetting === FinanceSettingType.RULES && <FinanceRuleSettings />}
        {activeSetting === FinanceSettingType.BANK_ACCOUNTS && (
          <FinanceBankAccountSettings />
        )}
      </Grid.Col>
    </Grid>
  );
}
