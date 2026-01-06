import { useCallback, useEffect, useMemo, useState } from "react";
import { useMounted } from "@mantine/hooks";
import {
  TimerData,
  useTimeTrackerManager,
} from "@/stores/timeTrackerManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useIntl } from "@/hooks/useIntl";

import {
  Alert,
  alpha,
  Group,
  Select,
  Stack,
  Text,
  Box,
  getThemeColor,
  useMantineTheme,
} from "@mantine/core";
import { TimerState } from "@/types/timeTracker.types";
import TimeTrackerInstance from "./TimeTrackerInstance";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import TimeTrackerActionIcon from "./TimeTrackerActionIcons/TimeTrackerActionIcon";
import { getStatusColor } from "@/lib/workHelperFunctions";
import { useSettings } from "@/db/collections/settings/settings-collection";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { WorkProject } from "@/types/work.types";
import classes from "./TimeTracker.module.css";

/**
 * Props for the TimeTrackerManager component.
 *
 * This is the main container component that manages multiple timer instances.
 */
interface TimerManagerProps {
  isBig: boolean; // Whether to show timers in big or small mode
  isTimeTrackerMinimized: boolean; // Whether timers are minimized
  setIsTimeTrackerMinimized: (value: boolean) => void; // Callback to toggle minimized state
}

/**
 * TimeTrackerManager Component
 *
 * Main container component that manages multiple timer instances. It:
 * - Displays all active timers from the store
 * - Provides UI to add new timers
 * - Shows a summary icon with timer count and status
 * - Automatically creates a timer for the active project if none exist
 * - Handles error messages when timer creation fails
 * - Ensures timers have proper rounding settings
 *
 * The component uses a two-tier state management:
 * 1. Zustand store (timerData) - persisted timer data
 * 2. Local state (timers) - processed/enriched timer data for rendering
 */
