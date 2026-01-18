import { useMemo, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useLocation } from "@tanstack/react-router";
import { useProcessRecurringCashflows } from "@/hooks/useProcessRecurringCashflows";
import { useCheckNewVersion } from "@/hooks/useCheckNewVersion";
import { useNotificationHandler } from "@/hooks/notificationHooks/useNotificationHandler";

import { AppShell, alpha, getThemeColor, useMantineTheme } from "@mantine/core";
import SettingsModal from "@/components/Settings/SettingsModal";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Aside from "./Aside";
import Header from "./Header/Header";
import Navbar from "./Navbar";
import { getGradientForColor } from "@/constants/colors";
import { AppOptions } from "@/types/settings.types";
import { useAppointmentStatusManager } from "@/hooks/useAppointmentStatusManager";

export function Shell({ children }: { children: React.ReactNode }) {
  const {
    isAsideOpen,
    workColor,
    financeColor,
    calendarColor,
    habitColor,
    primaryColor,
    mainBackgroundColor,
    currentAppColor,
    toggleAside,
    setMainBackgroundColor,
    setCurrentAppColor,
  } = useSettingsStore();
  const location = useLocation();
  const theme = useMantineTheme();

  // Run hooks
  useProcessRecurringCashflows();
  useCheckNewVersion();
  useNotificationHandler();
  useAppointmentStatusManager();

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

  useEffect(() => {
    if (currentApp === AppOptions.WORK) {
      setCurrentAppColor(workColor);
    } else if (currentApp === AppOptions.FINANCE) {
      setCurrentAppColor(financeColor);
    } else if (currentApp === AppOptions.CALENDAR) {
      setCurrentAppColor(calendarColor);
    } else if (currentApp === AppOptions.HABBIT_TRACKER) {
      setCurrentAppColor(habitColor);
    } else {
      setCurrentAppColor(primaryColor);
    }
  }, [
    currentApp,
    workColor,
    financeColor,
    calendarColor,
    habitColor,
    primaryColor,
    setCurrentAppColor,
  ]);

  const currentAppGradient = useMemo(() => {
    return getGradientForColor(currentAppColor);
  }, [currentAppColor]);

  useEffect(() => {
    const mainBackgroundColor = `linear-gradient(135deg, 
      ${alpha(getThemeColor(currentAppGradient.from, theme), 0.1)} 0%, 
      ${alpha(getThemeColor(currentAppGradient.to, theme), 0.1)} 100%)`;
    setMainBackgroundColor(mainBackgroundColor);
  }, [currentAppGradient, theme, setMainBackgroundColor]);

  return (
    <AppShell
      layout="alt"
      header={{ height: 50 }}
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
        // withBorder={false}
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
