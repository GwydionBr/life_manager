import { useState } from "react";
import { useIntl } from "@/hooks/useIntl";
import { Stack, Group, Text, SegmentedControl } from "@mantine/core";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import {
  InsertAppointment,
  UpdateAppointment,
  WorkProject,
} from "@/types/work.types";
import AppointmentForm from "../Appointment/AppointmentForm";
import TimeEntryForm from "@/components/Work/WorkTimeEntry/TimeEntryForm";
import { NewWorkTimeEntry } from "@/types/workTimeEntry.types";

type EntryType = "appointment" | "time-entry";

export interface CalendarEntryFormData {
  entry_type: EntryType;
  // Common fields

  start_time: string;
  end_time: string;

  // Time entry specific
  active_seconds?: number;
}

interface CalendarEntryFormProps {
  initialValues: CalendarEntryFormData;
  project?: WorkProject;

  onProjectChange?: (value: WorkProject) => void;
  onAppointmentSubmit: (values: InsertAppointment | UpdateAppointment) => void;
  onTimeEntrySubmit: (values: NewWorkTimeEntry) => void;
  onCancel: () => void;
  onOpenProjectForm?: () => void;
}

export default function CalendarEntryForm({
  initialValues,
  project,
  onAppointmentSubmit,
  onTimeEntrySubmit,
  onOpenProjectForm,
  onProjectChange,
  onCancel,
}: CalendarEntryFormProps) {
  const { getLocalizedText } = useIntl();
  const [entryType, setEntryType] = useState<EntryType>(
    initialValues.entry_type
  );

  return (
    <Stack>
      {/* Entry Type Selector */}
      <SegmentedControl
        fullWidth
        value={entryType}
        onChange={(value) => setEntryType(value as EntryType)}
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

      {/* Appointment Fields */}
      {entryType === "appointment" ? (
        <AppointmentForm
          initialValues={{
            type: "work",
            start_date: initialValues.start_time,
            end_date: initialValues.end_time,
          }}
          newAppointment={true}
          onSubmit={onAppointmentSubmit}
          onCancel={onCancel}
        />
      ) : (
        <TimeEntryForm
          initialValues={{
            start_time: initialValues.start_time,
            end_time: initialValues.end_time,
            active_seconds: Math.floor(
              (new Date(initialValues.end_time).getTime() -
                new Date(initialValues.start_time).getTime()) /
                1000
            ),
            currency: project?.currency ?? "USD",
            salary: project?.salary ?? 0,
          }}
          newTimeEntry={true}
          onSubmit={onTimeEntrySubmit}
          onOpenProjectForm={onOpenProjectForm}
          onProjectChange={onProjectChange}
          onCancel={onCancel}
          project={project}
        />
      )}
    </Stack>
  );
}
