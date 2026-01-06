import { useIntl } from "@/hooks/useIntl";
import { useFinanceStore } from "@/stores/financeStore";

import { Grid } from "@mantine/core";
import SettingsNavbar from "@/components/Navbar/SettingsNavbar";
import TagSettings from "./Tag/TagSettings";
import FinanceDefaultSettings from "./FinanceDefaultSettings/FinanceDefaultSettings";
import FinanceContactSettings from "./Contact/ContactSettings";
import { IconTags, IconUsers, IconBuildingBank } from "@tabler/icons-react";
import FinanceBankAccountSettings from "./FinanceBankAccount/FinanceBankAccountSettings";

import { FinanceSettingType } from "@/stores/financeStore";

export default function FinanceSettings() {
  const { getLocalizedText } = useIntl();
  const { activeSetting, setActiveSetting } = useFinanceStore();

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
              title: getLocalizedText("Tags", "Tags"),
              icon: <IconTags size={20} />,
              onClick: () => setActiveSetting(FinanceSettingType.TAGS),
              active: activeSetting === FinanceSettingType.TAGS,
            },
            {
              title: getLocalizedText("Kontakte", "Contacts"),
              icon: <IconUsers size={20} />,
              onClick: () => setActiveSetting(FinanceSettingType.CONTACTS),
              active: activeSetting === FinanceSettingType.CONTACTS,
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
        {activeSetting === FinanceSettingType.TAGS && <TagSettings />}
        {activeSetting === FinanceSettingType.CONTACTS && (
          <FinanceContactSettings />
        )}
        {activeSetting === FinanceSettingType.BANK_ACCOUNTS && (
          <FinanceBankAccountSettings />
        )}
      </Grid.Col>
    </Grid>
  );
}
