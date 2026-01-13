import { useState, useEffect, useMemo } from "react";
import { useForm } from "@mantine/form";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useIntl } from "@/hooks/useIntl";

import {
  Select,
  Stack,
  Textarea,
  Group,
  TextInput,
  Text,
  Fieldset,
  Switch,
  Button,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import LocaleDateTimePicker from "@/components/UI/Locale/LocaleDateTimePicker";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";

import {
  InsertAppointment,
  UpdateAppointment,
  WorkProject,
} from "@/types/work.types";

interface AppointmentFormProps {
  initialValues: InsertAppointment | UpdateAppointment;
  newAppointment: boolean;
  project?: WorkProject;

  onProjectChange?: (value: WorkProject) => void;
  onSubmit: (values: InsertAppointment | UpdateAppointment) => void;
  onCancel: () => void;
  onOpenProjectForm?: () => void;
}

export default function AppointmentForm({
  initialValues,
  newAppointment,
  project,
  onSubmit,
  onOpenProjectForm,
  onProjectChange,
}: AppointmentFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: workProjects } = useWorkProjects();
  const [isAllDay, setIsAllDay] = useState(initialValues.is_all_day ?? false);

  const schema = z.object({
    title: z.string().min(1, {
      message: getLocalizedText("Titel ist erforderlich", "Title is required"),
    }),
    description: z.string().optional().nullable(),
    start_date: z.string().transform((str) => new Date(str).toISOString()),
    end_date: z.string().transform((str) => new Date(str).toISOString()),
    type: z.enum(["work", "private", "meeting", "blocked"]),
    is_all_day: z.boolean(),
    work_project_id: z.string().nullable().optional(),
    reminder: z.string().nullable().optional(),
  });

  const form = useForm<InsertAppointment | UpdateAppointment>({
    initialValues: {
      ...initialValues,
      work_project_id: initialValues.work_project_id || project?.id || null,
      description: initialValues.description || "",
      start_date: (() => {
        const d = new Date(initialValues.start_date || new Date());
        d.setSeconds(0, 0);
        return d.toISOString();
      })(),
      end_date: (() => {
        const d = new Date(initialValues.end_date || new Date());
        d.setSeconds(0, 0);
        return d.toISOString();
      })(),
      is_all_day: initialValues.is_all_day ?? false,
      type: initialValues.type || "work",
      reminder: initialValues.reminder || null,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (project && project.id !== form.values.work_project_id) {
      form.setFieldValue("work_project_id", project.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  // Update is_all_day state when form value changes
  useEffect(() => {
    setIsAllDay(form.values.is_all_day ?? false);
  }, [form.values.is_all_day]);

  const projects = useMemo(() => {
    return (
      workProjects.map((workProject) => ({
        value: workProject.id,
        label: workProject.title,
      })) || []
    );
  }, [workProjects]);

  // Handle all-day toggle
  const handleAllDayToggle = (checked: boolean) => {
    setIsAllDay(checked);
    form.setFieldValue("is_all_day", checked);
  };

  // Handle start date change - accepts both Date and string (for compatibility)
  const handleStartDateChange = (value: Date | string | null) => {
    if (!value) return;
    const dateValue = value instanceof Date ? value : new Date(value);
    form.setFieldValue("start_date", dateValue.toISOString());

    // If end_date is before start_date, adjust end_date
    const endDate = new Date(form.values.end_date || new Date());
    if (endDate < dateValue) {
      const newEndDate = new Date(dateValue);
      newEndDate.setHours(
        dateValue.getHours() + 1,
        dateValue.getMinutes(),
        0,
        0
      );
      form.setFieldValue("end_date", newEndDate.toISOString());
    }
  };

  // Handle end date change - accepts both Date and string (for compatibility)
  const handleEndDateChange = (value: Date | string | null) => {
    if (!value) return;
    const dateValue = value instanceof Date ? value : new Date(value);
    form.setFieldValue("end_date", dateValue.toISOString());

    // If end_date is before start_date, adjust start_date
    const startDate = new Date(form.values.start_date || new Date());
    if (dateValue < startDate) {
      const newStartDate = new Date(dateValue);
      newStartDate.setHours(
        dateValue.getHours() - 1,
        dateValue.getMinutes(),
        0,
        0
      );
      form.setFieldValue("start_date", newStartDate.toISOString());
    }
  };

  function handleProjectChange(value: string | null) {
    if (!value) {
      form.setFieldValue("work_project_id", null);
      return;
    }
    const project = workProjects.find((p) => p.id === value);
    if (project) {
      form.setFieldValue("work_project_id", value);
      if (onProjectChange) {
        onProjectChange(project);
      }
    }
  }

  const typeOptions = [
    {
      value: "work",
      label: getLocalizedText("Arbeit", "Work"),
    },
    {
      value: "private",
      label: getLocalizedText("Privat", "Private"),
    },
    {
      value: "meeting",
      label: getLocalizedText("Meeting", "Meeting"),
    },
    {
      value: "blocked",
      label: getLocalizedText("Gesperrt", "Blocked"),
    },
  ];

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Fieldset
          legend={getLocalizedText("Grundinformationen", "Basic Information")}
        >
          <TextInput
            withAsterisk
            data-autofocus
            label={getLocalizedText("Titel", "Title")}
            placeholder={getLocalizedText("Titel eingeben", "Enter title")}
            {...form.getInputProps("title")}
          />
          <Textarea
            label={getLocalizedText("Beschreibung", "Description")}
            placeholder={getLocalizedText(
              "Beschreibung eingeben",
              "Enter description"
            )}
            {...form.getInputProps("description")}
            minRows={3}
          />
        </Fieldset>

        <Fieldset legend={getLocalizedText("Zeit", "Time")}>
          <Switch
            label={getLocalizedText("Ganztägig", "All Day")}
            checked={isAllDay}
            onChange={(event) =>
              handleAllDayToggle(event.currentTarget.checked)
            }
            mb="md"
          />
          {isAllDay ? (
            <Group grow>
              <LocaleDatePickerInput
                withAsterisk
                label={getLocalizedText("Startdatum", "Start Date")}
                value={
                  form.values.start_date
                    ? new Date(form.values.start_date)
                    : null
                }
                onChange={handleStartDateChange}
                error={form.errors.start_date}
              />
              <LocaleDatePickerInput
                withAsterisk
                label={getLocalizedText("Enddatum", "End Date")}
                value={
                  form.values.end_date ? new Date(form.values.end_date) : null
                }
                onChange={handleEndDateChange}
                error={form.errors.end_date}
              />
            </Group>
          ) : (
            <Group grow>
              <LocaleDateTimePicker
                withAsterisk
                label={getLocalizedText("Startzeit", "Start Time")}
                value={
                  form.values.start_date
                    ? new Date(form.values.start_date)
                    : null
                }
                onChange={handleStartDateChange}
                error={form.errors.start_date}
              />
              <LocaleDateTimePicker
                withAsterisk
                label={getLocalizedText("Endzeit", "End Time")}
                value={
                  form.values.end_date ? new Date(form.values.end_date) : null
                }
                onChange={handleEndDateChange}
                error={form.errors.end_date}
              />
            </Group>
          )}
          <LocaleDateTimePicker
            label={getLocalizedText("Erinnerung", "Reminder")}
            value={form.values.reminder ? new Date(form.values.reminder) : null}
            onChange={(value) =>
              form.setFieldValue(
                "reminder",
                value ? new Date(value).toISOString() : null
              )
            }
            error={form.errors.reminder}
          />
        </Fieldset>

        <Fieldset
          legend={getLocalizedText("Kategorisierung", "Categorization")}
        >
          <Select
            withAsterisk
            label={getLocalizedText("Typ", "Type")}
            data={typeOptions}
            {...form.getInputProps("type")}
          />
        </Fieldset>

        <Fieldset legend={getLocalizedText("Projekt", "Project")}>
          <Select
            label={getLocalizedText("Projekt", "Project")}
            value={form.values.work_project_id || null}
            error={form.errors.work_project_id}
            placeholder={getLocalizedText(
              "Projekt auswählen (optional)",
              "Select project (optional)"
            )}
            data={projects}
            searchable
            clearable
            onChange={handleProjectChange}
            rightSection={
              onOpenProjectForm ? (
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
              ) : undefined
            }
            rightSectionWidth={onOpenProjectForm ? 86 : undefined}
            rightSectionPointerEvents={onOpenProjectForm ? "auto" : undefined}
          />
        </Fieldset>

        {newAppointment ? (
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
