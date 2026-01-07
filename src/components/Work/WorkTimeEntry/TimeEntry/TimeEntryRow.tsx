import { useIntl } from "@/hooks/useIntl";
import { useDisclosure, useHover } from "@mantine/hooks";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";

import { Card, Group, Stack, Text, Box } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import EditTimeEntryDrawer from "@/components/Work/WorkTimeEntry/EditTimeEntryDrawer";

import type { Tables } from "@/types/db.types";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";

import classes from "./TimeEntryRow.module.css";
import { WorkProject } from "@/types/work.types";

interface TimeEntryRowProps {
  timeEntry: Tables<"work_time_entry"> & { index: number };
  project?: WorkProject;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLDivElement>) => void;
  isOverview?: boolean;
  selectedModeActive: boolean;
}

export default function TimeEntryRow({
  timeEntry,
  project,
  isSelected,
  onToggleSelected,
  isOverview = false,
  selectedModeActive,
}: TimeEntryRowProps) {
  const { getLocalizedText, formatTimeSpan, formatDuration, formatMoney } =
    useIntl();
  const [editDrawerOpened, editDrawerHandler] = useDisclosure(false);

  const { hovered, ref } = useHover();

  const { index: _index, ...cleanedTimeEntry } = timeEntry;

  async function handleDelete() {
    showDeleteConfirmationModal(
      getLocalizedText("Zeit-Eintrag löschen", "Delete Time Entry"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie diesen Zeit-Eintrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        "Are you sure you want to delete this time entry? This action cannot be undone."
      ),
      async () => {
        workTimeEntriesCollection.delete(timeEntry.id);
      }
    );
  }

  const earnings = Number(
    ((timeEntry.active_seconds * timeEntry.salary) / 3600).toFixed(2)
  );

  // Determine if time entry should be considered paid
  const isTimeEntryPaid = () => {
    if (!project) return timeEntry.single_cashflow_id;
    // For hourly payment projects, check if time entry is paid
    if (project.hourly_payment) {
      return timeEntry.single_cashflow_id;
    }

    // For non-hourly payment projects, check if project is fully paid
    if (project.salary !== 0) {
      return project.total_payout >= project.salary;
    }
    return false;
  };

  const timeEntryPaid = isTimeEntryPaid();

  // Only show checkbox for hourly payment projects and unpaid time entries
  const showCheckbox = selectedModeActive && onToggleSelected && !timeEntryPaid;

  return (
    <Box>
      <Card
        ref={ref}
        className={classes.card}
        mod={{
          selected: isSelected,
          paid: timeEntryPaid,
          selectable: showCheckbox,
        }}
        withBorder
        onClick={showCheckbox ? (e) => onToggleSelected?.(e) : undefined}
      >
        <Group justify="space-between">
          <Group gap="xl">
            <Box className={classes.checkboxContainer}>
              <SelectActionIcon
                className={classes.checkboxIcon}
                mod={{ visible: showCheckbox }}
                onClick={() => {}}
                selected={isSelected}
              />
            </Box>
            <Stack
              gap="xs"
              className={classes.contentStack}
              mod={{ withcheckbox: showCheckbox }}
            >
              <Group>
                <IconClock size={14} color="gray" />
                <Text>
                  {formatTimeSpan(
                    new Date(timeEntry.start_time),
                    new Date(timeEntry.end_time)
                  )}
                </Text>
                {timeEntryPaid && (
                  <Text size="xs" c="green" fw={500}>
                    {getLocalizedText("✓ Bezahlt", "✓ Paid")}
                  </Text>
                )}
              </Group>
              {timeEntry.memo && (
                <Text size="sm" c="dimmed" maw={225}>
                  {timeEntry.memo}
                </Text>
              )}
              <Group>
                <Text size="sm" c="teal">
                  {getLocalizedText("Aktiv", "Active")}:{" "}
                  {formatDuration(timeEntry.active_seconds)}
                </Text>
              </Group>
            </Stack>
            <Group
              className={classes.actionIconsGroup}
              mod={{
                visible: hovered && !timeEntryPaid && !selectedModeActive,
              }}
            >
              <PencilActionIcon
                onClick={() => editDrawerHandler.open()}
                tooltipLabel={getLocalizedText(
                  "Zeit-Eintrag bearbeiten",
                  "Edit time entry"
                )}
              />
              <DeleteActionIcon
                onClick={() => handleDelete()}
                tooltipLabel={getLocalizedText(
                  "Zeit-Eintrag löschen",
                  "Delete time entry"
                )}
              />
            </Group>
          </Group>
          <Group>
            {isOverview && project && (
              <Text size="sm" c="dimmed">
                {project.title}
              </Text>
            )}
            <Text className={classes.salaryText} mod={{ paid: timeEntryPaid }}>
              {timeEntry.hourly_payment
                ? formatMoney(earnings, timeEntry.currency)
                : ""}
            </Text>
          </Group>
        </Group>
      </Card>
      {project && (
        <EditTimeEntryDrawer
          timeEntry={cleanedTimeEntry}
          project={project}
          opened={editDrawerOpened}
          onClose={() => editDrawerHandler.close()}
        />
      )}
    </Box>
  );
}
