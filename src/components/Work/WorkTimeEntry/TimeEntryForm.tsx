import { useState, useEffect, useMemo } from "react";
import { useForm } from "@mantine/form";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useIntl } from "@/hooks/useIntl";

import {
  Select,
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  Collapse,
  Fieldset,
} from "@mantine/core";
import { IconPlayerPlay, IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import TimeInput from "@/components/Work/WorkTimeEntry/TimeEntryTimeInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import LocaleDateTimePicker from "@/components/UI/Locale/LocaleDateTimePicker";

import { NewWorkTimeEntry } from "@/types/workTimeEntry.types";
import CustomNumberInput from "@/components/UI/CustomNumberInput";
import { WorkProject } from "@/types/work.types";

interface TimeEntryFormProps {
  initialValues: NewWorkTimeEntry;
  newTimeEntry: boolean;
  project?: WorkProject;

  onProjectChange?: (value: WorkProject) => void;
  onSubmit: (values: NewWorkTimeEntry) => void;
  onCancel: () => void;
  onOpenProjectForm?: () => void;
}

export default function TimeEntryForm({
  initialValues,
  newTimeEntry,
  project,
  onSubmit,
  onOpenProjectForm,
  onProjectChange,
}: TimeEntryFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: workProjects } = useWorkProjects();
  const [userChangedStartTime, setUserChangedStartTime] = useState(false);
  const [_userChangedEndTime, setUserChangedEndTime] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const schema = z.object({
    work_project_id: z.string(),
    start_time: z.string().transform((str) => new Date(str).toISOString()),
    end_time: z.string().transform((str) => new Date(str).toISOString()),
    active_seconds: z.number().min(1, {
      message: getLocalizedText(
        "Aktive Zeit muss grüßer als 0 sein",
        "Active time must be greater than 0"
      ),
    }),
    memo: z.string().optional(),
    currency: z.string().min(1, {
      message: getLocalizedText(
        "Währung ist erforderlich",
        "Currency is required"
      ),
    }),
    salary: z.number().min(0, {
      message: getLocalizedText(
        "Gehalt muss positiv sein",
        "Salary must be positive"
      ),
    }),
  });

  const form = useForm<NewWorkTimeEntry>({
    initialValues: {
      ...initialValues,
      work_project_id:
        initialValues.work_project_id || project?.id || undefined,
      start_time: (() => {
        const d = new Date(initialValues.start_time);
        d.setSeconds(0, 0);
        return d.toISOString();
      })(),
      end_time: (() => {
        const d = new Date(initialValues.end_time);
        d.setSeconds(0, 0);
        return d.toISOString();
      })(),
    },
    validate: zodResolver(schema),
  });

  // Initialize form - when form opens, adjust start_time based on active/paused time
  useEffect(() => {
    if (!formInitialized) {
      const totalSeconds = form.values.active_seconds;
      const endTime = new Date(form.values.end_time);
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      form.setFieldValue("start_time", startTime.toISOString());
      setFormInitialized(true);
    }
  }, [formInitialized, form]);

  useEffect(() => {
    if (project && project.id !== form.values.work_project_id) {
      form.setFieldValue("work_project_id", project.id);
      form.setFieldValue("currency", project.currency);
      form.setFieldValue("salary", project.salary);
    }
  }, [project]);

  const projects = useMemo(() => {
    return (
      workProjects.map((workProject) => ({
        value: workProject.id,
        label: workProject.title,
      })) || []
    );
  }, [workProjects]);

  // Calculate end_time when active_seconds changes
  const handleActiveSecondsChange = (value: number) => {
    form.setFieldValue("active_seconds", value);

    const totalSeconds = value;

    // If both start and end time have been manually changed by user, keep start_time fixed
    if (userChangedStartTime) {
      const startTime = new Date(form.values.start_time);
      const endTime = new Date(startTime.getTime() + totalSeconds * 1000);
      form.setFieldValue("end_time", endTime.toISOString());
    } else {
      // Otherwise, adjust start_time based on end_time (initial behavior)
      const endTime = new Date(form.values.end_time);
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      form.setFieldValue("start_time", startTime.toISOString());
    }
  };

  // Calculate active_seconds when end_time changes (rounded to nearest minute)
  const handleEndTimeChange = (value: string | null) => {
    if (!value) return;
    setUserChangedEndTime(true);

    form.setFieldValue("end_time", value);

    const startTime = new Date(form.values.start_time);
    const endTime = new Date(value);
    const totalSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    if (totalSeconds > 0) {
      // Calculate active seconds by subtracting paused seconds
      const activeSeconds = totalSeconds;

      if (activeSeconds > 0) {
        // Round to nearest minute (60 seconds)
        const roundedSeconds = Math.round(activeSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);

        // Update end_time to match the rounded active seconds + paused seconds
        const newTotalSeconds = roundedSeconds;
        const newEndTime = new Date(
          startTime.getTime() + newTotalSeconds * 1000
        );
        form.setFieldValue("end_time", newEndTime.toISOString());
      }
    }
  };

  // Handle start_time changes and update end_time/active_seconds accordingly
  const handleStartTimeChange = (value: string | null) => {
    if (!value) return;
    setUserChangedStartTime(true);

    form.setFieldValue("start_time", value);

    const startTime = new Date(value);
    const endTime = new Date(form.values.end_time);
    const totalSeconds = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    if (totalSeconds > 0) {
      // Calculate active seconds by subtracting paused seconds
      const activeSeconds = totalSeconds;

      if (activeSeconds > 0) {
        // Round to nearest minute
        const roundedSeconds = Math.round(activeSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);

        // Update end_time to match the rounded active seconds + paused seconds
        const newTotalSeconds = roundedSeconds;
        const newEndTime = new Date(
          startTime.getTime() + newTotalSeconds * 1000
        );
        form.setFieldValue("end_time", newEndTime.toISOString());
      }
    }
  };

  function handleProjectChange(value: string | null) {
    if (!value) return;
    const project = workProjects.find((p) => p.id === value);
    if (project) {
      if (onProjectChange) {
        onProjectChange(project);
      }
    }
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Fieldset legend={getLocalizedText("Projekt", "Project")}>
          <Select
            w="100%"
            withAsterisk
            allowDeselect={false}
            label={getLocalizedText("Projekt", "Project")}
            value={form.values.work_project_id}
            error={form.errors.work_project_id}
            placeholder={getLocalizedText(
              "Projekt auswählen",
              "Select project"
            )}
            data={projects}
            searchable
            onChange={handleProjectChange}
            rightSection={
              <Button
                onClick={onOpenProjectForm}
                leftSection={<IconPlus size={18} />}
                fw={500}
                variant="subtle"
              >
                <Text fz="xs" c="dimmed">
                  {getLocalizedText("Neu", "New")}
                </Text>
              </Button>
            }
            rightSectionWidth={86}
            rightSectionPointerEvents="auto"
          />
        </Fieldset>
        <Fieldset legend={getLocalizedText("Zeit", "Time")}>
          <Stack>
            <TimeInput
              label={getLocalizedText("Aktive Zeit", "Active Time")}
              value={form.values.active_seconds}
              onChange={handleActiveSecondsChange}
              error={form.errors.active_seconds}
              icon={<IconPlayerPlay size={18} />}
              color="green"
              data-autofocus={true}
              isOpen={true}
            />
            <Group grow>
              <LocaleDateTimePicker
                withAsterisk
                label={getLocalizedText("Startzeit", "Start Time")}
                value={form.values.start_time}
                onChange={handleStartTimeChange}
                error={form.errors.start_time}
              />
              <LocaleDateTimePicker
                withAsterisk
                label={getLocalizedText("Endzeit", "End Time")}
                value={form.values.end_time}
                onChange={handleEndTimeChange}
                error={form.errors.end_time}
              />
            </Group>
          </Stack>
        </Fieldset>
        <Fieldset legend={getLocalizedText("Finanzen", "Finances")}>
          <Collapse in={project?.hourly_payment !== false}>
            <CustomNumberInput
              label={getLocalizedText("Gehalt", "Salary")}
              min={0}
              step={0.01}
              {...form.getInputProps("salary")}
            />
            <Select
              label={getLocalizedText("Währung", "Currency")}
              placeholder={getLocalizedText(
                "Währung auswählen",
                "Select currency"
              )}
              data={currencies}
              {...form.getInputProps("currency")}
            />
          </Collapse>
          <Collapse in={project?.hourly_payment === false}>
            <Text>Hobby</Text>
          </Collapse>
        </Fieldset>
        <Textarea
          label={getLocalizedText("Notiz", "Memo")}
          placeholder={getLocalizedText("Notiz eingeben", "Enter memo")}
          {...form.getInputProps("memo")}
        />
        {newTimeEntry ? (
          <CreateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            mt="md"
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            mt="md"
          />
        )}
      </Stack>
    </form>
  );
}
