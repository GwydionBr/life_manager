import { useState, useEffect, useMemo } from "react";
import { useForm, FormErrors } from "@mantine/form";
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
  Collapse,
  SegmentedControl,
  Alert,
} from "@mantine/core";
import {
  IconPlus,
  IconPlayerPlay,
  IconCalendar,
  IconClock,
  IconInfoCircle,
} from "@tabler/icons-react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import TimeInput from "@/components/Work/WorkTimeEntry/TimeEntryTimeInput";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import LocaleDateTimePicker from "@/components/UI/Locale/LocaleDateTimePicker";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import CustomNumberInput from "@/components/UI/CustomNumberInput";
import { WorkProject } from "@/types/work.types";
import { Currency } from "@/types/settings.types";

type EntryType = "appointment" | "time-entry";

export interface CalendarEntryFormData {
  entry_type: EntryType;
  // Common fields
  title?: string;
  start_time: string;
  end_time: string;
  work_project_id?: string;
  description?: string;

  // Time entry specific
  active_seconds?: number;
  currency?: Currency;
  salary?: number;

  // Appointment specific
  type?: "work" | "private" | "meeting" | "blocked";
  is_all_day?: boolean;
  reminder?: string | null;
}

interface CalendarEntryFormProps {
  initialValues: CalendarEntryFormData;
  isNew: boolean;
  project?: WorkProject;
  defaultCurrency?: string;
  defaultSalary?: number;

  onProjectChange?: (value: WorkProject) => void;
  onSubmit: (values: CalendarEntryFormData, entryType: EntryType) => void;
  onCancel: () => void;
  onOpenProjectForm?: () => void;
}

