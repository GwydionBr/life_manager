import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo, useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";

import {
  Group,
  Select,
  Switch,
  Button,
  Stack,
  Card,
  Collapse,
  Text,
  ActionIcon,
  SegmentedControl,
  Grid,
} from "@mantine/core";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import {
  IconChartArea,
  IconChartBar,
  IconChartLine,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { financeIntervals } from "@/constants/settings";
import { type DateRange } from "@/hooks/useFinanceChartData";
import { type FinanceInterval } from "@/types/settings.types";
import {
  getStartOfMonth,
  getEndOfMonth,
  getStartOfQuarter,
  getEndOfQuarter,
  getStartOfYear,
  getEndOfYear,
  addMonthsToDate,
  addQuartersToDate,
  addYearsToDate,
  addWeeksToDate,
} from "@/lib/financeChartHelperFunctions";
import React from "react";
import FilterActionIcon from "@/components/UI/ActionIcons/FilterActionIcon";

/**
 * Available chart visualization types
 */
export type ChartType = "area" | "bar" | "line";

/**
 * Navigation mode for date selection
 */
export type NavigationMode = "month" | "quarter" | "year" | "custom";

/**
 * Props for the ChartControlSection component
 */
interface ChartControlsProps {
  interval: FinanceInterval;
  setInterval: (interval: FinanceInterval) => void;
  chartType: ChartType;
  setChartType: (chartType: ChartType) => void;
  showNet: boolean;
  setShowNet: (showNet: boolean) => void;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
}

/**
 * Chart Control Section Component
 *
 * Provides controls for:
 * - Smart time period selection with navigation
 * - Chart type selection (area, bar, line)
 * - Net display toggle
 * - Custom date range selection with preset buttons
 * - Timezone-safe date handling with date-fns
 */
export default function ChartControls({
  interval,
  setInterval,
  chartType,
  setChartType,
  showNet,
  setShowNet,
  dateRange,
  setDateRange,
}: ChartControlsProps) {
  const { getLocalizedText, locale } = useIntl();
  const [filterOpen, { toggle }] = useDisclosure(false);
  const [navigationMode, setNavigationMode] = useState<NavigationMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Chart type options for the dropdown
  const chartTypeOptions = [
    { value: "area", label: "Area", icon: IconChartArea },
    { value: "bar", label: "Bar", icon: IconChartBar },
    { value: "line", label: "Line", icon: IconChartLine },
  ];

  /**
   * Get the display title for the current navigation mode and date
   */
  const getNavigationTitle = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    switch (navigationMode) {
      case "month":
        return new Date(year, month).toLocaleDateString(locale, {
          month: "long",
          year: "numeric",
        });
      case "quarter":
        const quarter = Math.floor(month / 3) + 1;
        return `Q${quarter} ${year}`;
      case "year":
        return year.toString();
      case "custom":
        return getLocalizedText("Benutzerdefiniert", "Custom");
      default:
        return "";
    }
  }, [navigationMode, currentDate]);

  /**
   * Navigate to previous period
   */
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);

    switch (navigationMode) {
      case "month":
        newDate.setTime(addMonthsToDate(currentDate, -1).getTime());
        break;
      case "quarter":
        newDate.setTime(addQuartersToDate(currentDate, -1).getTime());
        break;
      case "year":
        newDate.setTime(addYearsToDate(currentDate, -1).getTime());
        break;
    }

    setCurrentDate(newDate);
    updateDateRange(newDate);
  };

  /**
   * Navigate to next period
   */
  const navigateNext = () => {
    const newDate = new Date(currentDate);

    switch (navigationMode) {
      case "month":
        newDate.setTime(addMonthsToDate(currentDate, 1).getTime());
        break;
      case "quarter":
        newDate.setTime(addQuartersToDate(currentDate, 1).getTime());
        break;
      case "year":
        newDate.setTime(addYearsToDate(currentDate, 1).getTime());
        break;
    }

    setCurrentDate(newDate);
    updateDateRange(newDate);
  };

  /**
   * Update date range based on navigation mode and current date
   */
  const updateDateRange = (date: Date, navMode?: NavigationMode) => {
    let fromDate: Date;
    let toDate: Date;

    switch (navMode || navigationMode) {
      case "month":
        fromDate = getStartOfMonth(date);
        toDate = getEndOfMonth(date);
        break;
      case "quarter":
        fromDate = getStartOfQuarter(date);
        toDate = getEndOfQuarter(date);
        break;
      case "year":
        fromDate = getStartOfYear(date);
        toDate = getEndOfYear(date);
        break;
      default:
        return;
    }

    setDateRange({ from: fromDate, to: toDate });
  };

  /**
   * Handle navigation mode change
   */
  const handleNavigationModeChange = (mode: string) => {
    const navigationMode = mode as NavigationMode;
    setNavigationMode(navigationMode);

    if (navigationMode === "custom") {
      setInterval("day");
    } else {
      // Set appropriate interval based on navigation mode
      switch (navigationMode) {
        case "month":
          setInterval("day");
          break;
        case "quarter":
          setInterval("week");
          break;
        case "year":
          setInterval("month");
          break;
      }
      updateDateRange(currentDate, navigationMode);
    }
  };

  /**
   * Auto-adjust interval based on date range
   */
  const getOptimalInterval = (from: Date, to: Date): FinanceInterval => {
    const daysDiff = Math.ceil(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 31) return "day";
    if (daysDiff <= 90) return "week";
    if (daysDiff <= 365) return "month";
    if (daysDiff <= 730) return "1/4 year";
    return "year";
  };

  /**
   * Update interval when date range changes
   */
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      // Only auto-adjust interval for custom mode
      if (navigationMode === "custom") {
        const optimalInterval = getOptimalInterval(
          dateRange.from,
          dateRange.to
        );
        setInterval(optimalInterval);
      }
    }
  }, [dateRange, navigationMode]);

  return (
    <Grid w="100%" columns={12}>
      <Grid.Col span={1}></Grid.Col>
      <Grid.Col span={10}>
        <Group align="center" w="100%" justify="center">
          {/* Navigation Controls */}
          <Group justify="space-between" maw={500} w="100%">
            <ActionIcon
              variant="light"
              onClick={navigatePrevious}
              disabled={navigationMode === "custom"}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>

            <Text
              fw={600}
              size="sm"
              style={{ minWidth: 120, textAlign: "center" }}
            >
              {getNavigationTitle}
            </Text>

            <ActionIcon
              variant="light"
              onClick={navigateNext}
              disabled={navigationMode === "custom"}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Grid.Col>
      <Grid.Col span={1}>
        <FilterActionIcon onClick={toggle} />
      </Grid.Col>

      <Grid.Col span={12}>
        <Collapse in={filterOpen}>
          <Card withBorder p="md" radius="md" maw={500} mx="auto">
            <Stack gap="md" mt="md" align="center">
              {/* Navigation Mode Selection */}
              <Group>
                <Text size="sm" fw={500}>
                  {getLocalizedText("Zeitperiode", "Time Period")}:
                </Text>
                <SegmentedControl
                  value={navigationMode}
                  onChange={handleNavigationModeChange}
                  data={[
                    {
                      value: "month",
                      label: getLocalizedText("Monat", "Month"),
                    },
                    {
                      value: "quarter",
                      label: getLocalizedText("Quartal", "Quarter"),
                    },
                    {
                      value: "year",
                      label: getLocalizedText("Jahr", "Year"),
                    },
                    {
                      value: "custom",
                      label: getLocalizedText("Benutzerdefiniert", "Custom"),
                    },
                  ]}
                  size="xs"
                />
              </Group>

              {/* Primary Controls: Time Period and Chart Type */}
              <Group justify="space-between" align="flex-end">
                <Group>
                  <Select
                    label={getLocalizedText("Zeitintervall", "Time Interval")}
                    value={interval}
                    onChange={(value) => setInterval(value as FinanceInterval)}
                    data={financeIntervals}
                    w={150}
                    // disabled={navigationMode !== "custom"}
                    description={
                      navigationMode === "month"
                        ? getLocalizedText(
                            "Alle Tage des Monats",
                            "All days of the month"
                          )
                        : navigationMode === "quarter"
                          ? getLocalizedText(
                              "Alle Wochen des Quartals",
                              "All weeks of the quarter"
                            )
                          : navigationMode === "year"
                            ? getLocalizedText(
                                "Alle Monate des Jahres",
                                "All months of the year"
                              )
                            : getLocalizedText(
                                "Automatically based on time period",
                                "Automatically based on time period"
                              )
                    }
                  />
                  <Select
                    label={getLocalizedText("Diagrammtyp", "Chart Type")}
                    value={chartType}
                    onChange={(value) => setChartType(value as ChartType)}
                    data={chartTypeOptions}
                    w={150}
                    leftSection={
                      chartTypeOptions.find(
                        (option) => option.value === chartType
                      )?.icon &&
                      React.createElement(
                        chartTypeOptions.find(
                          (option) => option.value === chartType
                        )!.icon,
                        { size: 16 }
                      )
                    }
                  />
                </Group>

                <Group>
                  <Switch
                    label={getLocalizedText("Netto anzeigen", "Show Net")}
                    checked={showNet}
                    onChange={(event) =>
                      setShowNet(event.currentTarget.checked)
                    }
                  />
                </Group>
              </Group>

              {/* Custom Date Range Controls */}
              {navigationMode === "custom" && (
                <Group>
                  <LocaleDatePickerInput
                    label={getLocalizedText("Von Datum", "From Date")}
                    placeholder={getLocalizedText(
                      "Startdatum auswählen",
                      "Select start date"
                    )}
                    value={dateRange.from}
                    onChange={(value: string | null) =>
                      setDateRange({
                        ...dateRange,
                        from: value ? new Date(value) : null,
                      })
                    }
                    w={150}
                  />
                  <LocaleDatePickerInput
                    label={getLocalizedText("Bis Datum", "To Date")}
                    placeholder={getLocalizedText(
                      "Enddatum auswählen",
                      "Select end date"
                    )}
                    value={dateRange.to}
                    onChange={(value: string | null) =>
                      setDateRange({
                        ...dateRange,
                        to: value ? new Date(value) : null,
                      })
                    }
                    w={150}
                  />

                  {/* Quick preset buttons for common date ranges */}
                  <Group>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => {
                        const now = new Date();
                        const oneYearAgo = addYearsToDate(now, -1);
                        setDateRange({
                          from: oneYearAgo,
                          to: now,
                        });
                      }}
                      leftSection={<IconCalendar size={14} />}
                    >
                      {getLocalizedText("Letztes Jahr", "Last Year")}
                    </Button>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => {
                        const now = new Date();
                        const oneMonthAgo = addMonthsToDate(now, -1);
                        setDateRange({
                          from: oneMonthAgo,
                          to: now,
                        });
                      }}
                      leftSection={<IconCalendar size={14} />}
                    >
                      {getLocalizedText("Letzter Monat", "Last Month")}
                    </Button>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => {
                        const now = new Date();
                        const oneWeekAgo = addWeeksToDate(now, -1);
                        setDateRange({
                          from: oneWeekAgo,
                          to: now,
                        });
                      }}
                      leftSection={<IconCalendar size={14} />}
                    >
                      {getLocalizedText("Letzte Woche", "Last Week")}
                    </Button>
                  </Group>
                </Group>
              )}
            </Stack>
          </Card>
        </Collapse>
      </Grid.Col>
    </Grid>
  );
}
