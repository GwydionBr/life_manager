import { useState } from "react";
import { useDisclosure, useHover } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useContacts } from "@/db/collections/finance/contacts/contact-collection";

import {
  Badge,
  Group,
  Collapse,
  Popover,
  Stack,
  Button,
  Select,
  Transition,
} from "@mantine/core";
import { IconPlus, IconUserPlus } from "@tabler/icons-react";
import ContactForm from "@/components/Finances/Contact/ContactForm";
import { Tables } from "@/types/db.types";

interface EmptyFinanceClientBadgeProps {
  showAddClient: boolean;
  onPopoverOpen: () => void;
  onPopoverClose: (client: Tables<"finance_client"> | null) => void;
}

export default function EmptyFinanceClientBadge({
  showAddClient,
  onPopoverOpen,
  onPopoverClose,
}: EmptyFinanceClientBadgeProps) {
  const { getLocalizedText } = useIntl();
  const { hovered, ref } = useHover();
  const [
    isClientPopoverOpen,
    { open: openClientPopover, close: closeClientPopover },
  ] = useDisclosure(false);
  const [isClientFormOpen, { open: openClientForm, close: closeClientForm }] =
    useDisclosure(false);
  const [selectedClient, setSelectedClient] =
    useState<Tables<"finance_client"> | null>(null);
  const { data: contacts  } = useContacts();

  const handlePopoverClose = () => {
    closeClientForm();
    closeClientPopover();
    onPopoverClose(null);
  };

  const handlePopoverOpen = () => {
    openClientPopover();
    onPopoverOpen();
  };

  return (
    <Popover
      onDismiss={handlePopoverClose}
      opened={isClientPopoverOpen}
      onClose={handlePopoverClose}
    >
      <Popover.Target>
        <Transition
          mounted={showAddClient}
          transition="fade-left"
          duration={200}
        >
          {(styles) => (
            <Badge
              ref={ref}
              onClick={(e) => {
                e.stopPropagation();
                handlePopoverOpen();
              }}
              leftSection={<IconUserPlus size={12} />}
              color="blue"
              variant="light"
              style={{
                cursor: "pointer",
                border: hovered
                  ? "1px solid var(--mantine-color-blue-5)"
                  : "1px solid transparent",
                ...styles,
              }}
            />
          )}
        </Transition>
      </Popover.Target>
      <Popover.Dropdown
        style={{
          border:
            "1px solid light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-2))",
        }}
      >
        <Stack>
          <Group>
            <Select
              data={contacts.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
              // comboboxProps={{ withinPortal: false }}
              value={selectedClient?.id}
              onChange={(value) => {
                setSelectedClient(
                  contacts.find((c) => c.id === value) || null
                );
              }}
            />
            <Button
              size="compact-sm"
              variant="subtle"
              leftSection={<IconPlus />}
              onClick={openClientForm}
            >
              {getLocalizedText("Kunde", "Client")}
            </Button>
          </Group>
          <Collapse in={isClientFormOpen}>
            <ContactForm
              onClose={closeClientForm}
              onSuccess={(client) => setSelectedClient(client)}
            />
          </Collapse>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
