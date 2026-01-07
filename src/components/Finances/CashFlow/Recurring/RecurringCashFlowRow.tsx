import { useMemo, useState } from "react";
import { useDisclosure, useHover } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useRecurringCashflowMutations } from "@/db/collections/finance/recurring-cashflow/use-recurring-cashflow-mutations";

import { Badge, Card, CardProps, Group, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendar,
  IconCalendarOff,
  IconCalendarTime,
} from "@tabler/icons-react";
import FinanceTagBadges from "@/components/Finances/Tag/TagBadges";

import { getNextDate } from "@/lib/financeHelperFunction";
import { isToday } from "date-fns";

import { RecurringCashFlow } from "@/types/finance.types";
import { FinanceInterval } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import { useTags } from "@/db/collections/finance/tags/use-tags-query";
interface RecurringCashFlowRowProps extends CardProps {
  cashflow: RecurringCashFlow;
  showEndDate?: boolean;
  showStartDate?: boolean;
  showNextDate?: boolean;
  onEdit: () => void;
  getIntervalLabel: (interval: FinanceInterval) => string;
}

export default function RecurringCashFlowRow({
  cashflow,
  onEdit,
  showEndDate,
  showStartDate,
  showNextDate,
  getIntervalLabel,
  ...props
}: RecurringCashFlowRowProps) {
  const { formatMoney, formatDate } = useIntl();
  const { data: tags } = useTags();
  const { updateRecurringCashflow } = useRecurringCashflowMutations();
  const { hovered, ref } = useHover();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTagPopoverOpen, { open: openTagPopover, close: closetagPopover }] =
    useDisclosure(false);

  const currentTags = useMemo(() => {
    return tags.filter((tag) =>
      cashflow.tags.map((tag) => tag.id).includes(tag.id)
    );
  }, [tags, cashflow.tags]);

  const nextDate = useMemo(() => {
    if (!showNextDate) return null;
    return getNextDate(cashflow.interval, new Date(cashflow.start_date));
  }, [cashflow.interval, cashflow.start_date]);

  const handleTagClose = async (updatedTags: Tables<"tag">[] | null) => {
    if (isUpdating) return;
    setIsUpdating(true);
    closetagPopover();
    // TODO: Ask user if they want to update the single cash flows
    if (updatedTags) {
      updateRecurringCashflow(
        cashflow.id,
        {
          ...cashflow,
          tags: updatedTags,
        },
        true
      );
    }
    setTimeout(() => setIsUpdating(false), 500);
  };

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="xs"
      bg={
        hovered
          ? "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
          : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      }
      {...props}
      ref={ref}
      onClick={() => {
        if (!isTagPopoverOpen) {
          onEdit();
        }
      }}
      style={{
        border: hovered ? "1px solid var(--mantine-color-blue-6)" : "",
        cursor: hovered ? "pointer" : "default",
      }}
    >
      <Group justify="space-between" grow>
        <Group>
          <Text fw={700} c={cashflow.amount <= 0 ? "red" : "green"} w={70}>
            {formatMoney(cashflow.amount, cashflow.currency)}
          </Text>
          <Badge variant="light">{getIntervalLabel(cashflow.interval)}</Badge>
        </Group>
        <Group justify="flex-start">
          <Text>{cashflow.title}</Text>
        </Group>

        <Group justify="space-between">
          <Group>
            {showStartDate && (
              <Group gap={5}>
                <ThemeIcon variant="transparent" color="green">
                  <IconCalendar size={20} />
                </ThemeIcon>
                <Text>{formatDate(new Date(cashflow.start_date))}</Text>
              </Group>
            )}
            {showEndDate && cashflow.end_date && (
              <Group gap={5}>
                <ThemeIcon variant="transparent" color="red">
                  <IconCalendarOff size={20} />
                </ThemeIcon>
                <Text>{formatDate(new Date(cashflow.end_date))}</Text>
              </Group>
            )}
            {showNextDate && nextDate && (
              <Group gap={5}>
                <ThemeIcon
                  variant="transparent"
                  color={isToday(nextDate) ? "yellow" : "blue"}
                >
                  <IconCalendarTime size={20} />
                </ThemeIcon>
                <Text>{formatDate(nextDate)}</Text>
              </Group>
            )}
          </Group>
          <FinanceTagBadges
            initialTags={currentTags ?? []}
            onPopoverOpen={openTagPopover}
            onPopoverClose={handleTagClose}
            showAddTag={hovered}
          />
        </Group>
      </Group>
    </Card>
  );
}
