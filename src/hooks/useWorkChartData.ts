"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

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
import { Tables } from "@/types/db.types";

/**
 * Represents a single data point in the work chart
 * Contains time and salary data for a specific time period
 */
export interface WorkChartData {
  date: string; // Date string in ISO format (YYYY-MM-DD) for chart compatibility
  time: number; // Total time in seconds for this period
  salary: number; // Total salary earned for this period
}

/**
 * Calculated statistics for the selected time period
 * Used to display summary cards above the chart
 */
export interface WorkChartStats {
  totalTime: number; // Sum of all time in seconds
  totalSalary: number; // Sum of all salary earned
  averageTime: number; // Average time per period in seconds
  averageSalary: number; // Average salary per period
  bestPeriod: string; // Period with highest salary
  worstPeriod: string; // Period with lowest salary
  totalPeriods: number; // Number of periods in the data
  hourlyRate: number; // Average hourly rate
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
 * Custom hook for managing work chart data and statistics
 *
 * Features:
 * - Smart time period selection with navigation
 * - Auto-adjusting intervals based on date range
 * - Complete time period coverage (including empty periods)
 * - Comprehensive statistics calculation
 * - Performance optimized with memoization
 * - Timezone-safe date handling with date-fns
 */
export function useWorkChartData(
  interval: FinanceInterval,
  dateRange: DateRange,
  sessions: Tables<"timer_session">[],
  projectId?: string
) {
  const { locale } = useSettingsStore();
  // Data and loading state
  const [chartData, setChartData] = useState<WorkChartData[]>([]);

  /**
   * Calculate comprehensive statistics from chart data
   * Uses a single iteration for better performance
   */
  const stats = useMemo((): WorkChartStats => {
    // Return default values if no data available
    if (chartData.length === 0) {
      return {
        totalTime: 0,
        totalSalary: 0,
        averageTime: 0,
        averageSalary: 0,
        bestPeriod: "",
        worstPeriod: "",
        totalPeriods: 0,
        hourlyRate: 0,
      };
    }

    try {
      // Single iteration to calculate all stats at once for better performance
      const totals = chartData.reduce(
        (acc, item) => ({
          time: acc.time + item.time,
          salary: acc.salary + item.salary,
          best: item.salary > acc.best.salary ? item : acc.best,
          worst: item.salary < acc.worst.salary ? item : acc.worst,
        }),
        {
          time: 0,
          salary: 0,
          best: chartData[0],
          worst: chartData[0],
        }
      );

      // Calculate derived statistics
      const averageTime = totals.time / chartData.length;
      const averageSalary = totals.salary / chartData.length;
      const hourlyRate =
        totals.time > 0 ? (totals.salary / totals.time) * 3600 : 0;

      return {
        totalTime: totals.time,
        totalSalary: totals.salary,
        averageTime,
        averageSalary,
        bestPeriod: totals.best.date,
        worstPeriod: totals.worst.date,
        totalPeriods: chartData.length,
        hourlyRate,
      };
    } catch (error) {
      console.error("Error calculating work stats:", error);
      return {
        totalTime: 0,
        totalSalary: 0,
        averageTime: 0,
        averageSalary: 0,
        bestPeriod: "",
        worstPeriod: "",
        totalPeriods: 0,
        hourlyRate: 0,
      };
    }
  }, [chartData]);

  /**
   * Create a stable key for useEffect dependencies
   * Prevents unnecessary re-renders by memoizing the dependency array
   */
  const chartDataKey = useMemo(() => {
    const fromStr = dateRange.from ? dateToISOString(dateRange.from) : "null";
    const toStr = dateRange.to ? dateToISOString(dateRange.to) : "null";
    const sessionsCount = sessions.length;
    return `${interval}-${fromStr}-${toStr}-${sessionsCount}-${projectId || "all"}`;
  }, [interval, dateRange.from, dateRange.to, sessions, projectId]);

  /**
   * Generate chart data from work sessions
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
        [key: string]: { time: number; salary: number };
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
        groupedData[period] = { time: 0, salary: 0 };
      });

      // Add actual session data to the grouped periods
      sessions.forEach((session) => {
        const date = stringToDate(session.start_time);

        // Skip sessions outside custom date range if specified
        if (dateRange.from && dateRange.to) {
          if (!isDateInInterval(date, dateRange.from, dateRange.to)) {
            return;
          }
        }

        // Determine the period key for this session
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

        // Add session to the appropriate period
        if (groupedData[key]) {
          const timeInSeconds = session.active_seconds || 0;
          const salaryEarned = session.hourly_payment
            ? Number(((timeInSeconds * session.salary) / 3600).toFixed(2))
            : 0;

          groupedData[key].time += timeInSeconds;
          groupedData[key].salary += salaryEarned;
        }
      });

      // Convert grouped data to array format and sort by date
      const chartData = Object.entries(groupedData)
        .map(([date, values]) => ({
          date,
          time: values.time,
          salary: values.salary,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return chartData;
    },
    [interval, dateRange.from, dateRange.to, sessions, projectId]
  );

  /**
   * Fetch and process chart data when dependencies change
   * Handles loading states and error handling
   */
  useEffect(() => {
    const rawChartData = getChartData(interval);
    setChartData(rawChartData);
  }, [chartDataKey, getChartData, interval]);

  return {
    chartData,
    stats,
  };
}
