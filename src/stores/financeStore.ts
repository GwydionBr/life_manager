import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FinanceTab } from "@/types/finance.types";

interface FinanceStoreState {
  activeTab: FinanceTab;
  activeBankAccountId: string | null;
}

interface FinanceStoreActions {
  resetStore: () => void;
  setActiveTab: (tab: FinanceTab) => void;
  setActiveBankAccountId: (id: string) => void;
}

export const useFinanceStore = create<
  FinanceStoreState & FinanceStoreActions
>()(
  persist(
    (set) => ({
      resetStore: () => {
        set({ activeTab: FinanceTab.Single });
        set({ activeBankAccountId: null });
      },
      activeTab: FinanceTab.Single,
      activeBankAccountId: null,

      setActiveTab(tab) {
        set({ activeTab: tab });
      },
      setActiveBankAccountId(id) {
        set({ activeBankAccountId: id });
      },
    }),
    {
      name: "finance-store",
    }
  )
);
