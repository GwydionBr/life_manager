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
import ContactForm from "@/components/Finances/Contact/ContactForm";

interface ContactRowProps {
  contact: Tables<"contact">;
  selectedModeActive: boolean;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: (ids: string[]) => void;
}

export default function ContactRow({
  contact,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  onDelete,
}: ContactRowProps) {
  const { hovered, ref } = useHover();
  const { getLocalizedText, getCurrencySymbol } = useIntl();
  const [
    isContactFormOpen,
    { open: openContactForm, close: closeContactForm },
  ] = useDisclosure(false);

  return (
    <Card
      bg={
        isSelected
          ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-8))"
          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-9))"
      }
      withBorder
      key={contact.id}
      radius="md"
      p="md"
      shadow="md"
      w="100%"
      ref={ref}
      style={{ cursor: selectedModeActive ? "pointer" : "default" }}
      onClick={selectedModeActive ? (e) => onToggleSelected?.(e) : undefined}
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
                    "Kontakt auswählen",
                    "Select contact"
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
                {contact.name}
              </Text>
              {contact.currency && (
                <Text fz="xs" c="dimmed">
                  {getCurrencySymbol(contact.currency)}
                </Text>
              )}
            </Group>
            {contact.description && (
              <Text fz="xs" c="dimmed">
                {contact.description}
              </Text>
            )}
            {contact.email && (
              <Text fz="xs" c="dimmed">
                {contact.email}
              </Text>
            )}
            {contact.phone && (
              <Text fz="xs" c="dimmed">
                {contact.phone}
              </Text>
            )}
            {contact.address && (
              <Text fz="xs" c="dimmed">
                {contact.address}
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
              <PencilActionIcon onClick={openContactForm} />

              <DeleteActionIcon onClick={() => onDelete([contact.id])} />
            </Group>
          )}
        </Transition>
      </Group>
      <Modal
        opened={isContactFormOpen}
        onClose={closeContactForm}
        title={
          <Group>
            <IconPencil />
            <Text>
              {getLocalizedText("Kontakt bearbeiten", "Edit contact")}
            </Text>
          </Group>
        }
      >
        <ContactForm onClose={closeContactForm} contact={contact} />
      </Modal>
    </Card>
  );
}
