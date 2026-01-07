import { useState } from "react";
import { useDisclosure, useHover } from "@mantine/hooks";
import { useIntl } from "@/hooks/useIntl";
import { useContacts } from "@/db/collections/finance/contacts/use-contact-query";

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

interface EmptyContactBadgeProps {
  showAddContact: boolean;
  onPopoverOpen: () => void;
  onPopoverClose: (client: Tables<"contact"> | null) => void;
}

export default function EmptyContactBadge({
  showAddContact,
  onPopoverOpen,
  onPopoverClose,
}: EmptyContactBadgeProps) {
  const { getLocalizedText } = useIntl();
  const { hovered, ref } = useHover();
  const [
    isContactPopoverOpen,
    { open: openContactPopover, close: closeContactPopover },
  ] = useDisclosure(false);
  const [
    isContactFormOpen,
    { open: openContactForm, close: closeContactForm },
  ] = useDisclosure(false);
  const [selectedContact, setSelectedContact] =
    useState<Tables<"contact"> | null>(null);
  const { data: contacts } = useContacts();

  const handlePopoverClose = () => {
    closeContactForm();
    closeContactPopover();
    onPopoverClose(null);
  };

  const handlePopoverOpen = () => {
    openContactPopover();
    onPopoverOpen();
  };

  return (
    <Popover
      onDismiss={handlePopoverClose}
      opened={isContactPopoverOpen}
      onClose={handlePopoverClose}
    >
      <Popover.Target>
        <Transition
          mounted={showAddContact}
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
              value={selectedContact?.id}
              onChange={(value) => {
                setSelectedContact(
                  contacts.find((c) => c.id === value) || null
                );
              }}
            />
            <Button
              size="compact-sm"
              variant="subtle"
              leftSection={<IconPlus />}
              onClick={openContactForm}
            >
              {getLocalizedText("Kontakt", "Contact")}
            </Button>
          </Group>
          <Collapse in={isContactFormOpen}>
            <ContactForm
              onClose={closeContactForm}
              onSuccess={(contact) => setSelectedContact(contact)}
            />
          </Collapse>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
