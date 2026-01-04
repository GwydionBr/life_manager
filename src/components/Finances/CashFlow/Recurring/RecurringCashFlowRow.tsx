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
import FinanceCategoryBadges from "@/components/Finances/Category/FinanceCategoryBadges";

import { getNextDate } from "@/lib/financeHelperFunction";
import { isToday } from "date-fns";

import { RecurringCashFlow } from "@/types/finance.types";
import { FinanceInterval } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import { useFinanceCategories } from "@/db/collections/finance/finance-category/finance-category-collection";
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
  const { data: financeCategories } = useFinanceCategories();
  const { updateRecurringCashflow } = useRecurringCashflowMutations();
  const { hovered, ref } = useHover();
  const [isUpdating, setIsUpdating] = useState(false);
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const currentCategories = useMemo(() => {
    return financeCategories.filter((category) =>
      cashflow.categories.map((category) => category.id).includes(category.id)
    );
  }, [financeCategories, cashflow.categories]);

  const nextDate = useMemo(() => {
    if (!showNextDate) return null;
    return getNextDate(cashflow.interval, new Date(cashflow.start_date));
  }, [cashflow.interval, cashflow.start_date]);

  const handleCategoryClose = async (
    updatedCategories: Tables<"finance_category">[] | null
  ) => {
    if (isUpdating) return;
    setIsUpdating(true);
    closeCategoryPopover();
    // TODO: Ask user if they want to update the single cash flows
    if (updatedCategories) {
      updateRecurringCashflow(
        cashflow.id,
        {
          ...cashflow,
          categories: updatedCategories,
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
        if (!isCategoryPopoverOpen) {
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
          <FinanceCategoryBadges
            initialCategories={currentCategories ?? []}
            onPopoverOpen={openCategoryPopover}
            onPopoverClose={handleCategoryClose}
            showAddCategory={hovered}
          />
        </Group>
      </Group>
    </Card>
  );
}
