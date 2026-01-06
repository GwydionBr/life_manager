import { useState } from "react";
import { useHover, useDisclosure } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useSingleCashflowMutations } from "@/db/collections/finance/single-cashflow/use-single-cashflow-mutations";

import {
  Card,
  CardProps,
  Grid,
  Text,
  Group,
  Box,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import FinanceTagBadges from "@/components/Finances/Tag/TagBadges";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

import { SingleCashFlow } from "@/types/finance.types";
import { Tables } from "@/types/db.types";
import {
  IconDeviceDesktopDollar,
  IconReceipt2,
  IconRepeat,
} from "@tabler/icons-react";

import classes from "./SingleCashflowRow.module.css";

interface SingleCashflowRowProps extends CardProps {
  cashflow: SingleCashFlow;
  onEdit: () => void;
  selectedModeActive: boolean;
  isSelected: boolean;
  onToggleSelected: (
    e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>
  ) => void;
}

export default function SingleCashflowRow({
  cashflow,
  onEdit,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  ...props
}: SingleCashflowRowProps) {
  const { formatMoney } = useIntl();
  // const {
  //   mutate: updateSingleCashFlowMutation,
  //   isPending: isUpdatingSingleCashFlow,
  // } = useUpdateSingleCashflowMutation({ showNotification: false });
  const { updateSingleCashflow } = useSingleCashflowMutations();
  const { hovered, ref } = useHover();
  const [
    isTagPopoverOpen,
    { open: openTagPopover, close: closeTagPopover },
  ] = useDisclosure(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTagClose = async (
    updatedTags: Tables<"tag">[] | null
  ) => {
    if (isUpdating) return;
    setIsUpdating(true);
    closeTagPopover();
    if (updatedTags) {
      await updateSingleCashflow(cashflow.id, {
        ...cashflow,
        tags: updatedTags,
      });
    }
    setTimeout(() => setIsUpdating(false), 500);
  };

  return (
    <Card
      className={classes.card}
      mod={{
        hovered: hovered,
        selected: isSelected,
      }}
      withBorder
      onClick={(e) => {
        if (!isTagPopoverOpen) {
          if (selectedModeActive) {
            onToggleSelected(e);
          } else {
            onEdit();
          }
        }
      }}
      {...props}
      ref={ref}
    >
      <Box className={classes.checkboxContainer}>
        <SelectActionIcon
          className={classes.checkboxIcon}
          mod={{ visible: selectedModeActive }}
          onClick={(e) => {
            onToggleSelected(e);
          }}
          selected={isSelected}
        />
      </Box>
      <Grid
        className={classes.grid}
        mod={{ selectedmodeactive: selectedModeActive }}
      >
        <Grid.Col span={2}>
          <Group>
            <Text fw={700} c={cashflow.amount < 0 ? "red" : "green"}>
              {formatMoney(cashflow.amount, cashflow.currency)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group>
            <Text>{cashflow.title}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={3}>
          <Stack>
            <FinanceTagBadges
              initialTags={cashflow.tags}
              onPopoverOpen={openTagPopover}
              onPopoverClose={handleTagClose}
              showAddTag={hovered}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={1}>
          <Group justify="flex-end">
            {cashflow.recurring_cashflow_id && (
              <ThemeIcon
                variant="transparent"
                color={cashflow.amount < 0 ? "red" : "green"}
              >
                <IconRepeat size={20} />
              </ThemeIcon>
            )}
            {cashflow.payout_id && (
              <ThemeIcon variant="transparent" color="blue">
                <IconReceipt2 size={20} />
              </ThemeIcon>
            )}
            {cashflow.finance_project_id && (
              <ThemeIcon variant="transparent" color="gray">
                <IconDeviceDesktopDollar size={20} />
              </ThemeIcon>
            )}
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
