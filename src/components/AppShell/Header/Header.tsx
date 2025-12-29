import { AppOptions } from "@/types/settings.types";
import DashboardHeader from "./DashboardHeader";
import WorkHeader from "./WorkHeader";
import FinanceHeader from "./FinanceHeader";
import CalendarHeader from "./CalendarHeader";
import HabbitTrackerHeader from "./HabbitTrackerHeader";

interface HeaderProps {
  currentApp: AppOptions | null;
}
export default function Header({ currentApp }: HeaderProps) {

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
