import { useMemo, useCallback } from "react";
import { FinanceInterval } from "@/types/settings.types";
import {
  dateToISOString,
  stringToDate,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfWeek,
  addDaysToDate,
  addWeeksToDate,
  addMonthsToDate,
  addQuartersToDate,
  addYearsToDate,
  isDateInInterval,
} from "@/lib/financeChartHelperFunctions";
import { useSingleCashflows } from "@/db/collections/finance/single-cashflow/single-cashflow-collection";

/**
 * Represents a single data point in the chart
 * Contains financial data for a specific time period
 */
export interface FinanceChartData {
  date: string; // Date string in ISO format (YYYY-MM-DD) for chart compatibility
  expense: number; // Total expenses for this period
  income: number; // Total income for this period
  net: number; // Net amount (income - expense)
}

/**
 * Calculated statistics for the selected time period
 * Used to display summary cards above the chart
 */
export interface ChartStats {
  totalIncome: number; // Sum of all income
  totalExpense: number; // Sum of all expenses
  netAmount: number; // Total net (income - expenses)
  averageIncome: number; // Average income per period
  averageExpense: number; // Average expense per period
  bestMonth: string; // Period with highest net value
  worstMonth: string; // Period with lowest net value
  totalPeriods: number; // Number of periods in the data
  profitMargin: number; // Profit margin as percentage
}

/**
 * Date range for custom time period selection
 * Uses Date objects for better type safety and performance
 */
export interface DateRange {
  from: Date | null; // Start date
  to: Date | null; // End date
}

/**
 * Custom hook for managing finance chart data and statistics
 *
 * Features:
 * - Smart time period selection with navigation
 * - Auto-adjusting intervals based on date range
 * - Complete time period coverage (including empty periods)
 * - Comprehensive statistics calculation
 * - Performance optimized with memoization
 * - Timezone-safe date handling with date-fns
 */
