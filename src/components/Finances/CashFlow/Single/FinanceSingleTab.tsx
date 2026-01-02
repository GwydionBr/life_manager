import { useCallback, useEffect, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useIntl } from "@/hooks/useIntl";
import { useSingleCashflowsQuery } from "@/db/collections/finance/single-cashflow/use-single-cashflow-query";
import { useSingleCashflowMutations } from "@/db/collections/finance/single-cashflow/use-single-cashflow-mutations";

import {
  Group,
  ScrollArea,
  Stack,
  ActionIcon,
  Badge,
  Divider,
  ThemeIcon,
  Text,
  Collapse,
  Card,
  Skeleton,
} from "@mantine/core";
import EditCashFlowDrawer from "@/components/Finances/CashFlow/EditCashFlowDrawer";
import CashFlowModal from "@/components/Finances/CashFlow/AddCashFlowModal";

import {
  IconCashMove,
  IconCashMoveBack,
  IconCashPlus,
  IconList,
} from "@tabler/icons-react";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import SingleCashflowRow from "@/components/Finances/CashFlow/Single/SingleCashflowRow/SingleCashflowRow";
import FinancesNavbar from "@/components/Finances/FinancesNavbar/FinancesNavbar";
import AdjustmentActionIcon from "@/components/UI/ActionIcons/AdjustmentActionIcon";
import { SettingsTab } from "@/stores/settingsStore";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";
import { SingleCashFlow } from "@/types/finance.types";
// import {
//   useDeleteSingleCashflowMutation,
//   useSingleCashflowQuery,
// } from "@/utils/queries/finances/use-single-cashflow";
import FinancesNavbarToolbar from "@/components/Finances/FinancesNavbar/FinancesNavbarToolbar";
import FinancesNavbarNavList from "@/components/Finances/FinancesNavbar/FinancesNavbarNavList";
import FinancesNavbarDefaultCard from "@/components/Finances/FinancesNavbar/FinancesNavbarDefaultCard";
import SelectBankAccount from "@/components/Finances/BankAccount/SelectBankAccount";

