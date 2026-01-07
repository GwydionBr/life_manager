import { useIntl } from "@/hooks/useIntl";

import {
  Accordion,
  AccordionControlProps,
  Box,
  Group,
  Text,
  Transition,
} from "@mantine/core";
import { EarningsBreakdown } from "@/types/workTimeEntry.types";
import {
  areEarningsBreakdownEmpty,
  formatTime,
} from "@/lib/timeEntryHelperFunctions";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

interface CustomAccordionControlProps extends AccordionControlProps {
  icon?: React.ReactNode;
  label: string;
  earnings: EarningsBreakdown;
  time: number;
  selectedTimeEntryIds: string[];
  timeEntryIds: string[];
  selectionModeActive: boolean;
  selectableIdSet: Set<string>;
  onGroupToggle: (timeEntryIds: string[]) => void;
}

export default function CustomAccordionControl({
  icon,
  label,
  earnings,
  time,
  selectedTimeEntryIds,
  timeEntryIds,
  selectionModeActive,
  selectableIdSet,
  onGroupToggle,
  ...props
}: CustomAccordionControlProps) {
  const { getLocalizedText, formatMoney } = useIntl();
  const groupSelectableIds = timeEntryIds.filter((id) =>
    selectableIdSet.has(id)
  );
  const selectedCount = groupSelectableIds.filter((id) =>
    selectedTimeEntryIds.includes(id)
  ).length;
  const allSelected =
    groupSelectableIds.length > 0 &&
    selectedCount === groupSelectableIds.length;
  const partiallySelected =
    selectedCount > 0 && selectedCount < groupSelectableIds.length;

  const renderEarnings = (earnings: EarningsBreakdown) => (
    <Group gap="xs">
      {!areEarningsBreakdownEmpty(earnings) && (
        <Group gap="xs">
          {earnings.unpaid.some((e) => e.amount > 0) && (
            <Text size="sm" c="red">
              {earnings.unpaid
                .map((e) => formatMoney(e.amount, e.currency))
                .join(" ") + " "}
              {getLocalizedText("unbezahlt", "unpaid")}
            </Text>
          )}
          {earnings.paid.some((e) => e.amount > 0) && (
            <Text size="sm" c="dimmed">
              {earnings.paid
                .map((e) => formatMoney(e.amount, e.currency))
                .join(" ") + " "}
              {getLocalizedText("bezahlt", "paid")}
            </Text>
          )}
        </Group>
      )}
    </Group>
  );

  return (
    <Group wrap="nowrap">
      <Box w={0} ml={selectionModeActive ? 10 : 0}>
        <Transition
          mounted={selectionModeActive}
          transition="fade-right"
          duration={200}
        >
          {(styles) => (
            <SelectActionIcon
              onClick={(e) => {
                e.stopPropagation();
                onGroupToggle(groupSelectableIds);
              }}
              iconSize={24}
              tooltipLabel={getLocalizedText(
                "Zeit-Einträge auswählen",
                "Select time entries"
              )}
              selected={allSelected}
              partiallySelected={partiallySelected}
              style={styles}
            />
          )}
        </Transition>
      </Box>

      <Accordion.Control
        icon={icon ?? undefined}
        {...props}
        ml={selectionModeActive ? 20 : 0}
        style={{ transition: "margin 0.2s ease" }}
      >
        <Group>
          <Text>{label}</Text>
          {!areEarningsBreakdownEmpty(earnings) && renderEarnings(earnings)}
          {time > 0 && (
            <Text
              size="sm"
              c="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))"
            >
              {formatTime(time)}
            </Text>
          )}
        </Group>
      </Accordion.Control>
    </Group>
  );
}
