import { useFinanceStore } from "@/stores/financeStore";
import { useIntl } from "@/hooks/useIntl";

import { Tabs } from "@mantine/core";
import {
  IconDeviceDesktopDollar,
  IconPresentationAnalytics,
  IconCashBanknote,
  IconRepeat,
  IconReceipt2,
} from "@tabler/icons-react";
import FinanceOverviewTab from "@/components/Finances/Overview/FinanceOverviewTab";
// import FinanceRecurringTab from "@/components/Finances/CashFlow/Recurring/FinanceRecurringTab";
// import FinanceProjectTab from "@/components/Finances/Project/FinanceProjectsTab";
import { FinanceTab } from "@/types/finance.types";
// import PayoutTab from "./Payout/PayoutTab/PayoutTab";
// import FinanceSingleTab from "./CashFlow/Single/FinanceSingleTab";

export default function FinanceTabs() {
  const { getLocalizedText } = useIntl();
  const { activeTab, setActiveTab } = useFinanceStore();

  return (
    <Tabs
      defaultValue={activeTab}
      w="100%"
      value={activeTab}
      onChange={(value) => setActiveTab(value as FinanceTab)}
    >
      <Tabs.List
        grow
        mb="xl"
        pos="sticky"
        top={0}
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
        style={{ zIndex: 100 }}
      >
        <Tabs.Tab
          leftSection={<IconCashBanknote color="light-dark(blue, cyan)" />}
          value="Single"
        >
          {getLocalizedText("Einzel", "Single")}
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={<IconRepeat color="light-dark(blue, cyan) " />}
          value="Recurring"
        >
          {getLocalizedText("Wiederkehrend", "Recurring")}
        </Tabs.Tab>
        <Tabs.Tab
          value="Projects"
          leftSection={
            <IconDeviceDesktopDollar color="light-dark(blue, cyan)" />
          }
        >
          {getLocalizedText("Projekte", "Projects")}
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={<IconReceipt2 color="light-dark(blue, cyan)" />}
          value="Payout"
        >
          {getLocalizedText("Auszahlung", "Payout")}
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={
            <IconPresentationAnalytics color="light-dark(blue, cyan)" />
          }
          value="Analysis"
        >
          {getLocalizedText("Analyse", "Analysis")}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="Projects">
        {/* <FinanceProjectTab /> */}
        null
      </Tabs.Panel>
      <Tabs.Panel value="Single">
        {/* <FinanceSingleTab /> */}
        null
      </Tabs.Panel>
      <Tabs.Panel value="Recurring">
        {/* <FinanceRecurringTab /> */}
        null
      </Tabs.Panel>
      <Tabs.Panel value="Payout">
        {/* <PayoutTab /> */}
        null
      </Tabs.Panel>
      <Tabs.Panel value="Analysis">
        <FinanceOverviewTab />
      </Tabs.Panel>
    </Tabs>
  );
}
