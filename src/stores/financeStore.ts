import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FinanceTab } from "@/types/finance.types";

interface FinanceStoreState {
  activeTab: FinanceTab;
  selectedBankAccountId: string | null;
  activeSetting: FinanceSettingType;
}

export enum FinanceSettingType {
  DEFAULT = "default",
  TAGS = "tags",
  RULES = "rules",
  CONTACTS = "contacts",
  BANK_ACCOUNTS = "bank-accounts",
}

interface FinanceStoreActions {
  resetStore: () => void;
  setActiveTab: (tab: FinanceTab) => void;
  setSelectedBankAccountId: (bankAccountId: string | null) => void;
  setActiveSetting: (setting: FinanceSettingType) => void;
}

const initialState: FinanceStoreState = {
  activeTab: FinanceTab.Single,
  selectedBankAccountId: null,
  activeSetting: FinanceSettingType.DEFAULT,
};

export const useFinanceStore = create<
  FinanceStoreState & FinanceStoreActions
>()(
  persist(
    (set) => ({
      ...initialState,
      resetStore: () => {
        set(initialState);
      },

      setActiveTab(tab) {
        set({ activeTab: tab });
      },
      setSelectedBankAccountId(bankAccountId) {
        set({ selectedBankAccountId: bankAccountId });
      },
      setActiveSetting(setting) {
        set({ activeSetting: setting });
      },
    }),
    {
      name: "finance-store",
    }
  )
);