export default function TimerManager({
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimerManagerProps) {
  const theme = useMantineTheme();
  const isMounted = useMounted();
  // Error message state for displaying validation errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { currentAppColor } = useSettingsStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // Store functions and data
  const {
    getAllTimers,
    addTimer,
    timers: timerData, // Raw timer data from store
    updateTimer,
  } = useTimeTrackerManager();

  // Get active project from work store
  const { activeProjectId } = useWorkStore();

  // Fetch settings for default rounding configuration
  const { data: settings } = useSettings();

  // Internationalization helper
  const { getLocalizedText } = useIntl();

  // Fetch projects data
  const { data: projects, isReady: isProjectsReady } = useWorkProjects();

  // Find the currently active project
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  const backgroundColor = useMemo(() => {
    return alpha(getThemeColor(currentAppColor, theme), 0.4);
  }, [currentAppColor, theme]);

  // Local state for processed timers (with ensured rounding settings)
  const [timers, setTimers] = useState<TimerData[]>([]);

  /**
   * Process timers and ensure they have rounding settings.
   *
   * This effect:
   * 1. Gets all timers from the store
   * 2. Checks if any timer is missing rounding settings
   * 3. Updates the store with default settings if missing
   * 4. Updates local state with processed timers
   *
   * This is a migration/safety mechanism to ensure old timers (created
   * before rounding settings were required) get proper defaults.
   *
   * Improvement suggestion: This could be moved to the store's addTimer
   * method or a migration function to ensure timers always have settings
   * from the start, eliminating the need for this check.
   */
  useEffect(() => {
    const allTimers = getAllTimers();
    const newTimers = allTimers.map((timer) => {
      // Check if timer is missing rounding settings (legacy timer)
      if (timer.timerRoundingSettings === undefined) {
        // Update store with default rounding settings
        updateTimer(timer.id, {
          timerRoundingSettings: {
            roundingInterval: settings?.rounding_interval ?? 0,
            roundingDirection: settings?.rounding_direction ?? "up",
            roundInTimeFragments: settings?.round_in_time_sections ?? false,
            timeFragmentInterval: settings?.time_section_interval ?? 0,
          },
        });
        // Return timer with settings for local state
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

  /**
   * Handler for adding a new timer.
   *
   * This function:
   * 1. Attempts to add a timer for the given project
   * 2. Uses default rounding settings from global settings
   * 3. Displays localized error messages if creation fails
   * 4. Auto-dismisses error messages after 5 seconds
   *
   * @param project - The project to create a timer for
   *
   * Improvement suggestion: Consider showing a success notification
   * when timer is created successfully for better UX feedback.
   */
  const handleAddTimer = useCallback(
    (project: WorkProject) => {
      // Attempt to add timer with default rounding settings
      const result = addTimer(project, {
        roundingInterval: settings?.rounding_interval ?? 0,
        roundingDirection: settings?.rounding_direction ?? "up",
        roundInTimeFragments: settings?.round_in_time_sections ?? false,
        timeFragmentInterval: settings?.time_section_interval ?? 0,
      });

      // Handle errors with localized messages
      if (!result.success) {
        setErrorMessage(
          result.error
            ? getLocalizedText(result.error.german, result.error.english)
            : getLocalizedText(
                "Timer konnte nicht hinzugefügt werden",
                "Failed to add timer"
              )
        );
        // Auto-dismiss error after 5 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
      setSelectedProjectId(null);
    },
    [addTimer, settings, getLocalizedText]
  );

  /**
   * Auto-create timer for active project if none exist.
   *
   * This effect automatically creates a timer for the active project
   * when:
   * - No timers exist (timers.length === 0)
   * - Projects data is ready (isProjectsReady)
   * - An active project is selected (activeProject exists)
   *
   * This provides a better UX by automatically setting up a timer
   * when the user navigates to the work section with a project selected.
   */
  useEffect(() => {
    if (timers.length === 0 && isProjectsReady) {
      if (activeProject) {
        handleAddTimer(activeProject);
      }
    }
  }, [timers, activeProject, isProjectsReady, handleAddTimer]);

  useEffect(() => {
    if (activeProject) {
      setSelectedProjectId(activeProject.id);
    }
  }, [activeProject]);

  /**
   * Calculate aggregate timer states for the summary icon.
   *
   * These computed values determine the status and count shown in the
   * TimeTrackerActionIcon. The priority is:
   * 1. Running (if any timer is running)
   * 2. Paused (if any timer is paused but none running)
   * 3. Stopped (if all timers are stopped)
   */
  const isOneTimerRunning = timers.some(
    (timer) => timer.state === TimerState.Running
  );
  const isOneTimerPaused = timers.some(
    (timer) => timer.state === TimerState.Paused
  );

  // Determine main status: Running > Paused > Stopped
  const mainTimerStatus = isOneTimerRunning
    ? TimerState.Running
    : isOneTimerPaused
      ? TimerState.Paused
      : TimerState.Stopped;

  // Count active timers (running or paused) for the indicator badge
  const activeTimerCount = timers.filter(
    (timer) =>
      timer.state === TimerState.Running || timer.state === TimerState.Paused
  ).length;

  /**
   * Render loading/placeholder state during SSR hydration.
   *
   * Shows a skeleton UI with disabled actions until client-side
   * hydration is complete. This prevents SSR mismatches with
   * persisted store data.
   */
  if (!isMounted) {
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

  /**
   * Main render: Timer management UI.
   *
   * Displays:
   * - Add timer button (PlusActionIcon)
   * - Summary icon with timer count and status (TimeTrackerActionIcon)
   * - Error alerts (if timer creation fails)
   * - All timer instances (sorted by creation date, newest first)
   *
   * Timers are sorted by createdAt in descending order, so the
   * most recently created timer appears first.
   */
  return (
    <Stack align="center" gap="md" mb="md">
      <Box className={classes.toolbar}>
        <Group
          p="xs"
          align="center"
          justify="space-between"
          bg={backgroundColor}
        >
          {/* Summary icon showing timer count and aggregate status */}
          <TimeTrackerActionIcon
            action={() => setIsTimeTrackerMinimized(!isTimeTrackerMinimized)}
            minimized={isTimeTrackerMinimized}
            label={
              isTimeTrackerMinimized
                ? getLocalizedText("Timer vergrößern", "Expand Timer")
                : getLocalizedText("Timer verkleinern", "Minimize Timer")
            }
            indicatorLabel={activeTimerCount.toString()}
            state={mainTimerStatus}
            getStatusColor={() => getStatusColor(mainTimerStatus)}
          />
          {isBig && (
            <Select
              w={210}
              placeholder={getLocalizedText(
                "Projekt auswählen",
                "Select project"
              )}
              data={projects
                .filter(
                  (p) =>
                    p.id !== timers.find((t) => t.projectId === p.id)?.projectId
                )
                .map((p) => ({
                  label: p.title,
                  value: p.id,
                }))}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              searchable
              leftSection={
                <Text fz="xs" c="dimmed">
                  {timers.length}/10
                </Text>
              }
              rightSectionPointerEvents="auto"
              rightSection={
                <PlusActionIcon
                  onClick={() => {
                    if (!selectedProjectId) return;
                    const selectedProject = projects.find(
                      (p) => p.id === selectedProjectId
                    )!;
                    if (!selectedProject) return;
                    handleAddTimer(selectedProject);
                  }}
                />
              }
              styles={{
                input: {
                  textAlign: "center",
                  textOverflow: "ellipsis",
                  fontSize: "var(--mantine-font-size-md)",
                  backgroundColor: alpha("var(--mantine-color-body)", 0.5),
                  borderRadius: "var(--mantine-radius-lg)",
                  border: "none",
                },
              }}
            />
          )}
        </Group>
      </Box>

      {/* Error alert - shown when timer creation fails */}
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

      {/* Render all timer instances, sorted by creation date (newest first) */}
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
