import { AppOptions } from "@/types/settings.types";
import DashboardHeader from "./DashboardHeader";
import WorkHeader from "./WorkHeader";
import FinanceHeader from "./FinanceHeader";
import CalendarHeader from "./CalendarHeader";
import HabbitTrackerHeader from "./HabbitTrackerHeader";
import { useMemo } from "react";
import { alpha, getThemeColor, useMantineTheme } from "@mantine/core";
import { useSettingsStore } from "@/stores/settingsStore";

interface HeaderProps {
  currentApp: AppOptions | null;
}
export default function Header({ currentApp }: HeaderProps) {
  const { financeColor, primaryColor } = useSettingsStore();
  const theme = useMantineTheme();

  const backgroundColor = useMemo(() => {
    const fromColor = getThemeColor(primaryColor, theme);
    const toColor = getThemeColor(financeColor, theme);
    return `linear-gradient(135deg, ${alpha(fromColor, 0.4)} 0%, ${alpha(toColor, 0.4)} 100%)`;
  }, [primaryColor, financeColor, theme]);

  switch (currentApp) {
    case AppOptions.WORK:
      return <WorkHeader />;
    case AppOptions.FINANCE:
      return <FinanceHeader />;
    case AppOptions.CALENDAR:
      return <CalendarHeader />;
    case AppOptions.HABBIT_TRACKER:
      return <HabbitTrackerHeader />;
    default:
      return <DashboardHeader />;
  }
}
