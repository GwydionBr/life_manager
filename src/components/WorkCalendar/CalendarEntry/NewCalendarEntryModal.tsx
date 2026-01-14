import { useState, useEffect } from "react";
import { useIntl } from "@/hooks/useIntl";
import { useSettings } from "@/db/collections/settings/use-settings-query";

import { Group, Modal, Text, useModalsStack } from "@mantine/core";
import CalendarEntryForm from "./CalendarEntryForm";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import { IconCalendarPlus, IconClockPlus } from "@tabler/icons-react";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import FinanceTagForm from "@/components/Finances/Tag/TagForm";
import {
  WorkProject,
  InsertAppointment,
  InsertWorkTimeEntry,
} from "@/types/work.types";
import { useWorkTimeEntryMutations } from "@/db/collections/work/work-time-entry/use-work-time-entry-mutations";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { CalendarEntryFormData } from "./CalendarEntryForm";
import { getProjectRoundingSettings } from "@/lib/appointmentTimerHelpers";

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

  async function handleSubmit(
    values: CalendarEntryFormData,
    entryType: "appointment" | "time-entry"
  ) {
    if (entryType === "time-entry") {
      if (
        !currentProject ||
        !values.active_seconds ||
        !values.currency ||
        !values.salary
      ) {
        return;
      }

      const newTimeEntry: InsertWorkTimeEntry = {
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        true_end_time: new Date(values.end_time).toISOString(),
        active_seconds: values.active_seconds,
        memo: values.description || null,
        hourly_payment: currentProject.hourly_payment,
        currency: values.currency,
        salary: values.salary,
        work_project_id: currentProject.id
      };

      const roundingSettings: TimerRoundingSettings =
        getProjectRoundingSettings(currentProject, {
          roundingInterval: settings?.rounding_interval ?? 0,
          roundingDirection: settings?.rounding_direction ?? "up",
          roundInTimeFragments: settings?.round_in_time_sections ?? false,
          timeFragmentInterval: settings?.time_section_interval ?? 15,
        });

      await addWorkTimeEntry(newTimeEntry, roundingSettings);
    } else {
      // Appointment
      const cleanedValues: InsertAppointment = {
        title: values.title || "",
        description:
          values.description && values.description.trim() !== ""
            ? values.description
            : null,
        start_date: new Date(values.start_time).toISOString(),
        end_date: new Date(values.end_time).toISOString(),
        type: values.type || "work",
        status: "upcoming",
        is_all_day: values.is_all_day ?? false,
        work_project_id: values.work_project_id || null,
        reminder: values.reminder || null,
      };

      await addAppointment(cleanedValues);
    }

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

  // Determine the modal icon and title based on initial entry type
  const getModalHeader = () => {
    const initialValues = getInitialValues();
    const isPast = new Date(initialValues.start_time) < new Date();

    if (isPast) {
      return {
        icon: <IconClockPlus />,
        title: getLocalizedText("Eintrag hinzufügen", "Add Entry"),
      };
    } else {
      return {
        icon: <IconCalendarPlus />,
        title: getLocalizedText("Eintrag hinzufügen", "Add Entry"),
      };
    }
  };

  const header = getModalHeader();

  return (
    <Modal.Stack>
      <Modal
        size="lg"
        {...stack.register("calendar-entry-form")}
        onClose={handleClose}
        title={
          <Group>
            {header.icon}
            <Text>{header.title}</Text>
          </Group>
        }
        transitionProps={{ transition: "fade-right", duration: 400 }}
      >
        <CalendarEntryForm
          initialValues={getInitialValues()}
          isNew={true}
          onSubmit={handleSubmit}
          onProjectChange={setCurrentProject}
          onOpenProjectForm={() => stack.open("project-form")}
          onCancel={handleClose}
          project={currentProject}
          defaultCurrency={settings?.default_currency ?? "USD"}
          defaultSalary={settings?.default_salary_amount ?? 0}
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
