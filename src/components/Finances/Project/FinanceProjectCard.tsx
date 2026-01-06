import { useMemo, useState } from "react";
import {
  useDisclosure,
  useClickOutside,
  useHover,
  mergeRefs,
} from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useFinanceProjectMutations } from "@/db/collections/finance/finance-project/use-finance-project-mutations";
import { usePayoutMutations } from "@/db/collections/finance/payout/use-payout-mutations";
// import {
//   usePayoutFinanceProjectMutation,
//   usePayoutFinanceAdjustmentMutation,
// } from "@/utils/queries/finances/use-payout";

import {
  Card,
  CardProps,
  Collapse,
  Group,
  Stack,
  Text,
  Box,
  Transition,
  Divider,
  ThemeIcon,
  Menu,
  Grid,
  Popover,
} from "@mantine/core";

import { FinanceProject } from "@/types/finance.types";
import FinanceAdjustmentForm from "./FinanceAdjustment/FinanceAdjustmentForm";
import FinanceAdjustmentRow from "./FinanceAdjustment/FinanceAdjustmentRow";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconEdit,
  IconTrash,
  IconCashBanknotePlus,
} from "@tabler/icons-react";
import MoreActionIcon from "@/components/UI/ActionIcons/MoreActionIcon";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import FinanceClientBadge from "@/components/Finances/Contact/ContactBadge";
import FinanceCategoryBadges from "@/components/Finances/Category/FinanceCategoryBadges";
import { Tables } from "@/types/db.types";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";

interface FinanceProjectCardProps extends CardProps {
  project: FinanceProject;
  selectedModeActive: boolean;
  isSelected: boolean;
  editProjectModalOpened: boolean;
  onToggleSelected: (
    e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>
  ) => void;
  onDelete: () => void;
  setEditProject: (project: FinanceProject) => void;
  onOpenEditProject: () => void;
}

