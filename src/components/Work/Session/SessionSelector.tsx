import { useDisclosure } from "@mantine/hooks";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { useIntl } from "@/hooks/useIntl";

import { Group, Text, Divider, Stack, Button, Collapse } from "@mantine/core";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { Tables } from "@/types/db.types";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import { IconCashBanknotePlus, IconPencil } from "@tabler/icons-react";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";

interface WorkTimeEntrySelectorProps {
  selectedTimeEntries: string[];
  timeFilteredTimeEntries: Tables<"work_time_entry">[];
  toggleAllTimeEntries: () => void;
  handleTimeEntryPayoutClick: (
    timeEntries: Tables<"work_time_entry">[]
  ) => void;
}

export default function WorkTimeEntrySelector({
  selectedTimeEntries,
  timeFilteredTimeEntries,
  toggleAllTimeEntries,
  handleTimeEntryPayoutClick,
}: WorkTimeEntrySelectorProps) {
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
        workTimeEntriesCollection.delete(selectedTimeEntries);
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
    <Stack>
      <Group justify="flex-end" pb="xs">
        <Group
          onClick={toggleAllTimeEntries}
          style={{
            cursor: "pointer",
          }}
        >
          <SelectActionIcon
            onClick={() => {}}
            selected={
              selectedTimeEntries.length ===
              timeFilteredTimeEntries.filter(
                (timeEntry) => !timeEntry.single_cashflow_id
              ).length
            }
            partiallySelected={
              selectedTimeEntries.length > 0 &&
              selectedTimeEntries.length <
                timeFilteredTimeEntries.filter(
                  (timeEntry) => !timeEntry.single_cashflow_id
                ).length
            }
          />

          <Text fz="sm" c="dimmed">
            {getLocalizedText("Alle", "All")}
          </Text>
        </Group>
        <Divider orientation="vertical" />
        <Text size="xs" c="dimmed">
          {selectedTimeEntries.length} /{" "}
          {
            timeFilteredTimeEntries.filter(
              (timeEntry) => !timeEntry.single_cashflow_id
            ).length
          }{" "}
          {getLocalizedText("Zeit-Einträge", "Time Entries")}
        </Text>
      </Group>
      <Divider />
      <Collapse in={selectedTimeEntries.length > 0}>
        <Stack mb="xs">
          <Button
            onClick={() =>
              handleTimeEntryPayoutClick(
                timeFilteredTimeEntries.filter((timeEntry) =>
                  selectedTimeEntries.includes(timeEntry.id)
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
            <Text>{getLocalizedText("Kommt bald...", "Coming soon...")}</Text>
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
