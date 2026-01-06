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
import { BankAccount } from "@/types/finance.types";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import React from "react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import BankAccountForm from "@/components/Finances/BankAccount/BankAccountForm";
import { IconPencil } from "@tabler/icons-react";

interface FinanceBankAccountRowProps {
  bankAccount: BankAccount;
  selectedModeActive: boolean;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (ids: string[]) => void;
}

export default function FinanceBankAccountRow({
  bankAccount,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  onDelete,
}: FinanceBankAccountRowProps) {
  const { hovered, ref } = useHover();
  const { getLocalizedText, getCurrencySymbol } = useIntl();
  const [
    isBankAccountFormOpen,
    { open: openBankAccountForm, close: closeBankAccountForm },
  ] = useDisclosure(false);

  return (
    <Card
      bg={
        isSelected
          ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-8))"
          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-9))"
      }
      withBorder
      key={bankAccount.id}
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
                  tooltipLabel={getLocalizedText(
                    "Konto auswählen",
                    "Select account"
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
              {bankAccount.title}
            </Text>
            <Group gap="xs">
              {bankAccount.description && (
                <Text fz="xs" c="dimmed">
                  {bankAccount.description}
                </Text>
              )}
              <Text fz="xs" c="dimmed">
                {getCurrencySymbol(bankAccount.currency)} {bankAccount.saldo}
              </Text>
            </Group>
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
              <PencilActionIcon onClick={openBankAccountForm} />

              <DeleteActionIcon onClick={() => onDelete([bankAccount.id])} />
            </Group>
          )}
        </Transition>
      </Group>
      <Modal
        opened={isBankAccountFormOpen}
        onClose={closeBankAccountForm}
        title={
          <Group>
            <IconPencil />
            <Text>{getLocalizedText("Konto bearbeiten", "Edit account")}</Text>
          </Group>
        }
        centered
      >
        <BankAccountForm
          onClose={closeBankAccountForm}
          bankAccount={bankAccount}
        />
      </Modal>
    </Card>
  );
}
