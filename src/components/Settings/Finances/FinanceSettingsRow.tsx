import { useHover, useDisclosure } from "@mantine/hooks";

import {
  Card,
  Group,
  Modal,
  Box,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import React from "react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import { IconPencil } from "@tabler/icons-react";

interface FinanceSettingsRowProps<T> {
  item: T;
  itemId: string;
  selectedModeActive: boolean;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (ids: string[]) => void;
  renderContent: (item: T) => React.ReactNode;
  renderEditForm?: (item: T, onClose: () => void) => React.ReactNode;
  selectTooltip: string;
  editText: string;
}

export default function FinanceSettingsRow<T>({
  item,
  itemId,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  onDelete,
  renderContent,
  renderEditForm,
  selectTooltip,
  editText,
}: FinanceSettingsRowProps<T>) {
  const { hovered, ref } = useHover();
  const [isEditFormOpen, { open: openEditForm, close: closeEditForm }] =
    useDisclosure(false);

  return (
    <Card
      bg={
        isSelected
          ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-8))"
          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-9))"
      }
      withBorder
      key={itemId}
      radius="md"
      p="md"
      shadow="md"
      w="100%"
      ref={ref}
      style={{ cursor: selectedModeActive ? "pointer" : "default" }}
      onClick={
        selectedModeActive
          ? (e) =>
              onToggleSelected?.(e)
          : undefined
      }
    >
      <Group justify="space-between" w="100%">
        <Group justify="flex-start" wrap="nowrap">
          <Box w={0}>
            <Transition
              mounted={selectedModeActive}
              transition="fade-right"
              duration={200}
            >
              {(styles) => (
                <SelectActionIcon
                  onClick={() => {}}
                  tooltipLabel={selectTooltip}
                  selected={isSelected}
                  style={styles}
                />
              )}
            </Transition>
          </Box>
          <Stack
            gap="xs"
            w="100%"
            ml={selectedModeActive ? 40 : 0}
            style={{ transition: "margin 0.2s ease" }}
          >
            {renderContent(item)}
          </Stack>
        </Group>
        <Transition
          mounted={!selectedModeActive && hovered}
          transition="fade-left"
          duration={200}
          enterDelay={100}
          exitDelay={100}
        >
          {(styles) => (
            <Group style={styles}>
              {renderEditForm && <PencilActionIcon onClick={openEditForm} />}
              <DeleteActionIcon onClick={() => onDelete([itemId])} />
            </Group>
          )}
        </Transition>
      </Group>
      {renderEditForm && (
        <Modal
          opened={isEditFormOpen}
          onClose={closeEditForm}
          title={
            <Group>
              <IconPencil />
              <Text>{editText}</Text>
            </Group>
          }
          centered
        >
          {renderEditForm(item, closeEditForm)}
        </Modal>
      )}
    </Card>
  );
}
