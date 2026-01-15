import { useState, useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useSettings } from "@/db/collections/settings/use-settings-query";

import { Modal, useModalsStack } from "@mantine/core";
import CalendarEntryForm from "./CalendarEntryForm";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import {
  IconCalendarPlus,
  IconClipboardPlus,
  IconTagPlus,
} from "@tabler/icons-react";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import {
  WorkProject,
  InsertAppointment,
  InsertWorkTimeEntry,
} from "@/types/work.types";
import { useWorkTimeEntryMutations } from "@/db/collections/work/work-time-entry/use-work-time-entry-mutations";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { Currency } from "@/types/settings.types";
import ModalTitle from "@/components/UI/Modal/ModalTitle";

interface NewCalendarEntryModalProps {
  opened: boolean;
  onClose: () => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  project?: WorkProject;
  initialEntryType?: "appointment" | "time-entry";
}

export default function NewCalendarEntryModal({
  opened,
  onClose,
  initialStartDate,
  initialEndDate,
  project,
  initialEntryType,
}: NewCalendarEntryModalProps) {
  const { getLocalizedText } = useIntl();
  const stack = useModalsStack([
    "calendar-entry-form",
    "project-form",
    "tag-form",
  ]);
  const { data: settings } = useSettings();
  const { addWorkTimeEntry } = useWorkTimeEntryMutations();
  const { addAppointment } = useAppointmentMutations();

  const [currentProject, setCurrentProject] = useState<WorkProject | undefined>(
    project
  );
  const [tagIds, setTagIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  useEffect(() => {
    if (opened) {
      stack.open("calendar-entry-form");
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

  async function handleAppointmentSubmit(values: InsertAppointment) {
    // Convert empty strings to null for database compatibility
    const cleanedValues = {
      ...values,
      description:
        values.description && values.description.trim() !== ""
          ? values.description
          : null,
    };
    await addAppointment(cleanedValues);
    onClose();
  }

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

    let newTimeEntry: InsertWorkTimeEntry = {
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
      true_end_time: new Date(values.end_time).toISOString(),
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

  // Prepare initial values
  const getInitialValues = () => {
    const startDate = initialStartDate || new Date();
    const endDate =
      initialEndDate || new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

    // Auto-detect entry type based on start date if not specified
    const now = new Date();
    const autoEntryType =
      initialEntryType || (startDate < now ? "time-entry" : "appointment");

    // Calculate active seconds for time entries
    const activeSeconds = Math.max(
      60,
      Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
    );

    return {
      entry_type: autoEntryType,
      title: "",
      description: "",
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      work_project_id: project?.id,
      // Time entry fields
      active_seconds: activeSeconds,
      currency: project?.currency ?? settings?.default_currency ?? "USD",
      salary: project?.salary ?? settings?.default_salary_amount ?? 0,
      // Appointment fields
      type: "work" as const,
      is_all_day: false,
      reminder: null,
    };
  };

  return (
    <Modal.Stack>
      <Modal
        size="lg"
        {...stack.register("calendar-entry-form")}
        onClose={handleClose}
        title={
          <ModalTitle
            icon={<IconCalendarPlus />}
            title={getLocalizedText("Eintrag hinzufügen", "Add Entry")}
          />
        }
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <CalendarEntryForm
          initialValues={getInitialValues()}
          onAppointmentSubmit={handleAppointmentSubmit}
          onTimeEntrySubmit={handleTimeEntrySubmit}
          onProjectChange={setCurrentProject}
          onOpenProjectForm={() => stack.open("project-form")}
          onCancel={handleClose}
          project={currentProject}
        />
      </Modal>

      <Modal
        size="lg"
        {...stack.register("project-form")}
        title={
          <ModalTitle
            icon={<IconClipboardPlus />}
            title={getLocalizedText("Projekt hinzufügen", "Add Project")}
          />
        }
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
        title={
          <ModalTitle
            icon={<IconTagPlus />}
            title={getLocalizedText("Tag hinzufügen", "Add Tag")}
          />
        }
      >
        <FinanceTagForm
          onClose={() => stack.close("tag-form")}
          onSuccess={(tag) => setTagIds([...tagIds, tag.id])}
        />
      </Modal>
    </Modal.Stack>
  );
}