export default function FinanceProjectCard({
  project,
  selectedModeActive,
  isSelected,
  editProjectModalOpened,
  onToggleSelected,
  onDelete,
  setEditProject,
  onOpenEditProject,
  ...props
}: FinanceProjectCardProps) {
  const { getLocalizedText, formatMoney } = useIntl();
  const [isUpdating, setIsUpdating] = useState(false);
  const { financeProjectAdjustmentPayout, financeProjectPayout } =
    usePayoutMutations();
  const { updateFinanceProject } = useFinanceProjectMutations();
  const [isEditing, { open: openEditing, close: closeEditing }] =
    useDisclosure(false);
  const { hovered, ref: hoverRef } = useHover();
  const [isMoreActionOpen, { open: openMoreAction, close: closeMoreAction }] =
    useDisclosure(false);
  const [
    isBadgePopoverOpen,
    { open: openBadgePopover, close: closeBadgePopover },
  ] = useDisclosure(false);
  const [
    isAdjustmentFormOpen,
    { open: openAdjustmentForm, close: closeAdjustmentForm },
  ] = useDisclosure(false);
  const [isDropdownOpen, { open: openDropdown, close: closeDropdown }] =
    useDisclosure(false);

  const ref = useClickOutside(() => {
    if (
      !isMoreActionOpen &&
      !isDropdownOpen &&
      !isAdjustmentFormOpen &&
      !editProjectModalOpened &&
      !isBadgePopoverOpen
    ) {
      closeEditing();
    }
  });
  const mergedRef = mergeRefs(ref, hoverRef);
  const totalAmountOpen = useMemo(
    () =>
      project.adjustments.reduce(
        (acc, adjustment) =>
          acc + (adjustment.single_cash_flow_id ? 0 : adjustment.amount),
        project.single_cash_flow_id ? 0 : project.start_amount
      ),
    [project.adjustments, project.start_amount]
  );

  const handleAdjustmentClose = () => {
    if (!isDropdownOpen) {
      closeAdjustmentForm();
    }
  };

  const handleCategoryClose = (
    updatedCategories: Tables<"finance_category">[] | null
  ) => {
    if (isUpdating) return;
    setIsUpdating(true);
    closeBadgePopover();
    if (updatedCategories) {
      updateFinanceProject(project.id, {
        tags: updatedCategories,
        client: project.client,
        adjustments: project.adjustments,
      });
    }
    setTimeout(() => setIsUpdating(false), 500);
  };

  const hasAdjustments = project.adjustments.length > 0;

  const isPaidTotally = useMemo(() => {
    return (
      !!project.single_cash_flow_id &&
      project.adjustments.filter((a) => !a.single_cash_flow_id).length === 0
    );
  }, [project.single_cash_flow_id, project.adjustments]);

  const isPositive = totalAmountOpen > 0;
  const adjustmentTotal = project.adjustments.reduce(
    (acc, adj) => acc + adj.amount,
    0
  );

  const handlePayoutClick = ({
    adjustmentId,
    isStartValue,
  }: {
    adjustmentId?: string;
    isStartValue?: boolean;
  }) => {
    if (adjustmentId) {
      const adjustment = project.adjustments.find(
        (adj) => adj.id === adjustmentId
      );
      if (adjustment) {
        financeProjectAdjustmentPayout(adjustment, project);
      }
    } else if (isStartValue) {
      financeProjectPayout(project, false);
    } else {
      financeProjectPayout(project, true);
    }
  };

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      w="100%"
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      shadow="sm"
      style={{
        opacity: isPaidTotally ? 0.5 : 1,
        cursor: isEditing ? "default" : "pointer",
        border: isSelected
          ? "2px solid var(--mantine-color-blue-5)"
          : hovered || isEditing
            ? "1px solid light-dark(var(--mantine-color-blue-5), var(--mantine-color-blue-8))"
            : "",
        transition: "all 0.2s ease",
      }}
      onClick={(e) => {
        if (selectedModeActive) {
          onToggleSelected(e);
        } else {
          if (!isBadgePopoverOpen) {
            openEditing();
          }
        }
      }}
      ref={mergedRef}
      {...props}
    >
      <Box pos="absolute" top="xs" right="xl">
        <Transition
          mounted={selectedModeActive}
          transition="fade-right"
          duration={200}
        >
          {(styles) => (
            <SelectActionIcon
              style={styles}
              onClick={(e) => {
                onToggleSelected(e);
              }}
              selected={isSelected}
            />
          )}
        </Transition>
      </Box>
      <Stack
        gap="md"
        ml={selectedModeActive ? 50 : 0}
        style={{ transition: "margin 0.2s ease" }}
      >
        {/* Header */}
        <Group justify="space-between" align="center" w="100%">
          <Group align="center" gap="xs" flex={2}>
            <Text fw={700} c={isPositive ? "green" : "red"}>
              {formatMoney(totalAmountOpen, project.currency)}
            </Text>
            <Text c="dimmed" size="sm">
              ({formatMoney(project.start_amount, project.currency)})
            </Text>
            <Text size="sm" fw={700}>
              {project.title}
            </Text>
            {project.description && (
              <Text size="sm" c="dimmed">
                {project.description}
              </Text>
            )}
          </Group>

          <Group gap="md" wrap="wrap" flex={2}>
            {project.client && <FinanceClientBadge client={project.client} />}
            <FinanceCategoryBadges
              initialCategories={project.tags}
              onPopoverOpen={openBadgePopover}
              onPopoverClose={handleCategoryClose}
              showAddCategory={hovered || isEditing}
            />
          </Group>

          {/* Right Side */}
          <Group flex={1} justify="space-between">
            {/* Adjustments */}
            <Group gap="xs" align="center">
              <Divider orientation="vertical" />
              {hasAdjustments ? (
                <Group gap="xs" align="center">
                  <ThemeIcon
                    size="sm"
                    color={adjustmentTotal > 0 ? "green" : "red"}
                    variant="light"
                  >
                    {adjustmentTotal > 0 ? (
                      <IconTrendingUp size={14} />
                    ) : (
                      <IconTrendingDown size={14} />
                    )}
                  </ThemeIcon>
                  <Text fw={600} c={adjustmentTotal > 0 ? "green" : "red"}>
                    {adjustmentTotal > 0 ? "+" : ""}
                    {formatMoney(adjustmentTotal, project.currency)}
                  </Text>
                </Group>
              ) : (
                <Transition
                  mounted={hovered}
                  transition="fade-left"
                  duration={200}
                >
                  {(styles) => (
                    <PayoutActionIcon
                      style={styles}
                      variant="subtle"
                      onClick={(e) => {
                        e?.stopPropagation();
                        handlePayoutClick({ isStartValue: true });
                      }}
                      tooltipLabel={getLocalizedText(
                        "Finanz Projekt auszahlen",
                        "Payout Finance Project"
                      )}
                    />
                  )}
                </Transition>
              )}
            </Group>
            {/* More Actions */}
            <Transition mounted={isEditing}>
              {(styles) => (
                <Menu
                  opened={isMoreActionOpen}
                  onClose={closeMoreAction}
                  position="bottom-end"
                >
                  <Menu.Target>
                    <MoreActionIcon onClick={openMoreAction} style={styles} />
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>
                      {getLocalizedText("Finanz Projekt", "Finance Project")}
                    </Menu.Label>
                    <Menu.Divider />
                    {/* <Menu.Item
                      leftSection={<IconLinkPlus size={16} />}
                      onClick={() => {}}
                    >
                      {getLocalizedText(
                        "Mit Arbeitsprojekt verknüpfen",
                        "Link with Work Project"
                      )}
                    </Menu.Item> */}
                    <Menu.Item
                      leftSection={
                        <IconCashBanknotePlus
                          size={16}
                          color={
                            isPaidTotally
                              ? "gray"
                              : "var(--mantine-color-violet-5)"
                          }
                        />
                      }
                      onClick={() => handlePayoutClick({})}
                      disabled={isPaidTotally}
                    >
                      <Text>
                        {getLocalizedText(
                          "Projekt Auszahlen",
                          "Payout Project"
                        )}
                      </Text>
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconEdit size={16} />}
                      onClick={() => {
                        setEditProject(project);
                        onOpenEditProject();
                      }}
                      disabled={isPaidTotally}
                    >
                      <Text>{getLocalizedText("Bearbeiten", "Edit")}</Text>
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={16} color="red" />}
                      onClick={onDelete}
                    >
                      <Text>{getLocalizedText("Löschen", "Delete")}</Text>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Transition>
          </Group>
        </Group>

        {/* Adjustment Form */}
        <Collapse in={isEditing}>
          <Stack>
            <Divider />
            {/* Adjustments List */}
            <Stack gap="xs">
              <Grid
                gutter="xs"
                mb={isAdjustmentFormOpen ? 110 : 0}
                style={{ transition: "margin 0.2s ease" }}
              >
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" fw={500} mb="xs">
                    {getLocalizedText("Anpassungen", "Adjustments")} (
                    {project.adjustments.length})
                  </Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group justify="center">
                    <Popover
                      trapFocus
                      returnFocus
                      opened={isAdjustmentFormOpen}
                      onDismiss={handleAdjustmentClose}
                      onClose={handleAdjustmentClose}
                      onOpen={openAdjustmentForm}
                    >
                      <Popover.Target>
                        <PlusActionIcon
                          variant={isAdjustmentFormOpen ? "light" : "subtle"}
                          onClick={openAdjustmentForm}
                          w="100%"
                        />
                      </Popover.Target>
                      <Popover.Dropdown p={0}>
                        <Card withBorder shadow="sm" radius="md">
                          <FinanceAdjustmentForm
                            onClose={handleAdjustmentClose}
                            projectId={project.id}
                            onDropdownOpen={openDropdown}
                            onDropdownClose={closeDropdown}
                          />
                        </Card>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}></Grid.Col>
              </Grid>
              {hasAdjustments && (
                <Stack gap={5}>
                  {project.adjustments
                    .sort((a, b) => b.created_at.localeCompare(a.created_at))
                    .map((adjustment) => (
                      <FinanceAdjustmentRow
                        key={adjustment.id}
                        adjustment={adjustment}
                        currency={project.currency}
                        adultClientId={project.finance_client_id}
                        handlePayout={handlePayoutClick}
                      />
                    ))}
                  <Divider />
                  <FinanceAdjustmentRow
                    key={project.id}
                    financeProject={project}
                    currency={project.currency}
                    adultClientId={project.finance_client_id}
                    handlePayout={handlePayoutClick}
                  />
                </Stack>
              )}
            </Stack>
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}
