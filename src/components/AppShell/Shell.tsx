import { useSettingsStore } from "@/stores/settingsStore";
import { useLocation } from "@tanstack/react-router";
import { useProcessRecurringCashflows } from "@/hooks/useProcessRecurringCashflows";
import { useMemo } from "react";

import { AppShell, alpha, getThemeColor, useMantineTheme } from "@mantine/core";
import SettingsModal from "@/components/Settings/SettingsModal";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Aside from "./Aside";
import Header from "./Header/Header";
import Navbar from "./Navbar";
import { getGradientForColor } from "@/constants/colors";
import { AppOptions } from "@/types/settings.types";

export function Shell({ children }: { children: React.ReactNode }) {
  const {
    isAsideOpen,
    toggleAside,
    workColor,
    financeColor,
    calendarColor,
    habitColor,
    primaryColor,
  } = useSettingsStore();
  const location = useLocation();
  const theme = useMantineTheme();
  useProcessRecurringCashflows();

  // Determine the current app based on the location pathname
  const currentApp = useMemo(() => {
    if (location.pathname.includes("/work")) {
      return AppOptions.WORK;
    } else if (location.pathname.includes("/finance")) {
      return AppOptions.FINANCE;
    } else if (location.pathname.includes("/calendar")) {
      return AppOptions.CALENDAR;
    } else if (location.pathname.includes("/habbit-tracker")) {
      return AppOptions.HABBIT_TRACKER;
    } else {
      return null;
    }
  }, [location.pathname]);

  const currentAppColor = useMemo(() => {
    if (currentApp === AppOptions.WORK) {
      return workColor;
    } else if (currentApp === AppOptions.FINANCE) {
      return financeColor;
    } else if (currentApp === AppOptions.CALENDAR) {
      return calendarColor;
    } else if (currentApp === AppOptions.HABBIT_TRACKER) {
      return habitColor;
    } else {
      return primaryColor;
    }
  }, [
    currentApp,
    workColor,
    financeColor,
    calendarColor,
    habitColor,
    primaryColor,
  ]);

  const currentAppGradient = useMemo(() => {
    return getGradientForColor(currentAppColor);
  }, [currentAppColor]);

  const mainBackgroundColor = useMemo(() => {
    const fromColor = getThemeColor(currentAppGradient.from, theme);
    const toColor = getThemeColor(currentAppGradient.to, theme);
    return `linear-gradient(135deg, ${alpha(fromColor, 0.1)} 0%, ${alpha(toColor, 0.1)} 100%)`;
  }, [currentAppGradient, theme]);

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      aside={{
        width: isAsideOpen ? 300 : 50,
        breakpoint: "md",
        collapsed: { desktop: false, mobile: true },
      }}
      navbar={{
        width: 50,
        breakpoint: "md",
        collapsed: { desktop: !currentApp, mobile: true },
      }}
    >
      <AppShell.Header style={{ transition: "0.4s ease-in" }}>
        <Header currentApp={currentApp} />
      </AppShell.Header>

      <AppShell.Navbar
        withBorder={false}
        style={{ transition: "0.4s ease-in" }}
      >
        <Navbar currentApp={currentApp} />
      </AppShell.Navbar>

      <AppShell.Main
        style={{ transition: "0.4s ease-in" }}
        bg={mainBackgroundColor}
      >
        {children}
      </AppShell.Main>
      <AppShell.Aside
        bg="var(--mantine-color-body)"
        style={{ transition: "width 0.4s ease-in", overflow: "hidden" }}
        withBorder={false}
      >
        <Aside
          toggleAside={toggleAside}
          isAsideOpen={isAsideOpen}
          currentAppColor={currentAppColor}
        />
      </AppShell.Aside>
      <SettingsModal />
      <OfflineIndicator />
    </AppShell>
  );
}
