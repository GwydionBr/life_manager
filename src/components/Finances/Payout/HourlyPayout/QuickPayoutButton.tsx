import { useIntl } from "@/hooks/useIntl";
import { useHover } from "@mantine/hooks";

import {
  Group,
  Stack,
  Text,
  alpha,
  UnstyledButton,
  UnstyledButtonProps,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";

import { Currency } from "@/types/settings.types";
import { WorkTimeEntry } from "@/types/work.types";

interface QuickPayoutButtonProps extends UnstyledButtonProps {
  label: string;
  timeEntries: WorkTimeEntry[];
  salary: number;
  currency: Currency;
  timeSpan: [Date | null, Date | null];
  handleClick: (unpaidTimeEntries: WorkTimeEntry[]) => void;
}

export default function QuickPayoutButton({
  label,
  timeEntries,
  salary,
  currency,
  timeSpan,
  handleClick,
  ...props
}: QuickPayoutButtonProps) {
  const { getLocalizedText, formatDate, formatMoney } = useIntl();
  const { hovered, ref } = useHover();

  const unpaidTimeEntries = timeEntries.filter(
    (timeEntry) => !timeEntry.single_cashflow_id
  );
  const unpaidTotal = unpaidTimeEntries.reduce(
    (acc, timeEntry) => acc + salary * (timeEntry.active_seconds / 3600),
    0
  );

  return (
    <UnstyledButton
      ref={ref}
      onClick={() => handleClick(unpaidTimeEntries)}
      bg={hovered ? alpha("var(--mantine-color-violet-5)", 0.1) : "transparent"}
      style={{
        border: "1px solid var(--mantine-color-violet-5)",
        borderRadius: 10,
        padding: 10,
        transition: "background-color 0.2s ease-in-out",
        pointerEvents: unpaidTotal <= 0 ? "none" : "auto",
        opacity: unpaidTotal <= 0 ? 0.5 : 1,
      }}
      disabled={unpaidTotal <= 0}
      {...props}
    >
      <Group justify="space-between">
        <Stack>
          <Group justify="space-between">
            <Text>{label}</Text>
            <Text size="xs" c="dimmed">
              {unpaidTimeEntries.length}{" "}
              {getLocalizedText("Sitzungen", "Sessions")}
            </Text>
          </Group>
          {timeSpan[0] && timeSpan[1] && (
            <Group>
              <Text size="xs" c="dimmed">
                {formatDate(timeSpan[0])} - {formatDate(timeSpan[1])}
              </Text>
            </Group>
          )}
        </Stack>
        <Group>
          <Text>{formatMoney(unpaidTotal, currency)}</Text>
          <IconChevronRight />
        </Group>
      </Group>
    </UnstyledButton>
  );
}
