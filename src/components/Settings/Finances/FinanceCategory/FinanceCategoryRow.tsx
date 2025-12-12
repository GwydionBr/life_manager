"use client";

import { useHover, useDisclosure } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";

import {
  Card,
  Group,
  Modal,
  Box,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import { Tables } from "@/types/db.types";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import React from "react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";
import { IconPencil } from "@tabler/icons-react";

interface FinanceCategoryRowProps {
  category: Tables<"finance_category">;
  selectedModeActive: boolean;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (ids: string[]) => void;
}

export default function FinanceCategoryRow({
  category,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  onDelete,
}: FinanceCategoryRowProps) {
  const { hovered, ref } = useHover();
  const { getLocalizedText } = useIntl();
  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);

  return (
    <Card
      bg={
        isSelected
          ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-8))"
          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-9))"
      }
      withBorder
      key={category.id}
      radius="md"
      p="md"
      shadow="md"
      w="100%"
      ref={ref}
      style={{ cursor: selectedModeActive ? "pointer" : "default" }}
      onClick={
        selectedModeActive
          ? (e: React.MouseEvent<HTMLDivElement>) =>
              onToggleSelected?.(e as any)
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
                  tooltipLabel={getLocalizedText(
                    "Kategorie auswählen",
                    "Select category"
                  )}
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
            <Text fz="sm" fw={500}>
              {category.title}
            </Text>
            <Text fz="xs" c="dimmed">
              {category.description}
            </Text>
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
              <PencilActionIcon onClick={openCategoryForm} />

              <DeleteActionIcon onClick={() => onDelete([category.id])} />
            </Group>
          )}
        </Transition>
      </Group>
      <Modal
        opened={isCategoryFormOpen}
        onClose={closeCategoryForm}
        title={
          <Group>
            <IconPencil />
            <Text>
              {getLocalizedText("Kategorie bearbeiten", "Edit category")}
            </Text>
          </Group>
        }
        centered
      >
        <FinanceCategoryForm onClose={closeCategoryForm} category={category} />
      </Modal>
    </Card>
  );
}
