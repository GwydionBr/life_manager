import { useFinanceStore } from "@/stores/financeStore";

import FinanceOverviewTab from "@/components/Finances/Overview/FinanceOverviewTab";
import FinanceProjectTab from "@/components/Finances/Project/FinanceProjectsTab";
import { FinanceTab } from "@/types/finance.types";
import FinanceSingleTab from "./CashFlow/Single/FinanceSingleTab";
import FinanceRecurringTab from "./CashFlow/Recurring/FinanceRecurringTab";
import FinancePayoutTab from "./Payout/PayoutTab/PayoutTab";

export default function FinanceTabs() {
  const { activeTab } = useFinanceStore();

  switch (activeTab) {
    case FinanceTab.Analysis:
      return <FinanceOverviewTab />;
    case FinanceTab.Projects:
      return <FinanceProjectTab />;
    case FinanceTab.Single:
      return <FinanceSingleTab />;
    case FinanceTab.Recurring:
      return <FinanceRecurringTab />;
    case FinanceTab.Payout:
      return <FinancePayoutTab />;
  }
}
