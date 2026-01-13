import { Appointment, WorkProject } from "@/types/work.types";
import { TimerData } from "@/stores/timeTrackerManagerStore";
import { TimerRoundingSettings } from "@/types/timeTracker.types";

/**
 * Result of starting a timer from an appointment.
 */
export interface StartTimerResult {
  success: boolean;
  timerId?: string;
  error?: {
    german: string;
    english: string;
  };
}

/**
 * Validates if an appointment can start a timer.
 *
 * Checks:
 * - Appointment has a work_project_id
 * - Appointment doesn't already have a work_time_entry_id
 *
 * @param appointment - The appointment to validate
 * @returns True if timer can be started, false otherwise
 */
export function canStartTimerFromAppointment(
  appointment: Appointment
): boolean {
  return Boolean(
    appointment.work_project_id && !appointment.work_time_entry_id
  );
}

/**
 * Checks if a timer should be shown for an appointment.
 *
 * @param appointment - The appointment to check
 * @param existingTimers - Array of existing timers
 * @returns True if timer button should be shown
 */
export function shouldShowTimerButton(
  appointment: Appointment,
  existingTimers: TimerData[]
): boolean {
  // Must be able to start timer
  if (!canStartTimerFromAppointment(appointment)) {
    return false;
  }

  // Check if timer already exists for this project
  const hasExistingTimer = existingTimers.some(
    (timer) => timer.projectId === appointment.work_project_id
  );

  return !hasExistingTimer;
}

/**
 * Validates appointment status for timer operations.
 *
 * @param appointment - The appointment to check
 * @returns True if appointment is in a valid status for timer operations
 */
export function isAppointmentTimerEligible(appointment: Appointment): boolean {
  // Can start timer if upcoming or active
  return appointment.status === "upcoming" || appointment.status === "active";
}

/**
 * Checks if an appointment can be converted to a time entry.
 *
 * @param appointment - The appointment to check
 * @returns True if appointment can be converted
 */
export function canConvertAppointmentToTimeEntry(
  appointment: Appointment
): boolean {
  // Must have project
  if (!appointment.work_project_id) {
    return false;
  }

  // Must not already have a time entry
  if (appointment.work_time_entry_id) {
    return false;
  }

  // Status must not be upcoming (only convert past/active appointments)
  if (appointment.status === "upcoming") {
    return false;
  }

  return true;
}

/**
 * Checks if an appointment should show the auto-prompt for conversion.
 *
 * @param appointment - The appointment to check
 * @returns True if auto-prompt should be shown
 */
export function shouldShowConversionPrompt(appointment: Appointment): boolean {
  if (!canConvertAppointmentToTimeEntry(appointment)) {
    return false;
  }

  const now = new Date().toISOString();

  // Show prompt if:
  // - Appointment end_date has passed
  // - Status is missed or active
  return (
    now > appointment.end_date &&
    (appointment.status === "finished" || appointment.status === "active")
  );
}

/**
 * Calculates the duration in seconds between appointment start and end dates.
 *
 * @param appointment - The appointment to calculate duration for
 * @returns Duration in seconds
 */
export function calculateAppointmentDuration(appointment: Appointment): number {
  const startDate = new Date(appointment.start_date);
  const endDate = new Date(appointment.end_date);

  return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
}

/**
 * Gets the rounding settings for a project.
 *
 * @param project - The work project
 * @param defaultSettings - Default rounding settings to use as fallback
 * @returns Timer rounding settings
 */
export function getProjectRoundingSettings(
  project: WorkProject,
  defaultSettings: TimerRoundingSettings
): TimerRoundingSettings {
  // If project has specific rounding settings, use those
  if (
    project.rounding_interval !== null &&
    project.rounding_direction !== null
  ) {
    return {
      roundingInterval: project.rounding_interval,
      roundingDirection: project.rounding_direction,
      roundInTimeFragments: project.round_in_time_fragments ?? false,
      timeFragmentInterval: project.time_fragment_interval ?? 15,
    };
  }

  // Otherwise use default settings
  return defaultSettings;
}
