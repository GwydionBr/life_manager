import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TimerData,
  useTimeTrackerManager,
} from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useIntl } from "@/hooks/useIntl";

import { Alert, Stack, Text } from "@mantine/core";
import { TimerState } from "@/types/timeTracker.types";
import TimeTrackerInstance from "./TimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
import { getStatusColor } from "@/lib/workHelperFunctions";
import { useSettings } from "@/db/collections/settings/settings-collection";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { WorkProject } from "@/types/work.types";

interface TimerManagerProps {
  isBig: boolean;
  isTimeTrackerMinimized: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
}

export default function TimerManager({
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimerManagerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const {
    getAllTimers,
    addTimer,
    timers: timerData,
    updateTimer,
  } = useTimeTrackerManager();
  const { activeProjectId } = useWorkStore();
  const { data: settings } = useSettings();
  const { getLocalizedText } = useIntl();
  const { data: projects, isReady: isProjectsReady } = useWorkProjects();

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  const [timers, setTimers] = useState<TimerData[]>([]);

  useEffect(() => {
    const allTimers = getAllTimers();
    const newTimers = allTimers.map((timer) => {
      if (timer.timerRoundingSettings === undefined) {
        updateTimer(timer.id, {
          timerRoundingSettings: {
            roundingInterval: settings?.rounding_interval ?? 0,
            roundingDirection: settings?.rounding_direction ?? "up",
            roundInTimeFragments: settings?.round_in_time_sections ?? false,
            timeFragmentInterval: settings?.time_section_interval ?? 0,
          },
        });
        const newTimer = {
          ...timer,
          timerRoundingSettings: {
            roundingInterval: settings?.rounding_interval ?? 0,
            roundingDirection: settings?.rounding_direction ?? "up",
            roundInTimeFragments: settings?.round_in_time_sections ?? false,
            timeFragmentInterval: settings?.time_section_interval ?? 0,
          },
        };
        return newTimer;
      }
      return timer;
    });

    setTimers(newTimers);
  }, [timerData, getAllTimers]);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddTimer = useCallback(
    (project: WorkProject) => {
      const result = addTimer(project, {
        roundingInterval: settings?.rounding_interval ?? 0,
        roundingDirection: settings?.rounding_direction ?? "up",
        roundInTimeFragments: settings?.round_in_time_sections ?? false,
        timeFragmentInterval: settings?.time_section_interval ?? 0,
      });

      if (!result.success) {
        setErrorMessage(
          result.error
            ? getLocalizedText(result.error.german, result.error.english)
            : getLocalizedText(
                "Timer konnte nicht hinzugefügt werden",
                "Failed to add timer"
              )
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    },
    [addTimer, settings, getLocalizedText]
  );

  useEffect(() => {
    if (timers.length === 0 && isProjectsReady) {
      if (activeProject) {
        handleAddTimer(activeProject);
      }
    }
  }, [timers, activeProject, handleAddTimer, isProjectsReady]);

  const isOneTimerRunning = timers.some(
    (timer) => timer.state === TimerState.Running
  );
  const isOneTimerPaused = timers.some(
    (timer) => timer.state === TimerState.Paused
  );

  const mainTimerStatus = isOneTimerRunning
    ? TimerState.Running
    : isOneTimerPaused
      ? TimerState.Paused
      : TimerState.Stopped;

  const activeTimerCount = timers.filter(
    (timer) =>
      timer.state === TimerState.Running || timer.state === TimerState.Paused
  ).length;

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <Stack align="center" gap="md" mb="md">
        <PlusActionIcon onClick={() => {}} />
        <TimeTrackerActionIcon
          action={() => {}}
          label={getLocalizedText("Timer verkleinern", "Minimize Timer")}
          indicatorLabel="0"
          state={TimerState.Stopped}
          getStatusColor={() => getStatusColor(TimerState.Stopped)}
        />
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md" mb="md">
      <PlusActionIcon
        onClick={() => {
          if (!activeProject) return;
          handleAddTimer(activeProject);
        }}
      />
      <TimeTrackerActionIcon
        action={() => setIsTimeTrackerMinimized(!isTimeTrackerMinimized)}
        label={
          isTimeTrackerMinimized
            ? getLocalizedText("Timer vergrößern", "Expand Timer")
            : getLocalizedText("Timer verkleinern", "Minimize Timer")
        }
        indicatorLabel={activeTimerCount.toString()}
        state={mainTimerStatus}
        getStatusColor={() => getStatusColor(mainTimerStatus)}
      />

      {errorMessage && (
        <Alert
          color="red"
          variant="filled"
          title={getLocalizedText("Fehler", "Error")}
          withCloseButton
          onClose={() => setErrorMessage(null)}
        >
          <Text>{errorMessage}</Text>
        </Alert>
      )}
      {timers
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((timer) => (
          <TimeTrackerInstance
            key={timer.id}
            timer={timer}
            isBig={isBig}
            isTimeTrackerMinimized={isTimeTrackerMinimized}
            setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
            forceEndTimer={timer.forceEndTimer}
          />
        ))}
    </Stack>
  );
}
