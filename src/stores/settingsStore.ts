import { MantineColor } from "@mantine/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Settings } from "@/types/settings.types";

export enum SettingsTab {
  GENERAL = "general",
  WORK = "work",
  FINANCE = "finance",
  CALENDAR = "calendar",
  HABBIT = "habbit",
}

interface SettingsState extends Settings {
  isModalOpen: boolean;
  selectedTab: SettingsTab;
  isWorkNavbarOpen: boolean;
  isFinanceNavbarOpen: boolean;
  primaryColor: MantineColor;
  workColor: MantineColor;
  financeColor: MantineColor;
  calendarColor: MantineColor;
  habitColor: MantineColor;
  isAsideOpen: boolean;
}

interface SettingsActions {
  setSelectedTab: (tab: SettingsTab) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  toggleWorkNavbar: () => void;
  toggleFinanceNavbar: () => void;
  setPrimaryColor: (color: MantineColor) => void;
  setWorkColor: (color: MantineColor) => void;
  setFinanceColor: (color: MantineColor) => void;
  setCalendarColor: (color: MantineColor) => void;
  setHabitColor: (color: MantineColor) => void;
  setSettingState: (adjustment: Partial<SettingsState>) => void;
  toggleAside: () => void;
}

const initialState: SettingsState = {
  id: "",
  isModalOpen: false,
  selectedTab: SettingsTab.GENERAL,
  isWorkNavbarOpen: true,
  isFinanceNavbarOpen: true,
  primaryColor: "teal",
  workColor: "blue",
  financeColor: "violet",
  calendarColor: "lime",
  habitColor: "red",
  isAsideOpen: false,

  // Settings
  locale: "en-US",
  format_24h: true,
  automaticly_stop_other_timer: false,
  created_at: new Date().toISOString(),
  default_currency: "USD",
  default_finance_currency: "USD",
  default_group_color: null,
  default_project_hourly_payment: false,
  default_salary_amount: 0,
  round_in_time_sections: false,
  rounding_amount: "min",
  rounding_custom_amount: 0,
  rounding_direction: "up",
  rounding_interval: 0,
  show_calendar_time: false,
  show_change_curreny_window: null,
  time_section_interval: 0,
  user_id: "",
  updated_at: new Date().toISOString(),
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedTab: (tab: SettingsTab) => {
        set({ selectedTab: tab });
      },
      setIsModalOpen: (isModalOpen: boolean) => {
        set({ isModalOpen: isModalOpen });
      },
      toggleWorkNavbar: () => {
        set({ isWorkNavbarOpen: !get().isWorkNavbarOpen });
      },
      toggleFinanceNavbar: () => {
        set({ isFinanceNavbarOpen: !get().isFinanceNavbarOpen });
      },
      setPrimaryColor: (color: MantineColor) => {
        set({ primaryColor: color });
      },
      setWorkColor: (color: MantineColor) => {
        set({ workColor: color });
      },
      setFinanceColor: (color: MantineColor) => {
        set({ financeColor: color });
      },
      setCalendarColor: (color: MantineColor) => {
        set({ calendarColor: color });
      },
      setHabitColor: (color: MantineColor) => {
        set({ habitColor: color });
      },
      setSettingState: (adjustment: Partial<SettingsState>) => {
        set({ ...get(), ...adjustment });
      },
      toggleAside: () => {
        set({ isAsideOpen: !get().isAsideOpen });
      },
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
