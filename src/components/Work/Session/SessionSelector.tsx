"use client";

import { useDisclosure } from "@mantine/hooks";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { useIntl } from "@/hooks/useIntl";

import { Group, Text, Divider, Stack, Button, Collapse } from "@mantine/core";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { Tables } from "@/types/db.types";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import { IconCashBanknotePlus, IconPencil } from "@tabler/icons-react";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";

interface SessionSelectorProps {
  selectedSessions: string[];
  timeFilteredSessions: Tables<"timer_session">[];
  toggleAllSessions: () => void;
  handleSessionPayoutClick: (sessions: Tables<"timer_session">[]) => void;
}

export default function SessionSelector({
  selectedSessions,
  timeFilteredSessions,
  toggleAllSessions,
  handleSessionPayoutClick,
}: SessionSelectorProps) {
  const { getLocalizedText } = useIntl();
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);

  const handleDelete = () => {
    showDeleteConfirmationModal(
      getLocalizedText("Auswahl löschen", "Delete Selection"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie diese Auswahl löschen möchten?",
        "Are you sure you want to delete this selection?"
      ),
      async () => {
        workTimeEntriesCollection.delete(selectedSessions);
      }
    );
  };

  const handleEdit = () => {
    openEditModal();
    setTimeout(() => {
      closeEditModal();
    }, 3000);
  };

  return (
    <Stack align="flex-end">
      <Group justify="flex-end" pb="xs">
        <Group
          onClick={toggleAllSessions}
          style={{
            cursor: "pointer",
          }}
        >
          <SelectActionIcon
            onClick={() => {}}
            selected={
              selectedSessions.length ===
              timeFilteredSessions.filter(
                (session) => !session.single_cash_flow_id
              ).length
            }
            partiallySelected={
              selectedSessions.length > 0 &&
              selectedSessions.length <
                timeFilteredSessions.filter(
                  (session) => !session.single_cash_flow_id
                ).length
            }
          />

          <Text fz="sm" c="dimmed">
            {getLocalizedText("Alle", "All")}
          </Text>
        </Group>
        <Divider orientation="vertical" />
        <Text size="xs" c="dimmed">
          {selectedSessions.length} /{" "}
          {
            timeFilteredSessions.filter(
              (session) => !session.single_cash_flow_id
            ).length
          }{" "}
          {getLocalizedText("Sitzungen", "Sessions")}
        </Text>
      </Group>
      <Collapse in={selectedSessions.length > 0}>
        <Stack mb="xs">
          <Button
            onClick={() =>
              handleSessionPayoutClick(
                timeFilteredSessions.filter((session) =>
                  selectedSessions.includes(session.id)
                )
              )
            }
            leftSection={<IconCashBanknotePlus />}
            color="violet"
          >
            {getLocalizedText("Auswahl auszahlen", "Pay Selection")}
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
            leftSection={<IconPencil />}
          >
            {getLocalizedText("Auswahl bearbeiten", "Edit Selection")}
          </Button>
          <Collapse in={editModalOpened}>
            <Text>
              {getLocalizedText("Kommt bald...", "Coming soon...")}
            </Text>
          </Collapse>
          <DeleteButton
            onClick={handleDelete}
            label={getLocalizedText("Auswahl löschen", "Delete Selection")}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}
