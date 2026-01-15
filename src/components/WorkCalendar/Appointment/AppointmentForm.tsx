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
  Grid,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import LocaleDateTimePicker from "@/components/UI/Locale/LocaleDateTimePicker";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";

// Helper function to calculate reminder minutes from reminder date and start date
function calculateReminderMinutes(
  reminderDate: string | null,
  startDate: string | null
): string | null {
  if (!reminderDate || !startDate) return null;
  const reminder = new Date(reminderDate);
  const start = new Date(startDate);
  const diffMs = start.getTime() - reminder.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  return diffMinutes > 0 ? diffMinutes.toString() : null;
}

// Helper function to calculate reminder date from start date and minutes
function calculateReminderDate(
  startDate: string | null,
  minutes: string | null
): string | null {
  if (!startDate || !minutes) return null;
  const start = new Date(startDate);
  const reminder = new Date(start);
  reminder.setMinutes(reminder.getMinutes() - parseInt(minutes, 10));
  if (reminder < addMinutes(new Date(), 5)) {
    return null;
  }
  return reminder.toISOString();
}

import {
  InsertAppointment,
  UpdateAppointment,
  WorkProject,
} from "@/types/work.types";
import { addMinutes } from "date-fns";

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

  // Calculate initial reminder minutes from existing reminder date
  const initialReminderMinutes = useMemo(() => {
    return calculateReminderMinutes(
      initialValues.reminder || null,
      initialValues.start_date || null
    );
  }, [initialValues.reminder, initialValues.start_date]);

  const [reminderMinutes, setReminderMinutes] = useState<string | null>(
    initialReminderMinutes
  );

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
    const newStartDate = dateValue.toISOString();
    form.setFieldValue("start_date", newStartDate);

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

    // Update reminder date if reminder minutes are set
    if (reminderMinutes) {
      const newReminderDate = calculateReminderDate(
        newStartDate,
        reminderMinutes
      );
      form.setFieldValue("reminder", newReminderDate);
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

  const reminderOptions = [
    {
      value: "15",
      label: getLocalizedText("15 Minuten", "15 minutes"),
    },
    {
      value: "30",
      label: getLocalizedText("30 Minuten", "30 minutes"),
    },
    {
      value: "60",
      label: getLocalizedText("1 Stunde", "1 hour"),
    },
    {
      value: "120",
      label: getLocalizedText("2 Stunden", "2 hours"),
    },
    {
      value: "1440",
      label: getLocalizedText("1 Tag", "1 day"),
    },
    {
      value: "2880",
      label: getLocalizedText("2 Tage", "2 days"),
    },
  ];

  const handleReminderChange = (value: string | null) => {
    setReminderMinutes(value);
    if (value && form.values.start_date) {
      const reminderDate = calculateReminderDate(form.values.start_date, value);
      form.setFieldValue("reminder", reminderDate);
    } else {
      form.setFieldValue("reminder", null);
    }
  };

  // Update reminder when form is submitted to ensure it's calculated correctly
  const handleFormSubmit = (values: InsertAppointment | UpdateAppointment) => {
    // Ensure reminder is calculated from current start_date and reminderMinutes
    const finalValues = {
      ...values,
      reminder: calculateReminderDate(
        values.start_date ?? null,
        reminderMinutes
      ),
    };
    onSubmit(finalValues);
  };

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack gap="lg">
        <Fieldset
          legend={getLocalizedText("Grundinformationen", "Basic Information")}
        >
          <Stack gap="md">
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
          </Stack>
        </Fieldset>

        <Fieldset
          legend={getLocalizedText("Zeit & Erinnerung", "Time & Reminder")}
        >
          <Stack gap="md">
            <Switch
              label={getLocalizedText("Ganztägig", "All Day")}
              checked={isAllDay}
              onChange={(event) =>
                handleAllDayToggle(event.currentTarget.checked)
              }
            />
            {isAllDay ? (
              <Group grow>
                <LocaleDatePickerInput
                  minDate={new Date()}
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
                  minDate={new Date()}
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
                  minDate={new Date()}
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
                  minDate={new Date()}
                  label={getLocalizedText("Endzeit", "End Time")}
                  value={
                    form.values.end_date ? new Date(form.values.end_date) : null
                  }
                  onChange={handleEndDateChange}
                  error={form.errors.end_date}
                />
              </Group>
            )}
            <Select
              label={getLocalizedText("Erinnerung", "Reminder")}
              placeholder={getLocalizedText(
                "Erinnerung auswählen (optional)",
                "Select reminder (optional)"
              )}
              data={reminderOptions}
              value={reminderMinutes}
              onChange={handleReminderChange}
              clearable
              error={form.errors.reminder}
            />
          </Stack>
        </Fieldset>

        <Fieldset legend={getLocalizedText("Details", "Details")}>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                withAsterisk
                label={getLocalizedText("Typ", "Type")}
                data={typeOptions}
                {...form.getInputProps("type")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
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
                rightSectionPointerEvents={
                  onOpenProjectForm ? "auto" : undefined
                }
              />
            </Grid.Col>
          </Grid>
        </Fieldset>

        <Group justify="flex-end" mt="md">
          {newAppointment ? (
            <CreateButton
              onClick={form.onSubmit(handleFormSubmit)}
              type="submit"
            />
          ) : (
            <UpdateButton
              onClick={form.onSubmit(handleFormSubmit)}
              type="submit"
            />
          )}
        </Group>
      </Stack>
    </form>
  );
}
