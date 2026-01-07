import { useState, useEffect, useCallback, useMemo } from "react";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useSettings } from "@/db/collections/settings/use-settings-query";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntryMutations } from "@/db/collections/work/work-time-entry/use-work-time-entry-mutations";
import {
  useTimeTrackerManager,
  TimerData,
} from "@/stores/timeTrackerManagerStore";

import { alpha, Box, Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./Big/TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./Small/TimeTrackerComponentSmall";

import { TimerState } from "@/types/timeTracker.types";
import { InsertWorkTimeEntry } from "@/types/work.types";

/**
 * Props for the TimeTrackerInstance component.
 *
 * This component represents a single timer instance that can be displayed
 * in either big or small mode, with the ability to be minimized.
 */
interface TimeTrackerInstanceProps {
  timer: TimerData; // Timer data from the store
  isBig: boolean; // Whether to show the big or small component
  isTimeTrackerMinimized: boolean; // Whether the timer is minimized (affects big component display)
  forceEndTimer: boolean; // Flag to force end the timer (e.g., when max timers reached)
  setIsTimeTrackerMinimized: (value: boolean) => void; // Callback to toggle minimized state
}

/**
 * TimeTrackerInstance Component
 *
 * This component manages a single timer instance. It:
 * - Wraps the useTimeTracker hook to manage timer state
 * - Syncs timer state between the hook and the Zustand store
 * - Handles timer submission to the database
 * - Manages automatic stopping of other timers when starting
 * - Displays either the big or small timer component based on props
 *
 * The component uses a two-way sync pattern:
 * 1. Hook state is synced to store (for persistence)
 * 2. Store updates trigger hook re-initialization
 *
 * Improvement suggestion: Consider using a reducer pattern or state machine
 * to better manage the complex state synchronization between hook and store.
 */
export default function TimeTrackerInstance({
  timer,
  isBig,
  isTimeTrackerMinimized,
  forceEndTimer,
  setIsTimeTrackerMinimized,
}: TimeTrackerInstanceProps) {
  // Client-side hydration flag (prevents SSR mismatches)
  const [isClient, setIsClient] = useState(false);
  // Local memo state (synced with timer.memo but managed locally for editing)
  const [memo, setMemo] = useState<string>(timer.memo ?? "");

  // Store functions for managing timers
  const { updateTimer, removeTimer, setForceEndTimer, getAllTimers } =
    useTimeTrackerManager();

  // Fetch projects to get project details (color, etc.)
  const { data: projects } = useWorkProjects();

  // Find the project associated with this timer
  const project = useMemo(
    () => projects.find((p) => p.id === timer.projectId),
    [projects, timer.projectId]
  );

  const { addWorkTimeEntry } = useWorkTimeEntryMutations();

  // Commented out: Future mutation hook for creating work time entries
  // const {
  //   mutate: createWorkTimeEntryMutation,
  //   isPending: isCreatingWorkTimeEntry,
  // } = useCreateWorkTimeEntryMutation({
  //   onSuccess: () => {
  //     stopTimer();
  //     setMemo("");
  //   },
  // });

  // Fetch settings for rounding configuration
  const { data: settings } = useSettings();

  // State for small component visibility (used in TimeTrackerComponentSmall)
  const [showSmall, setShowSmall] = useState(true);

  /**
   * Stops all other running timers.
   *
   * This is used when starting a timer and the setting
   * `automaticly_stop_other_timer` is enabled. It ensures only one
   * timer can run at a time by setting the forceEndTimer flag on
   * all other running timers.
   *
   * Improvement suggestion: Consider moving this logic to the store
   * as a method like `stopAllOtherTimers(timerId)` for better
   * separation of concerns.
   */
  const stopOtherRunningTimers = useCallback(() => {
    const allTimers = getAllTimers();
    allTimers.forEach((otherTimer) => {
      // Skip current timer and only stop running timers
      if (
        otherTimer.id !== timer.id &&
        otherTimer.state === TimerState.Running
      ) {
        setForceEndTimer(otherTimer.id, true);
      }
    });
  }, [timer, getAllTimers, setForceEndTimer]);

  /**
   * Initialize the useTimeTracker hook with timer data from the store.
   *
   * This hook manages all timer logic (start, pause, resume, stop, time calculations).
   * The initial state comes from the persisted store, allowing timers to survive
   * page reloads.
   *
   * All timer state values are passed from the store to initialize the hook,
   * creating a bridge between persisted storage and reactive timer logic.
   */
  const {
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    roundedActiveTime,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
    timerRoundingSettings,
    tempTimerRoundingSettings,
    modifyActiveSeconds,
    modifyPausedSeconds,
    getCurrentSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    restoreTimer,
    setTimerRounding,
    setTempTimerRounding,
  } = useTimeTracker({
    projectId: timer.projectId,
    projectTitle: timer.projectTitle,
    currency: timer.currency,
    salary: timer.salary,
    hourlyPayment: timer.hourlyPayment,
    userId: timer.userId,
    timerRoundingSettings: timer.timerRoundingSettings,
    moneyEarned: timer.moneyEarned,
    activeTime: timer.activeTime,
    roundedActiveTime: timer.roundedActiveTime,
    pausedTime: timer.pausedTime,
    state: timer.state,
    activeSeconds: timer.activeSeconds,
    pausedSeconds: timer.pausedSeconds,
    startTime: timer.startTime,
    tempStartTime: timer.tempStartTime,
    storedActiveSeconds: timer.storedActiveSeconds,
    storedPausedSeconds: timer.storedPausedSeconds,
    memo: timer.memo,
  });

  /**
   * Sync hook state to store (one-way: hook -> store).
   *
   * This effect keeps the persisted store in sync with the hook's state.
   * Whenever any timer value changes in the hook, it's immediately
   * persisted to the store. This ensures:
   * - Timer state survives page reloads
   * - Multiple components can access the same timer state
   * - Timer data is always up-to-date in the store
   *
   * Note: This creates a sync loop pattern where:
   * 1. Store initializes hook
   * 2. Hook updates trigger store updates
   * 3. Store updates could trigger hook re-initialization (if timer prop changes)
   *
   * Improvement suggestion: Consider debouncing store updates or using
   * a more sophisticated sync mechanism to prevent unnecessary re-renders.
   */
  useEffect(() => {
    updateTimer(timer.id, {
      state,
      activeTime,
      pausedTime,
      moneyEarned,
      activeSeconds,
      pausedSeconds,
      startTime,
      tempStartTime,
      storedActiveSeconds,
      storedPausedSeconds,
      memo,
    });
  }, [
    timer.id,
    updateTimer,
    state,
    activeTime,
    pausedTime,
    moneyEarned,
    activeSeconds,
    pausedSeconds,
    startTime,
    tempStartTime,
    storedActiveSeconds,
    storedPausedSeconds,
    memo,
  ]);

  /**
   * Sync project settings to timer when project data is available.
   *
   * This effect updates the timer's rounding settings and project title
   * when project data is loaded or changes. Settings priority:
   * 1. Project-specific settings (highest priority)
   * 2. Global settings (fallback)
   * 3. Default values (last resort)
   *
   * This ensures the timer always uses the most up-to-date project
   * configuration, even if project settings change while the timer is running.
   */
  useEffect(() => {
    if (project) {
      // Merge rounding settings with priority: project > settings > defaults
      const newTimerRoundingSettings = {
        ...timerRoundingSettings,
        roundingDirection:
          project.rounding_direction ?? settings?.rounding_direction ?? "up",
        roundingInterval:
          project.rounding_interval ?? settings?.rounding_interval ?? 0,
        roundInTimeFragments:
          project.round_in_time_fragments ??
          settings?.round_in_time_sections ??
          false,
        timeFragmentInterval:
          project.time_fragment_interval ??
          settings?.time_section_interval ??
          0,
      };
      // Update store with new settings and project title
      updateTimer(timer.id, {
        projectTitle: project.title,
        timerRoundingSettings: newTimerRoundingSettings,
      });
      // Update hook's rounding settings
      setTimerRounding(newTimerRoundingSettings);
    }
  }, [project, settings]);

  /**
   * Enhanced start timer function that stops other running timers.
   *
   * Wraps the base startTimer function with logic to automatically
   * stop other running timers if the setting is enabled. This ensures
   * only one timer runs at a time (if desired).
   *
   * The default behavior (if setting is undefined) is to stop other timers.
   */
  const startTimerWithStopOthers = useCallback(() => {
    // Check if automatic stopping is enabled (defaults to true)
    if (settings?.automaticly_stop_other_timer ?? true) {
      stopOtherRunningTimers();
    }
    startTimer();
  }, [
    stopOtherRunningTimers,
    startTimer,
    settings?.automaticly_stop_other_timer,
  ]);

  /**
   * Restore timer on mount and set client-side flag.
   *
   * This effect:
   * 1. Restores the timer's update loop (important after page reload)
   * 2. Sets isClient to true to enable client-side rendering
   *
   * The restoreTimer call ensures that if a timer was running before
   * a page reload, it continues to update correctly.
   */
  useEffect(() => {
    restoreTimer();
    setIsClient(true);
  }, []);

  /**
   * Handle force end timer flag.
   *
   * When forceEndTimer is set to true (e.g., when max timers reached),
   * this effect automatically submits the timer and resets the flag.
   *
   * This allows the parent component to force-end a timer by setting
   * the flag, which is useful for enforcing business rules like
   * maximum concurrent timers.
   */
  useEffect(() => {
    if (forceEndTimer) {
      submitTimer();
      setForceEndTimer(timer.id, false);
    }
  }, [forceEndTimer]);

  // Don't render until client-side hydration is complete (prevents SSR mismatches)
  if (!isClient) return null;

  /**
   * Submits the timer session to the database.
   *
   * This function:
   * 1. Gets the current session data from the hook (includes rounding calculations)
   * 2. Inserts a new work time entry into the database
   * 3. Stops the timer and clears the memo
   *
   * Note: Currently uses direct collection insert. There's a TODO to implement
   * a proper mutation hook (createWorkTimeEntryMutation) for better error
   * handling and optimistic updates.
   *
   * Improvement suggestions:
   * - Implement the mutation hook for better error handling
   * - Add loading state to prevent double submissions
   * - Add error handling and user feedback
   * - Consider using getCurrentSession() data more directly instead of
   *   manually constructing the entry
   */
  async function submitTimer() {
    // Prevent double submission (commented out until mutation hook is implemented)
    // if (isCreatingWorkTimeEntry) return;

    // Get session data from hook (includes proper rounding calculations)
    let newSession: InsertWorkTimeEntry = {
      ...getCurrentSession(),
      memo: memo === "" ? null : memo,
    };

    await addWorkTimeEntry(
      newSession,
      tempTimerRoundingSettings ?? timerRoundingSettings
    );

    // Reset timer state after submission
    stopTimer();
    setMemo("");
  }

  /**
   * Render the timer component.
   *
   * Uses Mantine's Transition component to smoothly switch between
   * big and small timer views. Only one view is mounted at a time
   * based on the isBig prop.
   *
   * Both components receive:
   * - Timer state and time values
   * - Control functions (start, pause, resume, stop, modify)
   * - Project styling (color, background)
   * - Rounding settings (temp settings take precedence)
   *
   * The big component also receives memo editing and minimization controls.
   */
  return (
    <Box>
      {/* Big timer component - shown when isBig is true */}
      <Transition
        mounted={isBig}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={styles}>
            <TimeTrackerComponentBig
              timer={timer}
              color={project?.color ?? null}
              backgroundColor={
                project?.color
                  ? alpha(project.color, 0.1)
                  : "var(--mantine-color-body)"
              }
              removeTimer={() => removeTimer(timer.id)}
              moneyEarned={moneyEarned}
              roundedActiveTime={roundedActiveTime}
              state={state}
              memo={memo}
              activeTime={activeTime}
              pausedTime={pausedTime}
              activeSeconds={activeSeconds}
              timerRoundingSettings={
                tempTimerRoundingSettings ?? timerRoundingSettings
              }
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              startTimer={startTimerWithStopOthers}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              cancelTimer={cancelTimer}
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              isSubmitting={false}
              setMemo={setMemo}
              submitTimer={submitTimer}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setTempTimerRounding={setTempTimerRounding}
            />
          </div>
        )}
      </Transition>

      {/* Small timer component - shown when isBig is false */}
      <Transition
        mounted={!isBig}
        transition="fade"
        duration={200}
        enterDelay={200}
      >
        {(styles) => (
          <div style={styles}>
            <TimeTrackerComponentSmall
              color={project?.color ?? null}
              backgroundColor={
                project?.color
                  ? alpha(project.color, 0.1)
                  : "var(--mantine-color-body)"
              }
              roundedActiveTime={roundedActiveTime}
              state={state}
              activeTime={activeTime}
              pausedTime={pausedTime}
              activeSeconds={activeSeconds}
              timerRoundingSettings={
                tempTimerRoundingSettings ?? timerRoundingSettings
              }
              projectTitle={timer.projectTitle}
              salary={timer.salary}
              currency={timer.currency}
              hourlyPayment={timer.hourlyPayment}
              storedActiveSeconds={storedActiveSeconds}
              storedPausedSeconds={storedPausedSeconds}
              modifyActiveSeconds={modifyActiveSeconds}
              modifyPausedSeconds={modifyPausedSeconds}
              setTempTimerRounding={setTempTimerRounding}
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              isSubmitting={false}
              submitTimer={submitTimer}
              startTimer={startTimerWithStopOthers}
              pauseTimer={pauseTimer}
              resumeTimer={resumeTimer}
              cancelTimer={cancelTimer}
            />
          </div>
        )}
      </Transition>
    </Box>
  );
}
