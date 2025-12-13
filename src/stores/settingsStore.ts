"use client";

import { MantineColor } from "@mantine/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum SettingsTab {
  GENERAL = "general",
  WORK = "work",
  FINANCE = "finance",
  CALENDAR = "calendar",
  HABBIT = "habbit",
}

interface SettingsState {
  isModalOpen: boolean;
  selectedTab: SettingsTab;
  isWorkNavbarOpen: boolean;
  isFinanceNavbarOpen: boolean;
  primaryColor: MantineColor;
  workColor: MantineColor;
  financeColor: MantineColor;
  calendarColor: MantineColor;
  habitColor: MantineColor;
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
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      isModalOpen: false,
      selectedTab: SettingsTab.GENERAL,
      isWorkNavbarOpen: true,
      isFinanceNavbarOpen: true,
      primaryColor: "teal",
      workColor: "blue",
      financeColor: "violet",
      calendarColor: "lime",
      habitColor: "red",

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
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
