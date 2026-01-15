import { useEffect, useCallback, useState, useMemo } from "react";
import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useSettings } from "@/db/collections/settings/use-settings-query";

import {
  secondsToTimerFormat,
  getRoundedSeconds,
} from "@/lib/workHelperFunctions";

import { Timer, useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { Currency } from "@/types/settings.types";
import { InsertWorkTimeEntry } from "@/types/work.types";
import { getProjectRoundingSettings } from "@/lib/appointmentTimerHelpers";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import { calculateSessionTimeValues } from "@/lib/timeTrackerFunctions";

interface TimeTrackerStateData extends Timer {
  // Timer data
  activeTime: string;
  roundedActiveTime: string;
  activeSeconds: number;
  moneyEarned?: string;
  effectiveStartTime?: number;
  effectiveEndTime?: number;

  // Appointment data
  appointmentTitle?: string;

  // Project data
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
}

export interface TimeTrackerState extends TimeTrackerStateData {
  timerRoundingSettings: TimerRoundingSettings;
}

interface TimeTrackerReturn {
  timerState: TimeTrackerState;
  getCurrentTimeEntry: () => InsertWorkTimeEntry;
}

export function useTimeTracker(timer: Timer): TimeTrackerReturn {
  const { data: appointments } = useAppointments();
  const { data: workProjects } = useWorkProjects();
  const { data: settings } = useSettings();
  const { updateTimerData } = useTimeTrackerManager();

  const project = useMemo(
    () => workProjects.find((p) => p.id === timer.projectId),
    [workProjects, timer.projectId]
  );

  const appointment = useMemo(
    () => appointments?.find((a) => a.id === timer.appointmentId),
    [appointments, timer.appointmentId]
  );

  const [timerState, setTimerState] = useState<TimeTrackerStateData>({
    ...timer,
    projectTitle: project?.title ?? "",
    currency: project?.currency ?? "USD",
    salary: project?.salary ?? 0,
    hourlyPayment: project?.hourly_payment ?? false,
    activeTime: "00:00",
    roundedActiveTime: "00:00",
    activeSeconds: 0,
    appointmentId: timer.appointmentId,
    appointmentTitle: appointment?.title,
  });

  const timerRoundingSettings: TimerRoundingSettings = useMemo(() => {
    if (timer.timerRoundingSettings) {
      return timer.timerRoundingSettings;
    } else if (project) {
      return getProjectRoundingSettings(project, {
        roundingInterval: settings?.rounding_interval ?? 1,
        roundingDirection: settings?.rounding_direction ?? "up",
        roundInTimeFragments: settings?.round_in_time_sections ?? false,
        timeFragmentInterval: settings?.time_section_interval ?? 15,
      });
    }
    return {
      roundingInterval: settings?.rounding_interval ?? 1,
      roundingDirection: settings?.rounding_direction ?? "up",
      roundInTimeFragments: settings?.round_in_time_sections ?? false,
      timeFragmentInterval: settings?.time_section_interval ?? 15,
    };
  }, [project, settings, timer.timerRoundingSettings]);

  // Reset timer state to initial values
  const resetTimer = useCallback(() => {
    setTimerState({
      ...timer,
      activeSeconds: 0,
      activeTime: "00:00",
      roundedActiveTime: "00:00",
      moneyEarned: undefined,
      effectiveStartTime: undefined,
      effectiveEndTime: undefined,
      appointmentTitle: undefined,
      projectTitle: project?.title ?? "",
      currency: project?.currency ?? "USD",
      salary: project?.salary ?? 0,
      hourlyPayment: project?.hourly_payment ?? false,
    });
  }, [timer, project]);

  // Calculate timer values based on current state
  const calculateTimerValues = useCallback(() => {
    const isRunning = timer.state === TimerState.Running;

    if (!timer.startTime) {
      return {
        activeSeconds: 0,
        activeTime: "00:00",
        roundedActiveTime: "00:00",
        moneyEarned: undefined,
        effectiveStartTime: undefined,
        effectiveEndTime: undefined,
      };
    }

    // Apply delta adjustments (in seconds) to start and end times
    // deltaStartTime and deltaEndTime can be negative, positive, or 0
    // They allow users to adjust the timer if they started/stopped it at the wrong time
    const effectiveStartTime = timer.startTime + timer.deltaStartTime * 1000;
    const actualEndTime = isRunning ? Date.now() : timer.startTime;
    const effectiveEndTime = actualEndTime + timer.deltaEndTime * 1000;

    // Calculate active seconds
    const activeSeconds = Math.max(
      0,
      Math.floor((effectiveEndTime - effectiveStartTime) / 1000)
    );

    // Calculate rounded seconds
    const roundedSeconds = getRoundedSeconds(
      activeSeconds,
      timerRoundingSettings.roundingInterval,
      timerRoundingSettings.roundingDirection
    );

    // Format time strings
    const activeTime = secondsToTimerFormat(activeSeconds);
    const roundedActiveTime = secondsToTimerFormat(roundedSeconds);

    // Calculate money earned if project has salary
    let moneyEarned: string | undefined;
    if (project?.salary) {
      const hours = roundedSeconds / 3600;
      const earned = project.hourly_payment
        ? hours * project.salary
        : (hours / 160) * project.salary; // Assuming 160 hours per month for non-hourly
      moneyEarned = earned.toFixed(2);
    }
    updateTimerData(timer.id, {
      activeSeconds,
    });

    // TODO This does not work properly when several timers are running
    // --- Show ProjectTitle and ActiveTime in tab (document title) ---
    if (typeof window !== "undefined" && project?.title && activeTime) {
      document.title = `${activeTime} - ${project.title}`;
    }

    return {
      activeSeconds,
      activeTime,
      roundedActiveTime,
      moneyEarned,
      effectiveStartTime,
      effectiveEndTime,
    };
  }, [timer, project, timerRoundingSettings, updateTimerData]);

  // Update timer state when running
  useEffect(() => {
    if (timer.state !== TimerState.Running) {
      resetTimer();
      return;
    }

    // Update immediately when starting
    const updateTimer = () => {
      const values = calculateTimerValues();
      setTimerState((prev) => ({
        ...prev,
        ...timer,
        ...values,
        appointmentTitle: appointment?.title,
        projectTitle: project?.title ?? "",
        currency: project?.currency ?? "USD",
        salary: project?.salary ?? 0,
        hourlyPayment: project?.hourly_payment ?? false,
      }));
    };

    updateTimer();

    // Set up interval for running timer
    const interval = setInterval(updateTimer, 500);

    return () => clearInterval(interval);
  }, [timer, appointment, project, calculateTimerValues, resetTimer]);

  const getCurrentTimeEntry = useCallback(() => {
    // Calculate the effective start and end times with delta adjustments
    const effectiveStartTime = timer.startTime
      ? timer.startTime + timer.deltaStartTime * 1000
      : Date.now();

    const { finalActiveSeconds, normalizedStartTime, calculatedEndTime } =
      calculateSessionTimeValues(
        timerState.activeSeconds,
        effectiveStartTime,
        timerRoundingSettings
      );

    const timeEntry: InsertWorkTimeEntry = {
      start_time: normalizedStartTime.toISOString(),
      end_time: calculatedEndTime.toISOString(),
      active_seconds: finalActiveSeconds,
      currency: project?.currency ?? "USD",
      salary: project?.salary ?? 0,
      hourly_payment: project?.hourly_payment ?? false,
      memo: timer.memo,
      work_project_id: timer.projectId,
      id: timer.id,
      created_at: new Date().toISOString(),
      true_end_time: new Date().toISOString(),
    };
    return timeEntry;
  }, [timer, project, timerState.activeSeconds, timerRoundingSettings]);

  return {
    timerState: {
      ...timerState,
      timerRoundingSettings,
    },
    getCurrentTimeEntry,
  };
}
