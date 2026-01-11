import { useState, useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useSettings } from "@/db/collections/settings/use-settings-query";

import { Group, Modal, Text, useModalsStack } from "@mantine/core";
import TimeEntryForm from "./TimeEntryForm";
import { TablesInsert } from "@/types/db.types";
import { Currency } from "@/types/settings.types";
import ProjectForm from "../Project/ProjectForm";
import { IconClockPlus } from "@tabler/icons-react";
import { NewWorkTimeEntry } from "@/types/workTimeEntry.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import { WorkProject } from "@/types/work.types";
import { useWorkTimeEntryMutations } from "@/db/collections/work/work-time-entry/use-work-time-entry-mutations";

interface NewTimeEntryModalProps {
  opened: boolean;
  onClose: () => void;
  initialValues?: NewWorkTimeEntry;
  project?: WorkProject;
}

export default function NewTimeEntryModal({
  opened,
  onClose,
  initialValues,
  project,
}: NewTimeEntryModalProps) {
  const { getLocalizedText } = useIntl();
  const stack = useModalsStack(["time-entry-form", "project-form", "tag-form"]);
  const { data: settings } = useSettings();
  const { addWorkTimeEntry } = useWorkTimeEntryMutations();

  const [currentProject, setCurrentProject] = useState<WorkProject | undefined>(
    project
  );
  const [tagIds, setTagIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  useEffect(() => {
    if (opened) {
      stack.open("time-entry-form");
    } else {
      stack.closeAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleClose = () => {
    onClose();
    setCurrentProject(project);
    setTagIds([]);
  };

  async function handleTimeEntrySubmit(values: {
    start_time: string;
    end_time: string;
    active_seconds: number;
    currency: Currency;
    salary: number;
    memo?: string;
  }) {
    if (!currentProject) {
      return;
    }

    let newTimeEntry: TablesInsert<"work_time_entry"> = {
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
      paused_seconds: 0,
      memo: values.memo || null,
      hourly_payment: currentProject.hourly_payment,
    };

    const roundingSettings: TimerRoundingSettings = {
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

    await addWorkTimeEntry(newTimeEntry, roundingSettings);
    onClose();
  }

  return (
    <Modal.Stack>
      <Modal
        size="lg"
        {...stack.register("time-entry-form")}
        onClose={handleClose}
        title={
          <Group>
            <IconClockPlus />
            <Text>{getLocalizedText("Zeit-Eintrag hinzufügen", "Add Time Entry")}</Text>
          </Group>
        }
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <TimeEntryForm
          initialValues={
            initialValues ?? {
              work_project_id: undefined,
              start_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
              end_time: new Date(new Date().setSeconds(0, 0)).toISOString(),
              active_seconds: 0,
              paused_seconds: 0,
              currency:
                project?.currency ?? settings?.default_currency ?? "USD",
              salary: project?.salary ?? settings?.default_salary_amount ?? 0,
            }
          }
          newTimeEntry={true}
          onSubmit={handleTimeEntrySubmit}
          onProjectChange={setCurrentProject}
          onOpenProjectForm={() => stack.open("project-form")}
          onCancel={handleClose}
          project={currentProject}
        />
      </Modal>

      <Modal
        size="lg"
        {...stack.register("project-form")}
        title={getLocalizedText("Projekt hinzufügen", "Add Project")}
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <ProjectForm
          onCancel={() => stack.close("project-form")}
          tagIds={tagIds}
          setTagIds={setTagIds}
          onOpenTagForm={() => stack.open("tag-form")}
          onSuccess={(project: WorkProject) => {
            setCurrentProject(project);
            stack.close("project-form");
          }}
        />
      </Modal>
      <Modal
        size="lg"
        {...stack.register("tag-form")}
        onClose={() => stack.close("tag-form")}
        title={getLocalizedText("Tag hinzufügen", "Add Tag")}
      >
        <FinanceTagForm
          onClose={() => stack.close("tag-form")}
          onSuccess={(tag) => setTagIds([...tagIds, tag.id])}
        />
      </Modal>
    </Modal.Stack>
  );
}
