import { useSettings } from "@/db/collections/settings/settings-collection";
import { useIntl } from "@/hooks/useIntl";

import { Grid } from "@mantine/core";
import StatisticCard from "./StatisticCard";
import { ChartStats } from "@/hooks/useFinanceChartData";
import { FinanceInterval } from "@/types/settings.types";
import { useMemo } from "react";

/**
 * Props for the StatisticsCards component
 */
interface StatisticsCardsProps {
  stats: ChartStats;
  interval: FinanceInterval;
}

/**
 * Statistics Cards Section Component
 *
 * Displays all financial statistics in a grid layout using
 * reusable StatisticCard components
 */
export default function StatisticsCards({
  stats,
  interval,
}: StatisticsCardsProps) {
  const { data: settings } = useSettings();
  const { getLocalizedText, formatMoney, formatDate } = useIntl();

  const defaultFinanceCurrency = useMemo(
    () => settings?.default_finance_currency ?? "EUR",
    [settings]
  );

  function getIntervalString() {
    switch (interval) {
      case "day":
        return getLocalizedText("Tag", "day");
      case "week":
        return getLocalizedText("Woche", "week");
      case "month":
        return getLocalizedText("Monat", "month");
      case "1/4 year":
        return getLocalizedText("Quartal", "quarter");
      case "1/2 year":
        return getLocalizedText("Halbjahr", "half year");
      case "year":
        return getLocalizedText("Jahr", "year");
    }
  }

  return (
    <Grid gutter="md">
      {/* Total Income Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="totalIncome"
          value={formatMoney(stats.totalIncome, defaultFinanceCurrency)}
          subtitle={`Ø ${formatMoney(stats.averageIncome, defaultFinanceCurrency)} ${getLocalizedText("pro", "per")} ${getIntervalString()}`}
          color="teal"
        />
      </Grid.Col>

      {/* Total Expenses Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="totalExpense"
          value={formatMoney(stats.totalExpense, defaultFinanceCurrency)}
          subtitle={`Ø ${formatMoney(stats.averageExpense, defaultFinanceCurrency)} ${getLocalizedText("pro", "per")} ${getIntervalString()}`}
          color="red"
        />
      </Grid.Col>

      {/* Net Amount Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="net"
          value={formatMoney(stats.netAmount, defaultFinanceCurrency)}
          color={stats.netAmount >= 0 ? "green" : "red"}
          badge={
            stats.netAmount >= 0
              ? getLocalizedText("Gewinn", "Profit")
              : getLocalizedText("Verlust", "Loss")
          }
          badgeColor={stats.netAmount >= 0 ? "green" : "red"}
        />
      </Grid.Col>

      {/* Profit Margin Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="profitMargin"
          value={`${stats.profitMargin.toFixed(1)}%`}
          subtitle={`${stats.totalPeriods} ${getLocalizedText("Perioden", "Periods")}`}
          color={stats.profitMargin >= 0 ? "green" : "red"}
        />
      </Grid.Col>

      {/* Best Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="bestPeriod"
          value={stats.bestMonth ? formatDate(new Date(stats.bestMonth)) : "-"}
          subtitle={getLocalizedText(
            "Höchster Nettobetrag",
            "Highest Net Value"
          )}
          color="green"
        />
      </Grid.Col>

      {/* Worst Period Card */}
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <StatisticCard
          type="worstPeriod"
          value={
            stats.worstMonth ? formatDate(new Date(stats.worstMonth)) : "-"
          }
          subtitle={getLocalizedText(
            "Niedrigster Nettobetrag",
            "Lowest Net Value"
          )}
          color="red"
        />
      </Grid.Col>
    </Grid>
  );
}