export default function FinanceSingleTab() {
  // const {
  //   mutate: deleteSingleCashFlows,
  //   isPending: isDeletingSingleCashFlows,
  // } = useDeleteSingleCashflowMutation({
  //   onSuccess: () => {
  //     setSelectedCashFlows([]);
  //     closeBulkSelection();
  //     setLastSelectedIndex(null);
  //   },
  // });
  const { data: singleCashFlows = [], isLoading: isSingleCashFlowsLoading } =
    useSingleCashflowsQuery();
  const { deleteSingleCashflow } = useSingleCashflowMutations();
  const { setIsModalOpen, setSelectedTab } = useSettingsStore();
  const { getLocalizedText, formatMoney, formatDate } = useIntl();
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">(
    "all"
  );

  // Single Add
  const [
    cashFlowModalOpened,
    { open: openCashFlowModal, close: closeCashFlowModal },
  ] = useDisclosure(false);

  // Bulk selection
  const [
    bulkSelectionActive,
    { toggle: toggleBulkSelection, close: closeBulkSelection },
  ] = useDisclosure(false);
  const [selectedCashFlows, setSelectedCashFlows] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  // Single Edit
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<SingleCashFlow | null>(null);
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);

  const sortedSingleCashFlows = useMemo(
    () =>
      singleCashFlows?.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [singleCashFlows]
  );

  useEffect(() => {
    if (sortedSingleCashFlows.length === 0) {
      if (typeFilter !== "all") setTypeFilter("all");
      if (bulkSelectionActive) closeBulkSelection();
      if (selectedCashFlows.length > 0) setSelectedCashFlows([]);
      if (selectedCashFlow !== null) setSelectedCashFlow(null);
    } else if (selectedCashFlow === null) {
      setSelectedCashFlow(sortedSingleCashFlows[0] ?? null);
    }
    // Only run when the inputs that affect the guards change
  }, [
    sortedSingleCashFlows,
    bulkSelectionActive,
    selectedCashFlows.length,
    selectedCashFlow,
    typeFilter,
  ]);

  const handleToggleBulkSelection = () => {
    toggleBulkSelection();
    setSelectedCashFlows([]);
    setLastSelectedIndex(null);
  };

  const statistics = useMemo(() => {
    return {
      expenses: [
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.amount >= 0) return false;
            return (
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.amount >= 0) return false;
            return (
              date.getMonth() === new Date().getMonth() - 1 &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
      ],
      income: [
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.amount < 0) return false;
            return (
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
        sortedSingleCashFlows
          .filter((cashFlow) => {
            const date = new Date(cashFlow.date);
            if (cashFlow.amount < 0) return false;
            return (
              date.getMonth() === new Date().getMonth() - 1 &&
              date.getFullYear() === new Date().getFullYear()
            );
          })
          .reduce((acc, cashFlow) => acc + cashFlow.amount, 0),
      ],
    };
  }, [sortedSingleCashFlows]);

  const filteredSingleCashFlows = useMemo(() => {
    return sortedSingleCashFlows.filter((cashFlow) => {
      if (typeFilter === "all") return true;
      if (typeFilter === "expense") return cashFlow.amount < 0;
      if (typeFilter === "income") return cashFlow.amount >= 0;
      return false;
    });
  }, [sortedSingleCashFlows, typeFilter]);

  const toggleAllCashFlows = useCallback(() => {
    if (selectedCashFlows.length > 0) {
      setSelectedCashFlows([]);
    } else {
      setSelectedCashFlows(filteredSingleCashFlows.map((c) => c.id));
    }
  }, [filteredSingleCashFlows, selectedCashFlows]);

  const toggleCashFlowSelection = useCallback(
    (clientId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = filteredSingleCashFlows
          .slice(start, end + 1)
          .map((p) => p.id);
        setSelectedCashFlows((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedCashFlows((prev) =>
          prev.includes(clientId)
            ? prev.filter((id) => id !== clientId)
            : [...prev, clientId]
        );
        setLastSelectedIndex(index);
      }
    },
    [filteredSingleCashFlows, lastSelectedIndex]
  );

  const handleDeleteCashFlows = () => {
    showDeleteConfirmationModal(
      getLocalizedText("Einnahmen löschen", "Delete Income"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie diese Einnahmen löschen möchten?",
        "Are you sure you want to delete these income?"
      ),
      async () => {
        deleteSingleCashflow(selectedCashFlows);
        setSelectedCashFlows([]);
        closeBulkSelection();
        setLastSelectedIndex(null);
      },
      false
    );
  };

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
          active: typeFilter === "all",
          onClick: () => setTypeFilter("all"),
          disabled: singleCashFlows.length === 0,
        },
        {
          label: getLocalizedText("Ausgaben", "Expenses"),
          leftSection: (
            <ThemeIcon variant="transparent" color="red">
              <IconCashMoveBack />
            </ThemeIcon>
          ),
          active: typeFilter === "expense",
          onClick: () => setTypeFilter("expense"),
          disabled:
            singleCashFlows.filter((cashFlow) => cashFlow.amount < 0).length ===
            0,
        },
        {
          label: getLocalizedText("Einnahmen", "Income"),
          leftSection: (
            <ThemeIcon variant="transparent" color="green">
              <IconCashMove />
            </ThemeIcon>
          ),
          active: typeFilter === "income",
          onClick: () => setTypeFilter("income"),
          disabled:
            singleCashFlows.filter((cashFlow) => cashFlow.amount >= 0)
              .length === 0,
        },
      ],
    ];
  }, [getLocalizedText, singleCashFlows, typeFilter]);

  return (
    <Group wrap="nowrap" align="flex-start" mt="lg" mx="lg">
      <FinancesNavbar
        items={[
          <FinancesNavbarToolbar
            key="finance-single-toolbar"
            toolbarItems={[
              <AdjustmentActionIcon
                key="finance-single-adjustment-action-icon"
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
                key="finance-single-add-cash-flow-tooltip"
                label={getLocalizedText(
                  "Einmalzahlung hinzufügen",
                  "Add Single Cash Flow"
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
              <SelectActionIcon
                key="finance-single-select-action-icon"
                iconSize={20}
                onClick={handleToggleBulkSelection}
                selected={bulkSelectionActive}
                partiallySelected={
                  selectedCashFlows.length > 0 &&
                  selectedCashFlows.length < filteredSingleCashFlows.length
                }
                disabled={filteredSingleCashFlows.length === 0}
                tooltipLabel={
                  bulkSelectionActive
                    ? getLocalizedText(
                        "Deaktiviere Mehrfachauswahl",
                        "Deactivate bulk select"
                      )
                    : getLocalizedText(
                        "Aktiviere Mehrfachauswahl",
                        "Activate bulk select"
                      )
                }
                mainControl
              />,
            ]}
          />,
          <FinancesNavbarDefaultCard key="finance-single-bank-account-card">
            <SelectBankAccount />
          </FinancesNavbarDefaultCard>,
          <FinancesNavbarNavList
            key="finance-single-navbar-list"
            navbarItems={navbarItems}
          />,
          <FinancesNavbarDefaultCard key="finance-single-default-card">
            <Stack>
              <Text>{getLocalizedText("Dieser Monat", "This Month")}: </Text>
              <Group justify="space-between">
                <Text c="red">
                  {formatMoney(statistics.expenses[0], "EUR")}
                </Text>
                <Text c="green">
                  {formatMoney(statistics.income[0], "EUR")}
                </Text>
              </Group>
              <Text>{getLocalizedText("Letzter Monat", "Last Month")}: </Text>
              <Group justify="space-between">
                <Text c="red">
                  {formatMoney(statistics.expenses[1], "EUR")}
                </Text>
                <Text c="green">
                  {formatMoney(statistics.income[1], "EUR")}
                </Text>
              </Group>
            </Stack>
          </FinancesNavbarDefaultCard>,
        ]}
      />
      <ScrollArea mb="md" w="100%" h={`calc(100vh - 100px)`}>
        <Collapse
          transitionDuration={400}
          in={bulkSelectionActive && filteredSingleCashFlows.length > 0}
          w="100%"
        >
          <Card
            p="md"
            mb="md"
            withBorder
            shadow="sm"
            radius="md"
            style={{
              borderColor:
                "light-dark(var(--mantine-color-blue-3), var(--mantine-color-blue-8))",
            }}
          >
            <Group justify="space-between" align="center">
              <Group onClick={toggleAllCashFlows} style={{ cursor: "pointer" }}>
                <SelectActionIcon
                  onClick={() => {}}
                  selected={
                    selectedCashFlows.length === filteredSingleCashFlows.length
                  }
                  partiallySelected={
                    selectedCashFlows.length > 0 &&
                    selectedCashFlows.length < filteredSingleCashFlows.length
                  }
                />
                <Text fz="sm" c="dimmed">
                  {getLocalizedText("Alle auswählen", "Select All")}
                </Text>
              </Group>

              <Badge color="blue" variant="light">
                {selectedCashFlows.length}{" "}
                {getLocalizedText("ausgewählt", "selected")}
              </Badge>

              <Group gap="xs">
                <DeleteActionIcon
                  disabled={selectedCashFlows.length === 0}
                  onClick={handleDeleteCashFlows}
                />
              </Group>
            </Group>
          </Card>
        </Collapse>
        <Stack gap={0}>
          {isSingleCashFlowsLoading ? (
            <Stack ml="xl" mt="lg">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton height={45} w="100%" key={i} />
              ))}
            </Stack>
          ) : (
            filteredSingleCashFlows.map((cashFlow, index) => {
              const isNewDate =
                index === 0 ||
                new Date(filteredSingleCashFlows[index - 1].date).setHours(
                  0,
                  0,
                  0,
                  0
                ) !== new Date(cashFlow.date).setHours(0, 0, 0, 0);
              return (
                <Stack key={cashFlow.id} gap={5}>
                  {isNewDate && (
                    <Divider
                      mt={5}
                      label={
                        <Badge variant="light">
                          {formatDate(new Date(cashFlow.date))}
                        </Badge>
                      }
                      labelPosition="left"
                    />
                  )}
                  <SingleCashflowRow
                    cashflow={cashFlow}
                    ml="xl"
                    onEdit={() => {
                      setSelectedCashFlow(cashFlow);
                      openEditCashFlow();
                    }}
                    selectedModeActive={bulkSelectionActive}
                    isSelected={selectedCashFlows.includes(cashFlow.id)}
                    onToggleSelected={(e) =>
                      toggleCashFlowSelection(cashFlow.id, index, e.shiftKey)
                    }
                  />
                </Stack>
              );
            })
          )}
        </Stack>
      </ScrollArea>
      {selectedCashFlow && (
        <EditCashFlowDrawer
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )}
      <CashFlowModal
        opened={cashFlowModalOpened}
        onClose={closeCashFlowModal}
        isSingle={true}
      />
    </Group>
  );
}
