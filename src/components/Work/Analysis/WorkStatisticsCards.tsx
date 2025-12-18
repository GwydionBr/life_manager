import { useIntl } from "@/hooks/useIntl";

import { Grid } from "@mantine/core";
import WorkStatisticCard from "./WorkStatisticCard";
import { WorkChartStats } from "@/hooks/useWorkChartData";
import { FinanceInterval } from "@/types/settings.types";

/**
 * Props for the WorkStatisticsCards component
 */
interface WorkStatisticsCardsProps {
  stats: WorkChartStats;
  interval: FinanceInterval;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

/**
 * Work Statistics Cards Section Component
 *
 * Displays all work statistics in a grid layout using
 * reusable WorkStatisticCard components
 */
export default function WorkStatisticsCards({
  stats,
  interval,
  formatCurrency,
  formatDate,
}: WorkStatisticsCardsProps) {
  const { getLocalizedText, formatDuration } = useIntl();

  const getIntervalString = () => {
    switch (interval) {
      case "day":
        return getLocalizedText("Tag", "Day");
      case "week":
        return getLocalizedText("Woche", "Week");
      case "month":
        return getLocalizedText("Monat", "Month");
      case "1/4 year":
        return getLocalizedText("Quartal", "Quarter");
      case "1/2 year":
        return getLocalizedText("Halbjahr", "Half Year");
      case "year":
        return getLocalizedText("Jahr", "Year");
      default:
        return interval;
    }
  };

  return (
    <Grid gutter="md">
      {/* Total Time Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="totalTime"
          value={formatDuration(stats.totalTime)}
          subtitle={`Ø ${formatDuration(stats.averageTime)} ${getLocalizedText("pro", "per")} ${getIntervalString()}`}
          color="blue"
        />
      </Grid.Col>

      {/* Total Salary Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="totalSalary"
          value={formatCurrency(stats.totalSalary)}
          subtitle={`Ø ${formatCurrency(stats.averageSalary)} ${getLocalizedText("pro", "per")} ${getIntervalString()}`}
          color="green"
        />
      </Grid.Col>

      {/* Hourly Rate Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="hourlyRate"
          value={formatCurrency(stats.hourlyRate)}
          subtitle={
            getLocalizedText("Durchschnittliche Stundenrate", "Average hourly rate")
          }
          color="teal"
        />
      </Grid.Col>

      {/* Best Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="bestPeriod"
          value={stats.bestPeriod ? formatDate(stats.bestPeriod) : "-"}
          subtitle={getLocalizedText("Höchstes Gehalt", "Highest Salary")}
          color="green"
        />
      </Grid.Col>

      {/* Worst Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="worstPeriod"
          value={stats.worstPeriod ? formatDate(stats.worstPeriod) : "-"}
          subtitle={getLocalizedText("Niedrigstes Gehalt", "Lowest Salary")}
          color="red"
        />
      </Grid.Col>

      {/* Total Periods Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <WorkStatisticCard
          type="totalPeriods"
          value={stats.totalPeriods.toString()}
          subtitle={getLocalizedText("Gesamtperiode", "Total period")}
          color="blue"
        />
      </Grid.Col>
    </Grid>
  );
}
