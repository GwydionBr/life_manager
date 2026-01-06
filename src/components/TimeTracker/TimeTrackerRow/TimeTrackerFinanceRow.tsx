import { Text, ThemeIcon } from "@mantine/core";
import { IconCurrencyEuro, IconCurrencyDollar } from "@tabler/icons-react";
import TimeTrackerRow from "@/components/TimeTracker/TimeTrackerRow/TimeTrackerRow";

import { Currency } from "@/types/settings.types";
import { TimerState } from "@/types/timeTracker.types";

interface TimeTrackerFinanceRowProps {
  currency: Currency;
  moneyEarned: string;
  state: TimerState;
  color: string | null;
}

export default function TimeTrackerFinanceRow({
  currency,
  moneyEarned,
  state,
  color,
}: TimeTrackerFinanceRowProps) {
  return (
    <TimeTrackerRow
      style={{
        border:
          state === TimerState.Running
            ? "1px solid var(--mantine-color-grape-6)"
            : `1px solid ${color ?? "light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))"}`,
      }}
      icon={
        <ThemeIcon
          variant="transparent"
          color="var(--mantine-color-grape-6)"
          w="100%"
        >
          {currency === "EUR" ? (
            <IconCurrencyEuro size={22} />
          ) : (
            <IconCurrencyDollar size={22} />
          )}
        </ThemeIcon>
      }
    >
      <Text px="md">{moneyEarned}</Text>
    </TimeTrackerRow>
  );
}
