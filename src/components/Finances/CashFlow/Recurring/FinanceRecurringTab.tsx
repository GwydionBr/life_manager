import { useState, useEffect, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import { useIntl } from "@/hooks/useIntl";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Stack,
  Group,
  Text,
  Divider,
  ActionIcon,
  Badge,
  ThemeIcon,
  Collapse,
  Skeleton,
  Box,
} from "@mantine/core";

import EditCashFlowButton from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/AddCashFlowModal";
import { FinanceInterval } from "@/types/settings.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import {
  IconCalendarEvent,
  IconCashMove,
  IconCashMoveBack,
  IconCashPlus,
  IconCheck,
  IconList,
} from "@tabler/icons-react";
import FinancesNavbar from "@/components/Finances/FinancesNavbar/FinancesNavbar";
import RecurringCashFlowRow from "./RecurringCashFlowRow";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import { SettingsTab } from "@/stores/settingsStore";
import { RecurringCashFlow } from "@/types/finance.types";
// import { useRecurringCashflowQuery } from "@/utils/queries/finances/use-recurring-cashflow";
import { useRecurringCashflows } from "@/db/collections/finance/recurring-cashflow/use-recurring-cashflow-query";
// import { useProcessRecurringCashflows } from "@/hooks/useProcessRecurringCashflows";
import FinancesNavbarDefaultCard from "@/components/Finances/FinancesNavbar/FinancesNavbarDefaultCard";
import FinancesNavbarToolbar from "@/components/Finances/FinancesNavbar/FinancesNavbarToolbar";
import FinancesNavbarNavList from "@/components/Finances/FinancesNavbar/FinancesNavbarNavList";
import SelectBankAccount from "@/components/Finances/BankAccount/SelectBankAccount";

