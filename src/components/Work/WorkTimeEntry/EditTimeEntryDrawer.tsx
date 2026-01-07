import { useEffect, useState } from "react";
import { workTimeEntriesCollection } from "@/db/collections/work/work-time-entry/work-time-entry-collection";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import { useIntl } from "@/hooks/useIntl";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntryMutations } from "@/db/collections/work/work-time-entry/use-work-time-entry-mutations";

import { Drawer, Flex, Group, Text, useDrawersStack, Box } from "@mantine/core";
import { IconExclamationMark } from "@tabler/icons-react";
import TimeEntryForm from "@/components/Work/WorkTimeEntry/TimeEntryForm";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import { WorkProject } from "@/types/work.types";

interface EditTimeEntryModalProps {
  timeEntry: Tables<"work_time_entry">;
  project: WorkProject;
  opened: boolean;
  onClose: () => void;
}

export default function EditTimeEntryDrawer({
  timeEntry,
  opened,
  onClose,
  project,
}: EditTimeEntryModalProps) {
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<WorkProject>(project);
  const { data: workProjects } = useWorkProjects();
  const { updateWorkTimeEntry } = useWorkTimeEntryMutations();

  const drawerStack = useDrawersStack([
    "edit-time-entry",
    "delete-time-entry",
    "add-project",
    "tag-form",
  ]);

  // Sync external opened state with internal drawer stack
  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-time-entry");
    } else {
      drawerStack.closeAll();
    }
  }, [opened]);

  function handleClose() {
    drawerStack.closeAll();
    onClose();
  }

  async function handleSubmit(values: {
    work_project_id?: string;
    start_time: string;
    end_time: string;
    active_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    const newTimeEntry: Tables<"work_time_entry"> = {
      ...timeEntry,
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      paused_seconds: 0,
      memo: values.memo || null,
    };

    const _roundingSettings: TimerRoundingSettings = {
      roundInTimeFragments:
        currentProject.round_in_time_fragments !== null
          ? currentProject.round_in_time_fragments
          : (settings?.round_in_time_sections ?? false),
      timeFragmentInterval:
        currentProject.time_fragment_interval ??
        settings?.time_section_interval ??
        10,
      roundingInterval:
        currentProject.rounding_interval ?? settings?.rounding_interval ?? 1,
      roundingDirection:
        currentProject.rounding_direction ??
        settings?.rounding_direction ??
        "up",
    };

    // updateWorkTimeEntryMutation({
    //   updateTimeEntry: newTimeEntry,
    //   roundingSettings,
    // });
    // TODO Handle Rounding ETC.
    updateWorkTimeEntry(timeEntry.id, newTimeEntry);
    handleClose();
  }

  function handleDelete() {
    workTimeEntriesCollection.delete(timeEntry.id);
  }

  return (
    <Box>
      <Drawer.Stack>
        <Drawer
          {...drawerStack.register("edit-time-entry")}
          onClose={handleClose}
          title={
            <Group>
              <DeleteActionIcon
                tooltipLabel={getLocalizedText(
                  "Zeit-Eintrag löschen",
                  "Delete Time Entry"
                )}
                onClick={() => {
                  drawerStack.open("delete-time-entry");
                }}
              />
              <Text>
                {getLocalizedText("Zeit-Eintrag bearbeiten", "Edit Time Entry")}
              </Text>
            </Group>
          }
          size="lg"
          padding="md"
        >
          <Flex direction="column" gap="xl">
            <TimeEntryForm
              initialValues={{
                project_id: timeEntry.work_project_id,
                start_time: timeEntry.start_time,
                end_time: timeEntry.end_time,
                active_seconds: timeEntry.active_seconds,
                paused_seconds: timeEntry.paused_seconds,
                currency: timeEntry.currency,
                salary: timeEntry.salary,
                memo: timeEntry.memo || undefined,
              }}
              onCancel={handleClose}
              onSubmit={handleSubmit}
              onOpenProjectForm={() => drawerStack.open("add-project")}
              onProjectChange={setCurrentProject}
              newTimeEntry={false}
              project={currentProject}
            />
          </Flex>
        </Drawer>
        <Drawer
          {...drawerStack.register("add-project")}
          onClose={() => drawerStack.close("add-project")}
          title={
            <Group>
              <Text>
                {getLocalizedText("Projekt hinzufügen", "Add Project")}
              </Text>
            </Group>
          }
          size="lg"
        >
          <ProjectForm
            onCancel={() => drawerStack.close("add-project")}
            tagIds={tagIds}
            setTagIds={setTagIds}
            onSuccess={(project) =>
              setCurrentProject(
                workProjects.find((p) => p.id === project.id) ?? project
              )
            }
            onOpenTagForm={() => drawerStack.open("tag-form")}
          />
        </Drawer>
        <Drawer
          {...drawerStack.register("tag-form")}
          onClose={() => drawerStack.close("tag-form")}
          title={getLocalizedText("Tag hinzufügen", "Add Tag")}
        >
          <FinanceTagForm
            onClose={() => drawerStack.close("tag-form")}
            onSuccess={(tag) => setTagIds([...tagIds, tag.id])}
          />
        </Drawer>
        <Drawer
          {...drawerStack.register("delete-time-entry")}
          onClose={() => drawerStack.close("delete-time-entry")}
          title={
            <Group>
              <IconExclamationMark size={25} color="red" />
              <Text>
                {getLocalizedText("Zeit-Eintrag löschen", "Delete Time Entry")}
              </Text>
            </Group>
          }
          size="md"
        >
          <Text>
            {getLocalizedText(
              "Bist du dir sicher, dass du diesen Zeit-Eintrag löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden. ",
              "Are you sure you want to delete this time entry? This action cannot be undone. "
            )}
          </Text>
          <Group mt="md" justify="flex-end" gap="sm">
            <CancelButton onClick={handleClose} color="teal" />
            <DeleteButton
              onClick={handleDelete}
              tooltipLabel={getLocalizedText(
                "Zeit-Eintrag löschen",
                "Delete Time Entry"
              )}
            />
          </Group>
        </Drawer>
      </Drawer.Stack>
    </Box>
  );
}
