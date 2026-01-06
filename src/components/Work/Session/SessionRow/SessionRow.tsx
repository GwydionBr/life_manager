import { useIntl } from "@/hooks/useIntl";
import { useDisclosure, useHover } from "@mantine/hooks";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";

import { Card, Group, Stack, Text, Box } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import EditSessionDrawer from "@/components/Work/Session/EditSessionDrawer";

import type { Tables } from "@/types/db.types";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { showDeleteConfirmationModal } from "@/lib/notificationFunctions";

import classes from "./SessionRow.module.css";
import { WorkProject } from "@/types/work.types";

interface SessionRowProps {
  session: Tables<"work_time_entry"> & { index: number };
  project?: WorkProject;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLDivElement>) => void;
  isOverview?: boolean;
  selectedModeActive: boolean;
}

export default function SessionRow({
  session,
  project,
  isSelected,
  onToggleSelected,
  isOverview = false,
  selectedModeActive,
}: SessionRowProps) {
  const { getLocalizedText, formatTimeSpan, formatDuration, formatMoney } =
    useIntl();
  const [editDrawerOpened, editDrawerHandler] = useDisclosure(false);

  const { hovered, ref } = useHover();

  const { index, ...cleanedSession } = session;

  async function handleDelete() {
    showDeleteConfirmationModal(
      getLocalizedText("Sitzung löschen", "Delete Session"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie diese Sitzung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        "Are you sure you want to delete this session? This action cannot be undone."
      ),
      async () => {
        workTimeEntriesCollection.delete(session.id);
      }
    );
  }

  const earnings = Number(
    ((session.active_seconds * session.salary) / 3600).toFixed(2)
  );

  // Determine if session should be considered paid
  const isSessionPaid = () => {
    if (!project) return session.single_cashflow_id;
    // For hourly payment projects, check if session is paid
    if (project.hourly_payment) {
      return session.single_cashflow_id;
    }

    // For non-hourly payment projects, check if project is fully paid
    if (project.salary !== 0) {
      return project.total_payout >= project.salary;
    }
    return false;
  };

  const sessionPaid = isSessionPaid();

  // Only show checkbox for hourly payment projects and unpaid sessions
  const showCheckbox = selectedModeActive && onToggleSelected && !sessionPaid;

  return (
    <Box>
      <Card
        ref={ref}
        className={classes.card}
        mod={{
          selected: isSelected,
          paid: sessionPaid,
          selectable: showCheckbox,
        }}
        withBorder
        onClick={
          showCheckbox
            ? (e) =>
                onToggleSelected?.(e)
            : undefined
        }
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
                    new Date(session.start_time),
                    new Date(session.end_time)
                  )}
                </Text>
                {sessionPaid && (
                  <Text size="xs" c="green" fw={500}>
                    {getLocalizedText("✓ Bezahlt", "✓ Paid")}
                  </Text>
                )}
              </Group>
              {session.memo && (
                <Text size="sm" c="dimmed" maw={225}>
                  {session.memo}
                </Text>
              )}
              <Group>
                <Text size="sm" c="teal">
                  {getLocalizedText("Aktiv", "Active")}:{" "}
                  {formatDuration(session.active_seconds)}
                </Text>
              </Group>
            </Stack>
            <Group
              className={classes.actionIconsGroup}
              mod={{ visible: hovered && !sessionPaid && !selectedModeActive }}
            >
              <PencilActionIcon
                onClick={() => editDrawerHandler.open()}
                tooltipLabel={getLocalizedText(
                  "Sitzung bearbeiten",
                  "Edit session"
                )}
              />
              <DeleteActionIcon
                onClick={() => handleDelete()}
                tooltipLabel={getLocalizedText(
                  "Sitzung löschen",
                  "Delete session"
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
            <Text className={classes.salaryText} mod={{ paid: sessionPaid }}>
              {session.hourly_payment
                ? formatMoney(earnings, session.currency)
                : ""}
            </Text>
          </Group>
        </Group>
      </Card>
      {project && (
        <EditSessionDrawer
          timerSession={cleanedSession}
          project={project}
          opened={editDrawerOpened}
          onClose={() => editDrawerHandler.close()}
        />
      )}
    </Box>
  );
}
