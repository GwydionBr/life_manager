import { useState, useEffect } from "react";
import { Stack, Text, Group, Textarea, Divider, Box } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useIntl } from "@/hooks/useIntl";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntryMutations } from "@/db/collections/work/work-time-entry/use-work-time-entry-mutations";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import {
  calculateAppointmentDuration,
  getProjectRoundingSettings,
} from "@/lib/appointmentTimerHelpers";
import { Appointment, InsertWorkTimeEntry } from "@/types/work.types";
import LocaleDateTimePicker from "@/components/UI/Locale/LocaleDateTimePicker";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import {
  showActionSuccessNotification,
  showActionErrorNotification,
} from "@/lib/toastFunctions";

interface ConvertToTimeEntryModalProps {
  appointment: Appointment;
  onClose: () => void;
}

interface FormValues {
  start_time: string;
  end_time: string;
  active_seconds: number;
  memo: string;
}

/**
 * Modal for converting an appointment to a work time entry.
 *
 * Allows the user to:
 * - Edit start and end times (pre-filled from appointment)
 * - Add a memo/note
 * - View calculated duration and payment
 * - Create the time entry and link it to the appointment
 */
export function ConvertToTimeEntryForm({
  appointment,
  onClose,
}: ConvertToTimeEntryModalProps) {
  const { getLocalizedText, formatMoney, formatDuration } = useIntl();
  const { data: projects } = useWorkProjects();
  const { data: settings } = useSettings();
  const { addWorkTimeEntry } = useWorkTimeEntryMutations();
  const { updateAppointment } = useAppointmentMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the project associated with this appointment
  const project = projects.find((p) => p.id === appointment.work_project_id);

  // Calculate initial duration from appointment
  const initialDuration = calculateAppointmentDuration(appointment);

  const form = useForm<FormValues>({
    initialValues: {
      start_time: appointment.start_date,
      end_time: appointment.end_date,
      active_seconds: initialDuration,
      memo: appointment.description || "",
    },
    validate: {
      start_time: (value) => {
        if (!value) {
          return getLocalizedText(
            "Startzeit ist erforderlich",
            "Start time is required"
          );
        }
        return null;
      },
      end_time: (value, values) => {
        if (!value) {
          return getLocalizedText(
            "Endzeit ist erforderlich",
            "End time is required"
          );
        }
        if (new Date(value) <= new Date(values.start_time)) {
          return getLocalizedText(
            "Endzeit muss nach Startzeit liegen",
            "End time must be after start time"
          );
        }
        return null;
      },
      active_seconds: (value) => {
        if (value < 0) {
          return getLocalizedText(
            "Dauer kann nicht negativ sein",
            "Duration cannot be negative"
          );
        }
        return null;
      },
    },
  });

  // Recalculate active_seconds when start or end time changes
  useEffect(() => {
    if (form.values.start_time && form.values.end_time) {
      const startDate = new Date(form.values.start_time);
      const endDate = new Date(form.values.end_time);
      const durationSeconds = Math.floor(
        (endDate.getTime() - startDate.getTime()) / 1000
      );

      if (durationSeconds >= 0) {
        form.setFieldValue("active_seconds", durationSeconds);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.start_time, form.values.end_time]);

  // Calculate payment if project and settings are available
  const calculatePayment = () => {
    if (!project) return "0.00";

    // Calculate payment based on active_seconds and project salary
    const hours = form.values.active_seconds / 3600;
    const payment = hours * project.salary;

    return payment.toFixed(2);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!project) {
      showActionErrorNotification(
        getLocalizedText("Projekt nicht gefunden", "Project not found")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Get rounding settings for the project
      const roundingSettings = getProjectRoundingSettings(project, {
        roundingInterval: settings?.rounding_interval ?? 0,
        roundingDirection: settings?.rounding_direction ?? "up",
        roundInTimeFragments: settings?.round_in_time_sections ?? false,
        timeFragmentInterval: settings?.time_section_interval ?? 15,
      });

      // Create the time entry
      const newTimeEntry: InsertWorkTimeEntry = {
        work_project_id: project.id,
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        true_end_time: new Date(values.end_time).toISOString(),
        active_seconds: values.active_seconds,
        salary: project.salary,
        currency: project.currency,
        hourly_payment: project.hourly_payment,
        memo: values.memo || null,
        paid: false,
        payout_id: null,
      };

      // Add the time entry
      const result = await addWorkTimeEntry(newTimeEntry, roundingSettings);

      if (result && result.length > 0) {
        // Update the appointment with the time entry ID and status
        await updateAppointment(appointment.id, {
          work_time_entry_id: result[0].id,
        });

        showActionSuccessNotification(
          getLocalizedText(
            "Termin erfolgreich in Zeiteintrag umgewandelt",
            "Appointment successfully converted to time entry"
          )
        );

        onClose();
      } else {
        throw new Error("Failed to create time entry");
      }
    } catch (error) {
      console.error("Error converting appointment to time entry:", error);
      showActionErrorNotification(
        getLocalizedText(
          "Fehler beim Umwandeln des Termins",
          "Error converting appointment"
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) {
    return null;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Box>
          <Text size="sm" fw={500} mb="xs">
            {getLocalizedText("Projekt", "Project")}
          </Text>
          <Text size="sm" c="dimmed">
            {project.title}
          </Text>
        </Box>

        <LocaleDateTimePicker
          label={getLocalizedText("Startzeit", "Start Time")}
          value={
            form.values.start_time ? new Date(form.values.start_time) : null
          }
          onChange={(value) =>
            form.setFieldValue(
              "start_time",
              value ? new Date(value).toISOString() : ""
            )
          }
          error={form.errors.start_time}
          withAsterisk
        />

        <LocaleDateTimePicker
          label={getLocalizedText("Endzeit", "End Time")}
          value={form.values.end_time ? new Date(form.values.end_time) : null}
          onChange={(value) =>
            form.setFieldValue(
              "end_time",
              value ? new Date(value).toISOString() : ""
            )
          }
          error={form.errors.end_time}
          withAsterisk
        />

        <Textarea
          label={getLocalizedText("Notiz", "Memo")}
          placeholder={getLocalizedText(
            "Notiz hinzufügen (optional)",
            "Add a note (optional)"
          )}
          {...form.getInputProps("memo")}
          minRows={3}
        />

        <Divider />

        <Group justify="space-between">
          <Box>
            <Text size="sm" fw={500}>
              {getLocalizedText("Dauer", "Duration")}
            </Text>
            <Text size="lg" fw={700} c="blue">
              {formatDuration(form.values.active_seconds)}
            </Text>
          </Box>

          {project.hourly_payment && (
            <Box ta="right">
              <Text size="sm" fw={500}>
                {getLocalizedText("Vergütung", "Payment")}
              </Text>
              <Text size="lg" fw={700} c="teal">
                {formatMoney(parseFloat(calculatePayment()), project.currency)}
              </Text>
            </Box>
          )}
        </Group>

        <Divider />

        <Group justify="flex-end" gap="sm">
          <CancelButton onClick={onClose} disabled={isSubmitting} />
          <CreateButton
            onClick={() => {}}
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {getLocalizedText("Umwandeln", "Convert")}
          </CreateButton>
        </Group>
      </Stack>
    </form>
  );
}
