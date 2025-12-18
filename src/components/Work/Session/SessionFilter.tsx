"use client";
import dayjs from "dayjs";

import { useIntl } from "@/hooks/useIntl";

import { Card } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

interface SessionFilterProps {
  timeSpan: [Date | null, Date | null];
  onTimeSpanChange: (timeSpan: [Date | null, Date | null]) => void;
}

export default function SessionFilter({
  timeSpan,
  onTimeSpanChange,
}: SessionFilterProps) {
  const { getLocalizedText } = useIntl();
  const today = dayjs();

  return (
    <Card withBorder p="md" radius="md" maw={700} mx="auto">
      <DatePickerInput
        clearable
        type="range"
        maxDate={today.add(1, "day").toDate()}
        placeholder={getLocalizedText(
          "Datum auswählen um nach zeitraum zu filtern",
          "Select date to filter by time period"
        )}
        allowSingleDateInRange
        valueFormat={getLocalizedText("DD. MMM YYYY", "MMM DD, YYYY")}
        value={timeSpan}
        onChange={(value) => {
          onTimeSpanChange(value as [Date | null, Date | null]);
        }}
        presets={[
          {
            value: [
              today.subtract(2, "day").format("YYYY-MM-DD"),
              today.format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Letzte 2 Tage", "Last 2 days"),
          },
          {
            value: [
              today.subtract(7, "day").format("YYYY-MM-DD"),
              today.format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Letzte 7 Tage", "Last 7 days"),
          },
          {
            value: [
              today.startOf("week").add(1, "day").format("YYYY-MM-DD"),
              today.endOf("week").add(1, "day").format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Diese Woche", "This week"),
          },
          {
            value: [
              today
                .startOf("week")
                .subtract(1, "week")
                .add(1, "day")
                .format("YYYY-MM-DD"),
              today
                .endOf("week")
                .subtract(1, "week")
                .add(1, "day")
                .format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Letzte Woche", "Last week"),
          },
          {
            value: [
              today.startOf("month").format("YYYY-MM-DD"),
              today.endOf("month").format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Dieser Monat", "This month"),
          },
          {
            value: [
              today.subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
              today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Letzter Monat", "Last month"),
          },
        ]}
      />
    </Card>
  );
}