export function useFinanceChartData(
  interval: FinanceInterval,
  dateRange: DateRange
) {
  // Get data from stores
  const { data: singleCashFlows } = useSingleCashflows();

  // stats will be computed after chartData is defined

  /**
   * Create a stable key for useEffect dependencies
   * Prevents unnecessary re-renders by memoizing the dependency array
   */
  const chartDataKey = useMemo(() => {
    const fromStr = dateRange.from ? dateToISOString(dateRange.from) : "null";
    const toStr = dateRange.to ? dateToISOString(dateRange.to) : "null";
    return `${interval}-${fromStr}-${toStr}-${singleCashFlows.length}`;
  }, [interval, dateRange.from, dateRange.to, singleCashFlows.length]);

  /**
   * Generate chart data from cash flows
   *
   * Features:
   * - Supports custom date ranges with navigation
   * - Generates complete time periods (including empty ones)
   * - Groups data by selected interval (day, week, month, etc.)
   * - Handles different time period formats
   * - Auto-adjusts granularity based on date range
   * - Timezone-safe date handling with date-fns
   */
  const getChartData = useCallback(
    (interval: FinanceInterval) => {
      // Determine date range based on user selection
      let startDate: Date;
      let endDate: Date;

      if (dateRange.from && dateRange.to) {
        // Use custom date range if specified
        startDate = new Date(dateRange.from);
        endDate = new Date(dateRange.to);
      } else {
        // Default to current month if no custom range
        const now = new Date();
        startDate = getStartOfMonth(now);
        endDate = getEndOfMonth(now);
      }

      const groupedData: {
        [key: string]: { expense: number; income: number };
      } = {};

      /**
       * Generate all time periods in the selected range
       * Ensures complete coverage even for periods without data
       */
      const generateTimePeriods = () => {
        const periods: string[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
          let key: string;

          // Create period keys based on selected interval
          switch (interval) {
            case "day":
              key = dateToISOString(current); // YYYY-MM-DD
              current.setTime(addDaysToDate(current, 1).getTime());
              break;
            case "week":
              // Calculate week start (Monday) using date-fns
              const weekStart = getStartOfWeek(current);
              key = dateToISOString(weekStart);
              current.setTime(addWeeksToDate(current, 1).getTime());
              break;
            case "month":
              key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
              current.setTime(addMonthsToDate(current, 1).getTime());
              break;
            case "1/4 year":
              const quarter = Math.floor(current.getMonth() / 3) + 1;
              key = `${current.getFullYear()}-Q${quarter}`; // YYYY-Q1
              current.setTime(addQuartersToDate(current, 1).getTime());
              break;
            case "1/2 year":
              const half = Math.floor(current.getMonth() / 6) + 1;
              key = `${current.getFullYear()}-H${half}`; // YYYY-H1
              current.setTime(addMonthsToDate(current, 6).getTime());
              break;
            case "year":
              key = current.getFullYear().toString(); // YYYY
              current.setTime(addYearsToDate(current, 1).getTime());
              break;
            default:
              key = dateToISOString(current);
              current.setTime(addDaysToDate(current, 1).getTime());
          }

          // Avoid duplicate periods
          if (!periods.includes(key)) {
            periods.push(key);
          }
        }

        return periods;
      };

      // Initialize all periods with zero values to ensure complete coverage
      const allPeriods = generateTimePeriods();
      allPeriods.forEach((period) => {
        groupedData[period] = { expense: 0, income: 0 };
      });

      // Add actual cash flow data to the grouped periods
      singleCashFlows.forEach((flow) => {
        const date = stringToDate(flow.date);

        // Skip flows outside custom date range if specified
        if (dateRange.from && dateRange.to) {
          if (!isDateInInterval(date, dateRange.from, dateRange.to)) {
            return;
          }
        }

        // Determine the period key for this cash flow
        let key: string;

        switch (interval) {
          case "day":
            key = dateToISOString(date);
            break;
          case "week":
            const weekStart = getStartOfWeek(date);
            key = dateToISOString(weekStart);
            break;
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          case "1/4 year":
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            key = `${date.getFullYear()}-Q${quarter}`;
            break;
          case "1/2 year":
            const half = Math.floor(date.getMonth() / 6) + 1;
            key = `${date.getFullYear()}-H${half}`;
            break;
          case "year":
            key = date.getFullYear().toString();
            break;
          default:
            key = dateToISOString(date);
        }

        // Add cash flow to the appropriate period
        if (groupedData[key]) {
          if (flow.amount <= 0) {
            groupedData[key].expense += flow.amount;
          } else {
            groupedData[key].income += flow.amount;
          }
        }
      });

      // Convert grouped data to array format and sort by date
      const chartData = Object.entries(groupedData)
        .map(([date, values]) => ({
          date,
          expense: values.expense,
          income: values.income,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return chartData;
    },
    [interval, dateRange.from, dateRange.to, singleCashFlows]
  );

  /**
   * Fetch and process chart data when dependencies change
   * Handles loading states and error handling
   */
  const chartData: FinanceChartData[] = useMemo(() => {
    const rawChartData = getChartData(interval);
    return rawChartData.map((item) => ({
      ...item,
      net: item.income - item.expense,
    }));
  }, [chartDataKey, getChartData, interval]);

  /**
   * Calculate comprehensive statistics from chart data
   * Uses a single iteration for better performance
   */
  const stats = useMemo((): ChartStats => {
    // Return default values if no data available
    if (chartData.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        averageIncome: 0,
        averageExpense: 0,
        bestMonth: "",
        worstMonth: "",
        totalPeriods: 0,
        profitMargin: 0,
      };
    }

    try {
      // Single iteration to calculate all stats at once for better performance
      const totals = chartData.reduce(
        (acc, item) => ({
          income: acc.income + item.income,
          expense: acc.expense + item.expense,
          best: item.net > acc.best.net ? item : acc.best,
          worst: item.net < acc.worst.net ? item : acc.worst,
        }),
        {
          income: 0,
          expense: 0,
          best: chartData[0],
          worst: chartData[0],
        }
      );

      // Calculate derived statistics
      const netAmount = totals.income - totals.expense;
      const averageIncome = totals.income / chartData.length;
      const averageExpense = totals.expense / chartData.length;
      const profitMargin =
        totals.income > 0 ? (netAmount / totals.income) * 100 : 0;

      return {
        totalIncome: totals.income,
        totalExpense: totals.expense,
        netAmount,
        averageIncome,
        averageExpense,
        bestMonth: totals.best.date,
        worstMonth: totals.worst.date,
        totalPeriods: chartData.length,
        profitMargin,
      };
    } catch (error) {
      console.error("Error calculating financial stats:", error);
      return {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        averageIncome: 0,
        averageExpense: 0,
        bestMonth: "",
        worstMonth: "",
        totalPeriods: 0,
        profitMargin: 0,
      };
    }
  }, [chartData]);

  return {
    chartData,
    stats,
  };
}
