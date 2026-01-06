import dayjs from "dayjs";

import { useIntl } from "@/hooks/useIntl";

import { Button, Divider, Text, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Tables } from "@/types/db.types";
import {
  IconCashBanknotePlus,
  IconSquareRoundedCheck,
} from "@tabler/icons-react";

interface ProjectFilterProps {
  timeSpan: [Date | null, Date | null];
  timeEntries: Tables<"work_time_entry">[];
  project: Tables<"work_project">;
  isProcessingPayout: boolean;
  onTimeSpanChange: (timeSpan: [Date | null, Date | null]) => void;
  onSelectAll: () => void;
  handleSessionPayoutClick: (timeEntries: Tables<"work_time_entry">[]) => void;
}

export default function ProjectFilter({
  timeSpan,
  timeEntries,
  project,
  isProcessingPayout,
  onTimeSpanChange,
  onSelectAll,
  handleSessionPayoutClick,
}: ProjectFilterProps) {
  const { getLocalizedText, formatMoney } = useIntl();
  const today = dayjs();
  const unpaidSessions = timeEntries.filter(
    (session) => !session.single_cashflow_id
  );

  const sessionPayout = unpaidSessions.reduce(
    (acc, session) => acc + session.salary * (session.active_seconds / 3600),
    0
  );

  function handlePayoutClick() {
    if (!project.hourly_payment) {
      // TODO: Implement project payout
    } else if (sessionPayout > 0) {
      handleSessionPayoutClick(
        timeEntries.filter((session) => !session.single_cashflow_id)
      );
    }
  }

  return (
    <Stack>
      <DatePickerInput
        maw={300}
        label={getLocalizedText(
          "Filter nach Zeitrahmen",
          "Filter by time period"
        )}
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
              today.subtract(7, "day").format("YYYY-MM-DD"),
              today.format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Letzte 7 Tage", "Last 7 days"),
          },
          {
            value: [
              today.startOf("week").add(1, "day").format("YYYY-MM-DD"),
              today.format("YYYY-MM-DD"),
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
            label: getLocalizedText("Vergangene Woche", "Previous week"),
          },
          {
            value: [
              today.startOf("month").format("YYYY-MM-DD"),
              today.format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Dieser Monat", "This month"),
          },
          {
            value: [
              today.subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
              today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Vergangener Monat", "Previous month"),
          },
          {
            value: [
              today.subtract(2, "month").startOf("month").format("YYYY-MM-DD"),
              today.format("YYYY-MM-DD"),
            ],
            label: getLocalizedText("Letzten 3 Monate", "Last 3 months"),
          },
        ]}
      />
      <Stack gap={5} mt="md">
        <Text size="xs" c="dimmed" fw={500}>
          {getLocalizedText("Schnellaktionen", "Quick Actions")}
        </Text>
        <Divider />
      </Stack>
      <Button
        color="violet"
        onClick={handlePayoutClick}
        disabled={sessionPayout <= 0}
        leftSection={<IconCashBanknotePlus />}
        loading={isProcessingPayout}
      >
        {getLocalizedText("", "Payout")}{" "}
        {formatMoney(sessionPayout, project.currency)}{" "}
        {getLocalizedText("Auszahlen", "")}
      </Button>
      <Button
        variant="outline"
        leftSection={<IconSquareRoundedCheck />}
        onClick={onSelectAll}
      >
        {getLocalizedText("Alle auswählen", "Select All")}
      </Button>
    </Stack>
  );
}
