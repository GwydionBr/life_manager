import { useHover, useDisclosure } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";

import {
  Card,
  Group,
  Box,
  Stack,
  Text,
  Transition,
  Modal,
} from "@mantine/core";
import { Tables } from "@/types/db.types";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import React from "react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import { IconPencil } from "@tabler/icons-react";
import FinanceClientForm from "@/components/Finances/FinanceClient/FinanceClientForm";

interface FinanceClientRowProps {
  client: Tables<"finance_client">;
  selectedModeActive: boolean;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (ids: string[]) => void;
}

export default function FinanceClientRow({
  client,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  onDelete,
}: FinanceClientRowProps) {
  const { hovered, ref } = useHover();
  const { getLocalizedText, getCurrencySymbol } = useIntl();
  const [isClientFormOpen, { open: openClientForm, close: closeClientForm }] =
    useDisclosure(false);

  return (
    <Card
      bg={
        isSelected
          ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-8))"
          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-9))"
      }
      withBorder
      key={client.id}
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
                    "Kunde auswählen",
                    "Select client"
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
            <Group>
              <Text fz="sm" fw={500}>
                {client.name}
              </Text>
              {client.currency && (
                <Text fz="xs" c="dimmed">
                  {getCurrencySymbol(client.currency)}
                </Text>
              )}
            </Group>
            {client.description && (
              <Text fz="xs" c="dimmed">
                {client.description}
              </Text>
            )}
            {client.email && (
              <Text fz="xs" c="dimmed">
                {client.email}
              </Text>
            )}
            {client.phone && (
              <Text fz="xs" c="dimmed">
                {client.phone}
              </Text>
            )}
            {client.address && (
              <Text fz="xs" c="dimmed">
                {client.address}
              </Text>
            )}
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
              <PencilActionIcon onClick={openClientForm} />

              <DeleteActionIcon onClick={() => onDelete([client.id])} />
            </Group>
          )}
        </Transition>
      </Group>
      <Modal
        opened={isClientFormOpen}
        onClose={closeClientForm}
        title={
          <Group>
            <IconPencil />
            <Text>{getLocalizedText("Kunde bearbeiten", "Edit client")}</Text>
          </Group>
        }
      >
        <FinanceClientForm onClose={closeClientForm} client={client} />
      </Modal>
    </Card>
  );
}