export default function FinanceRecurringTab() {
  const {
    data: recurringCashFlows = [],
    isLoading: isRecurringCashFlowsLoading,
  } = useRecurringCashflows();
  // const { triggerProcessing } = useProcessRecurringCashflows();
  const { data: settings } = useSettings();
  const { setIsModalOpen, setSelectedTab } = useSettingsStore();
  const { getLocalizedText, formatMoney } = useIntl();

  const [filter, setFilter] = useState<
    "all" | "active" | "completed" | "future"
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">(
    "all"
  );

  // Single Edit
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<RecurringCashFlow | null>(null);

  // Single Add
  const [
    cashFlowModalOpened,
    { open: openCashFlowModal, close: closeCashFlowModal },
  ] = useDisclosure(false);

  useEffect(() => {
    if (recurringCashFlows?.length === 0) {
      setFilter("all");
      setSelectedCashFlow(null);
    } else if (recurringCashFlows.length > 0 && selectedCashFlow === null) {
      setSelectedCashFlow(recurringCashFlows[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringCashFlows]);

  // Filter active and completed recurring cash flows
  const today = useMemo(() => new Date(), []);
  const activeCashFlows = useMemo(
    () =>
      recurringCashFlows.filter((cashFlow) => {
        // Base active condition: started and (no end date or ends in the future)
        const hasStarted = new Date(cashFlow.start_date) <= today;
        const endsInFuture =
          !cashFlow.end_date || new Date(cashFlow.end_date) > today;
        return hasStarted && endsInFuture;
      }),
    [recurringCashFlows, today]
  );

  const filteredActiveCashFlows = useMemo(
    () =>
      activeCashFlows.filter((cashFlow) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "income") return cashFlow.amount > 0;
        if (typeFilter === "expense") return cashFlow.amount <= 0;
        return false;
      }),
    [activeCashFlows, typeFilter]
  );

  const activeExpenseSum = useMemo(
    () =>
      activeCashFlows
        .filter((cashFlow) => cashFlow.amount <= 0)
        .reduce((sum, cashFlow) => {
          return sum + cashFlow.amount;
        }, 0),
    [activeCashFlows]
  );

  const activeIncomeSum = useMemo(
    () =>
      activeCashFlows
        .filter((cashFlow) => cashFlow.amount > 0)
        .reduce((sum, cashFlow) => {
          return sum + cashFlow.amount;
        }, 0),
    [activeCashFlows]
  );

  const activeTotalSum = activeIncomeSum + activeExpenseSum;

  const completedCashFlows = useMemo(
    () =>
      recurringCashFlows.filter((cashFlow) => {
        if (!cashFlow.end_date) return false; // No end date = not completed
        const endDate = new Date(cashFlow.end_date);
        let isCompleted = endDate <= today;
        if (typeFilter === "income")
          isCompleted = isCompleted && cashFlow.amount > 0;
        if (typeFilter === "expense")
          isCompleted = isCompleted && cashFlow.amount <= 0;
        return isCompleted;
      }),
    [recurringCashFlows, typeFilter, today]
  );

  const filteredCompletedCashFlows = useMemo(
    () =>
      completedCashFlows.filter((cashFlow) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "income") return cashFlow.amount > 0;
        if (typeFilter === "expense") return cashFlow.amount <= 0;
        return false;
      }),
    [completedCashFlows, typeFilter]
  );

  const futureCashFlows = useMemo(
    () =>
      recurringCashFlows.filter((cashFlow) => {
        const startDate = new Date(cashFlow.start_date);
        let isFuture = startDate > today;
        if (typeFilter === "income") isFuture = isFuture && cashFlow.amount > 0;
        if (typeFilter === "expense")
          isFuture = isFuture && cashFlow.amount <= 0;
        return isFuture;
      }),
    [recurringCashFlows, typeFilter, today]
  );

  const filteredFutureCashFlows = useMemo(
    () =>
      futureCashFlows.filter((cashFlow) => {
        if (typeFilter === "all") return true;
        if (typeFilter === "income") return cashFlow.amount > 0;
        if (typeFilter === "expense") return cashFlow.amount <= 0;
        return false;
      }),
    [futureCashFlows, typeFilter]
  );

  const navbarItems = useMemo(() => {
    return [
      [
        {
          label: getLocalizedText("Alle", "All"),
          leftSection: (
            <ThemeIcon variant="transparent" color="gray">
              <IconList />
            </ThemeIcon>
          ),
          active: filter === "all",
          onClick: () => setFilter("all"),
          disabled: recurringCashFlows.length === 0,
        },
        {
          label: getLocalizedText("Aktiv", "Active"),
          leftSection: (
            <ThemeIcon variant="transparent" color="grape">
              <IconList />
            </ThemeIcon>
          ),
          active: filter === "active",
          onClick: () => setFilter("active"),
          disabled: activeCashFlows.length === 0,
        },
        {
          label: getLocalizedText("Abgeschlossen", "Completed"),
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconCheck />
            </ThemeIcon>
          ),
          active: filter === "completed",
          onClick: () => setFilter("completed"),
          disabled: completedCashFlows.length === 0,
        },
        {
          label: getLocalizedText("Zukünftig", "Future"),
          leftSection: (
            <ThemeIcon variant="transparent" color="blue">
              <IconCalendarEvent />
            </ThemeIcon>
          ),
          active: filter === "future",
          onClick: () => setFilter("future"),
          disabled: futureCashFlows.length === 0,
        },
      ],
      [
        {
          label: getLocalizedText("Ausgaben", "Expense"),
          leftSection: (
            <ThemeIcon variant="transparent" color="red">
              <IconCashMoveBack />
            </ThemeIcon>
          ),
          active: typeFilter === "expense",
          onClick: () =>
            setTypeFilter((prev) => (prev === "expense" ? "all" : "expense")),
          disabled:
            recurringCashFlows.filter((cashFlow) => cashFlow.amount <= 0)
              .length === 0,
        },
        {
          label: getLocalizedText("Einnahmen", "Income"),
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconCashMove />
            </ThemeIcon>
          ),
          active: typeFilter === "income",
          onClick: () =>
            setTypeFilter((prev) => (prev === "income" ? "all" : "income")),
          disabled:
            recurringCashFlows.filter((cashFlow) => cashFlow.amount > 0)
              .length === 0,
        },
      ],
    ];
  }, [
    filter,
    getLocalizedText,
    recurringCashFlows,
    typeFilter,
    activeCashFlows,
    completedCashFlows,
    futureCashFlows,
  ]);

  function getIntervalLabel(interval: FinanceInterval) {
    switch (interval) {
      case "day":
        return getLocalizedText("Täglich", "Daily");
      case "week":
        return getLocalizedText("Wöchentlich", "Weekly");
      case "month":
        return getLocalizedText("Monatlich", "Monthly");
      case "1/4 year":
        return getLocalizedText("Vierteljährlich", "Quarterly");
      case "1/2 year":
        return getLocalizedText("Halbjährlich", "Half Yearly");
      case "year":
        return getLocalizedText("Jährlich", "Yearly");
    }
  }

  return (
    <Box w="100%">
      {/* Navbar */}
      <FinancesNavbar
        items={[
          <FinancesNavbarToolbar
            key="finance-recurring-toolbar"
            toolbarItems={[
              <AdjustmentActionIcon
                key="finance-recurring-adjustment-action-icon"
                size="lg"
                variant="transparent"
                tooltipLabel={getLocalizedText(
                  "Finanzeinstellungen anpassen",
                  "Adjust finance settings"
                )}
                iconSize={20}
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTab(SettingsTab.FINANCE);
                }}
              />,
              <DelayedTooltip
                key="finance-recurring-add-cash-flow-tooltip"
                label={getLocalizedText(
                  "Wiederkehrenden Cashflow hinzufügen",
                  "Add Recurring Cash Flow"
                )}
              >
                <ActionIcon
                  onClick={openCashFlowModal}
                  variant="transparent"
                  size="lg"
                >
                  <IconCashPlus size={22} />
                </ActionIcon>
              </DelayedTooltip>,
            ]}
          />,
          <FinancesNavbarDefaultCard key="finance-recurring-bank-account-card">
            <SelectBankAccount />
          </FinancesNavbarDefaultCard>,
          <FinancesNavbarNavList
            key="finance-recurring-navbar-list"
            navbarItems={navbarItems}
          />,
          <FinancesNavbarDefaultCard key="finance-recurring-default-card">
            {" "}
            <Stack align="flex-start">
              <Group justify="space-between">
                <Group gap="xs">
                  <Text>{getLocalizedText("Ausgaben", "Expense")}:</Text>
                  <Text c="red" fw={700}>
                    {activeExpenseSum
                      ? formatMoney(
                          activeExpenseSum,
                          settings?.default_finance_currency || "EUR"
                        )
                      : 0}
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text>{getLocalizedText("Einnahmen", "Income")}:</Text>
                  <Text c="green" fw={700}>
                    {activeIncomeSum
                      ? formatMoney(
                          activeIncomeSum,
                          settings?.default_finance_currency || "EUR"
                        )
                      : 0}
                  </Text>
                </Group>
              </Group>
              <Divider />
              <Group justify="center">
                <Text>{getLocalizedText("Gesamt", "Total")}:</Text>
                <Text
                  c={activeTotalSum && activeTotalSum > 0 ? "green" : "red"}
                  fw={700}
                >
                  {activeTotalSum
                    ? formatMoney(
                        activeTotalSum,
                        settings?.default_finance_currency || "EUR"
                      )
                    : 0}
                </Text>
              </Group>
            </Stack>
          </FinancesNavbarDefaultCard>,
        ]}
      />
      {/* Tables */}
      <Stack w="100%" align="center" gap="sm" pl={250} pb="xl" pr="lg" pt="md">
        {isRecurringCashFlowsLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <Skeleton height={45} w="100%" key={i} />
          ))
        ) : (
          <Stack gap="xl" w="100%" maw={950}>
            <Collapse in={filter !== "future" && filter !== "completed"}>
              {filteredActiveCashFlows.length > 0 && (
                <Stack w="100%">
                  <Divider
                    w="100%"
                    label={
                      <Badge color="blue" variant="outline">
                        {getLocalizedText("Aktiv", "Active")}
                      </Badge>
                    }
                    labelPosition="left"
                    size="sm"
                    mb="md"
                  />
                  <Stack gap={0} ml="xl">
                    {filteredActiveCashFlows.map((cashFlow) => (
                      <RecurringCashFlowRow
                        key={cashFlow.id}
                        cashflow={cashFlow}
                        showNextDate
                        getIntervalLabel={getIntervalLabel}
                        onEdit={() => {
                          setSelectedCashFlow(cashFlow);
                          openEditCashFlow();
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </Collapse>
            <Collapse in={filter !== "active" && filter !== "completed"}>
              {filteredFutureCashFlows.length > 0 && (
                <Stack w="100%">
                  <Divider
                    w="100%"
                    label={
                      <Badge color="blue" variant="outline">
                        {getLocalizedText("Zukünftig", "Future")}
                      </Badge>
                    }
                    labelPosition="left"
                  />
                  <Stack gap={0} ml="xl">
                    {filteredFutureCashFlows.map((cashFlow) => (
                      <RecurringCashFlowRow
                        key={cashFlow.id}
                        cashflow={cashFlow}
                        showStartDate
                        getIntervalLabel={getIntervalLabel}
                        onEdit={() => {
                          setSelectedCashFlow(cashFlow);
                          openEditCashFlow();
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </Collapse>
            <Collapse in={filter !== "active" && filter !== "future"}>
              {filteredCompletedCashFlows.length > 0 && (
                <Stack w="100%">
                  <Divider
                    w="100%"
                    labelPosition="left"
                    label={
                      <Badge color="blue" variant="outline">
                        {getLocalizedText("Abgeschlossen", "Completed")}
                      </Badge>
                    }
                  />
                  <Stack gap={0} ml="xl">
                    {filteredCompletedCashFlows.map((cashFlow) => (
                      <RecurringCashFlowRow
                        getIntervalLabel={getIntervalLabel}
                        key={cashFlow.id}
                        cashflow={cashFlow}
                        showEndDate
                        onEdit={() => {
                          setSelectedCashFlow(cashFlow);
                          openEditCashFlow();
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
            </Collapse>
          </Stack>
        )}
      </Stack>
      <CashFlowModal
        opened={cashFlowModalOpened}
        onClose={closeCashFlowModal}
        isSingle={false}
      />
      {selectedCashFlow && (
        <EditCashFlowButton
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )}
    </Box>
  );
}