export default function CalendarEntryForm({
  initialValues,
  isNew,
  project,
  defaultCurrency = "USD",
  defaultSalary = 0,
  onSubmit,
  onOpenProjectForm,
  onProjectChange,
  onCancel,
}: CalendarEntryFormProps) {
  const { getLocalizedText } = useIntl();
  const { data: workProjects } = useWorkProjects();
  const [entryType, setEntryType] = useState<EntryType>(
    initialValues.entry_type || "appointment"
  );
  const [isAllDay, setIsAllDay] = useState(initialValues.is_all_day ?? false);
  const [userChangedStartTime, setUserChangedStartTime] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Dynamic schema based on entry type
  const getSchema = (type: EntryType) => {
    const baseSchema = {
      entry_type: z.enum(["appointment", "time-entry"]),
      start_time: z.string().transform((str) => new Date(str).toISOString()),
      end_time: z.string().transform((str) => new Date(str).toISOString()),
      work_project_id: z.string().optional(),
      description: z.string().optional().nullable(),
    };

    if (type === "time-entry") {
      return z.object({
        ...baseSchema,
        work_project_id: z.string({
          required_error: getLocalizedText(
            "Projekt ist erforderlich",
            "Project is required"
          ),
        }),
        active_seconds: z.number().min(1, {
          message: getLocalizedText(
            "Aktive Zeit muss größer als 0 sein",
            "Active time must be greater than 0"
          ),
        }),
        currency: z.enum(
          currencies.map((currency) => currency.value) as [
            Currency,
            ...Currency[],
          ]
        ),
        salary: z.number().min(0),
      });
    } else {
      return z.object({
        ...baseSchema,
        title: z.string().min(1, {
          message: getLocalizedText(
            "Titel ist erforderlich",
            "Title is required"
          ),
        }),
        type: z.enum(["work", "private", "meeting", "blocked"]),
        is_all_day: z.boolean(),
        reminder: z.string().nullable().optional(),
      });
    }
  };

  const form = useForm<CalendarEntryFormData>({
    initialValues: {
      ...initialValues,
      entry_type: entryType,
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
    validate: zodResolver(getSchema(entryType)) as unknown as (
      values: CalendarEntryFormData
    ) => FormErrors,
  });

  // Auto-detect entry type based on start time
  useEffect(() => {
    const startTime = new Date(form.values.start_time);
    const now = new Date();
    const newType = startTime < now ? "time-entry" : "appointment";

    if (newType !== entryType && userChangedStartTime) {
      setEntryType(newType);
      form.setFieldValue("entry_type", newType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.start_time, userChangedStartTime]);

  // Initialize form for time entries
  useEffect(() => {
    if (
      !formInitialized &&
      entryType === "time-entry" &&
      form.values.active_seconds
    ) {
      const totalSeconds = form.values.active_seconds;
      const endTime = new Date(form.values.end_time);
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      form.setFieldValue("start_time", startTime.toISOString());
      setFormInitialized(true);
    }
  }, [formInitialized, entryType, form]);

  useEffect(() => {
    if (project && project.id !== form.values.work_project_id) {
      form.setFieldValue("work_project_id", project.id);
      if (entryType === "time-entry") {
        form.setFieldValue("currency", project.currency);
        form.setFieldValue("salary", project.salary);
      }
    }
  }, [project, form, entryType]);

  const projects = useMemo(() => {
    return (
      workProjects.map((workProject) => ({
        value: workProject.id,
        label: workProject.title,
      })) || []
    );
  }, [workProjects]);

  // Handle entry type change
  const handleEntryTypeChange = (value: string) => {
    const newType = value as EntryType;
    setEntryType(newType);
    form.setFieldValue("entry_type", newType);

    // Set defaults for new type
    if (newType === "appointment") {
      if (!form.values.title) {
        form.setFieldValue("title", "");
      }
      if (!form.values.type) {
        form.setFieldValue("type", "work");
      }
      form.setFieldValue("is_all_day", isAllDay);
    } else {
      if (!form.values.active_seconds) {
        const startTime = new Date(form.values.start_time);
        const endTime = new Date(form.values.end_time);
        const seconds = Math.max(
          60,
          Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
        );
        form.setFieldValue("active_seconds", seconds);
      }
      if (!form.values.currency) {
        form.setFieldValue(
          "currency",
          (project?.currency as Currency) || defaultCurrency
        );
      }
      if (form.values.salary === undefined) {
        form.setFieldValue("salary", project?.salary || defaultSalary);
      }
    }
  };

  // Time entry handlers
  const handleActiveSecondsChange = (value: number) => {
    form.setFieldValue("active_seconds", value);
    const totalSeconds = value;

    if (userChangedStartTime) {
      const startTime = new Date(form.values.start_time);
      const endTime = new Date(startTime.getTime() + totalSeconds * 1000);
      form.setFieldValue("end_time", endTime.toISOString());
    } else {
      const endTime = new Date(form.values.end_time);
      const startTime = new Date(endTime.getTime() - totalSeconds * 1000);
      form.setFieldValue("start_time", startTime.toISOString());
    }
  };

  // Common time handlers
  const handleStartTimeChange = (value: Date | string | null) => {
    if (!value) return;
    setUserChangedStartTime(true);

    const dateValue = value instanceof Date ? value : new Date(value);
    form.setFieldValue("start_time", dateValue.toISOString());

    if (entryType === "time-entry") {
      const endTime = new Date(form.values.end_time);
      const totalSeconds = Math.floor(
        (endTime.getTime() - dateValue.getTime()) / 1000
      );

      if (totalSeconds > 0) {
        const roundedSeconds = Math.round(totalSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);
        const newEndTime = new Date(
          dateValue.getTime() + roundedSeconds * 1000
        );
        form.setFieldValue("end_time", newEndTime.toISOString());
      }
    } else {
      // Appointment logic
      const endDate = new Date(form.values.end_time || new Date());
      if (endDate < dateValue) {
        const newEndDate = new Date(dateValue);
        newEndDate.setHours(
          dateValue.getHours() + 1,
          dateValue.getMinutes(),
          0,
          0
        );
        form.setFieldValue("end_time", newEndDate.toISOString());
      }
    }
  };

  const handleEndTimeChange = (value: Date | string | null) => {
    if (!value) return;

    const dateValue = value instanceof Date ? value : new Date(value);
    form.setFieldValue("end_time", dateValue.toISOString());

    if (entryType === "time-entry") {
      const startTime = new Date(form.values.start_time);
      const totalSeconds = Math.floor(
        (dateValue.getTime() - startTime.getTime()) / 1000
      );

      if (totalSeconds > 0) {
        const roundedSeconds = Math.round(totalSeconds / 60) * 60;
        form.setFieldValue("active_seconds", roundedSeconds);
        const newEndTime = new Date(
          startTime.getTime() + roundedSeconds * 1000
        );
        form.setFieldValue("end_time", newEndTime.toISOString());
      }
    } else {
      // Appointment logic
      const startDate = new Date(form.values.start_time || new Date());
      if (dateValue < startDate) {
        const newStartDate = new Date(dateValue);
        newStartDate.setHours(
          dateValue.getHours() - 1,
          dateValue.getMinutes(),
          0,
          0
        );
        form.setFieldValue("start_time", newStartDate.toISOString());
      }
    }
  };

  function handleProjectChange(value: string | null) {
    if (!value) {
      form.setFieldValue("work_project_id", undefined);
      return;
    }
    const project = workProjects.find((p) => p.id === value);
    if (project) {
      form.setFieldValue("work_project_id", value);
      if (entryType === "time-entry") {
        form.setFieldValue("currency", project.currency);
        form.setFieldValue("salary", project.salary);
      }
      if (onProjectChange) {
        onProjectChange(project);
      }
    }
  }

  const handleAllDayToggle = (checked: boolean) => {
    setIsAllDay(checked);
    form.setFieldValue("is_all_day", checked);
  };

  const typeOptions = [
    { value: "work", label: getLocalizedText("Arbeit", "Work") },
    { value: "private", label: getLocalizedText("Privat", "Private") },
    { value: "meeting", label: getLocalizedText("Meeting", "Meeting") },
    { value: "blocked", label: getLocalizedText("Gesperrt", "Blocked") },
  ];

  const isInPast = new Date(form.values.start_time) < new Date();
  const isInFuture = new Date(form.values.start_time) > new Date();

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit(values as CalendarEntryFormData, entryType)
      )}
    >
      <Stack>
        {/* Entry Type Selector */}
        <Fieldset legend={getLocalizedText("Art des Eintrags", "Entry Type")}>
          <SegmentedControl
            fullWidth
            value={entryType}
            onChange={handleEntryTypeChange}
            data={[
              {
                value: "appointment",
                label: (
                  <Group gap="xs" wrap="nowrap" justify="center">
                    <IconCalendar size={16} />
                    <Text size="sm">
                      {getLocalizedText("Termin", "Appointment")}
                    </Text>
                  </Group>
                ),
              },
              {
                value: "time-entry",
                label: (
                  <Group gap="xs" wrap="nowrap" justify="center">
                    <IconClock size={16} />
                    <Text size="sm">
                      {getLocalizedText("Zeit-Eintrag", "Time Entry")}
                    </Text>
                  </Group>
                ),
              },
            ]}
          />

          {/* Auto-detection hint */}
          {isInPast && entryType === "time-entry" && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="blue"
              variant="light"
              mt="xs"
            >
              <Text size="xs">
                {getLocalizedText(
                  "Startzeit liegt in der Vergangenheit",
                  "Start time is in the past"
                )}
              </Text>
            </Alert>
          )}
          {isInFuture && entryType === "appointment" && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="teal"
              variant="light"
              mt="xs"
            >
              <Text size="xs">
                {getLocalizedText(
                  "Startzeit liegt in der Zukunft",
                  "Start time is in the future"
                )}
              </Text>
            </Alert>
          )}
        </Fieldset>

        {/* Appointment Fields */}
        {entryType === "appointment" && (
          <>
            <Fieldset
              legend={getLocalizedText(
                "Grundinformationen",
                "Basic Information"
              )}
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
                      form.values.start_time
                        ? new Date(form.values.start_time)
                        : null
                    }
                    onChange={handleStartTimeChange}
                    error={form.errors.start_time}
                  />
                  <LocaleDatePickerInput
                    withAsterisk
                    label={getLocalizedText("Enddatum", "End Date")}
                    value={
                      form.values.end_time
                        ? new Date(form.values.end_time)
                        : null
                    }
                    onChange={handleEndTimeChange}
                    error={form.errors.end_time}
                  />
                </Group>
              ) : (
                <Group grow>
                  <LocaleDateTimePicker
                    withAsterisk
                    label={getLocalizedText("Startzeit", "Start Time")}
                    value={
                      form.values.start_time
                        ? new Date(form.values.start_time)
                        : null
                    }
                    onChange={handleStartTimeChange}
                    error={form.errors.start_time}
                  />
                  <LocaleDateTimePicker
                    withAsterisk
                    label={getLocalizedText("Endzeit", "End Time")}
                    value={
                      form.values.end_time
                        ? new Date(form.values.end_time)
                        : null
                    }
                    onChange={handleEndTimeChange}
                    error={form.errors.end_time}
                  />
                </Group>
              )}
              <LocaleDateTimePicker
                label={getLocalizedText("Erinnerung", "Reminder")}
                value={
                  form.values.reminder ? new Date(form.values.reminder) : null
                }
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
                rightSectionPointerEvents={
                  onOpenProjectForm ? "auto" : undefined
                }
              />
            </Fieldset>
          </>
        )}

        {/* Time Entry Fields */}
        {entryType === "time-entry" && (
          <>
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
                  value={form.values.active_seconds || 0}
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
              {...form.getInputProps("description")}
            />
          </>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onCancel}>
            {getLocalizedText("Abbrechen", "Cancel")}
          </Button>
          {isNew ? (
            <CreateButton
              onClick={form.onSubmit((values) =>
                onSubmit(values as CalendarEntryFormData, entryType)
              )}
              type="submit"
            />
          ) : (
            <UpdateButton
              onClick={form.onSubmit((values) =>
                onSubmit(values as CalendarEntryFormData, entryType)
              )}
              type="submit"
            />
          )}
        </Group>
      </Stack>
    </form>
  );
}
