import { useState, useEffect, useCallback, useRef } from "react";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import {
  secondsToTimerFormat,
  getRoundedSeconds,
} from "@/lib/workHelperFunctions";
import { calculateSessionTimeValues } from "@/lib/timeTrackerFunctions";
import { Currency } from "@/types/settings.types";
import { TablesInsert } from "@/types/db.types";

/**
 * State interface for a single time tracker instance.
 *
 * This represents the complete state of one timer, including:
 * - Project information (id, title, payment details)
 * - Timer state (running, paused, stopped)
 * - Time tracking (active seconds, paused seconds, formatted times)
 * - Rounding settings (permanent and temporary overrides)
 * - Financial calculations (money earned based on time and salary)
 *
 * Note: The distinction between `startTime` and `tempStartTime` is used to handle
 * timer resumptions and modifications. `storedActiveSeconds` and `storedPausedSeconds`
 * are used to accumulate time across pause/resume cycles.
 */
interface TimeTrackerState {
  projectId: string;
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  userId: string;
  timerRoundingSettings: TimerRoundingSettings;
  tempTimerRoundingSettings?: TimerRoundingSettings; // Temporary override for rounding (e.g., for current session only)
  moneyEarned: string;
  activeTime: string; // Formatted as "HH:MM:SS"
  roundedActiveTime: string; // Active time after applying rounding rules
  pausedTime: string; // Formatted as "HH:MM:SS"
  state: TimerState;
  activeSeconds: number; // Total active seconds (not rounded)
  pausedSeconds: number; // Total paused seconds
  startTime: number | null; // Original start timestamp (used for session calculation)
  tempStartTime: number | null; // Current reference point for time calculations (updated on pause/resume)
  storedActiveSeconds: number; // Accumulated active seconds before current running period
  storedPausedSeconds: number; // Accumulated paused seconds before current pause period
  memo: string | null;
}

/**
 * Custom hook for managing a single time tracker instance.
 *
 * This hook handles all timer logic including:
 * - Starting, pausing, resuming, and stopping the timer
 * - Updating time displays every second
 * - Calculating money earned based on time and salary
 * - Applying rounding rules to time calculations
 * - Managing timer state transitions
 *
 * @param initialState - Initial state for the timer (project info, settings, etc.)
 * @returns Timer state and control functions
 *
 * Improvement suggestion: Consider extracting the update loop logic into a separate
 * function or using a reducer pattern to reduce complexity in the callback.
 */
export function useTimeTracker(initialState: TimeTrackerState) {
  const [state, setState] = useState<TimeTrackerState>(initialState);

  // Reference to the interval ID so we can clear it when needed
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Starts the timer update loop that runs every second.
   *
   * This function:
   * 1. Clears any existing interval to prevent duplicates
   * 2. Creates a new interval that updates the timer state every second
   * 3. Immediately runs the update once (so UI updates instantly)
   *
   * The update loop handles two states:
   * - Running: Calculates active time, rounded time, and money earned
   * - Paused: Calculates paused time
   *
   * Note: The loop continues even when paused to keep the paused time display updated.
   * This might be optimized to only run when needed (running or paused state).
   */
  const startLoop = useCallback(() => {
    // Clear any existing interval to prevent memory leaks and duplicate intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    /**
     * Update function called every second.
     *
     * Calculates current time based on:
     * - tempStartTime: The reference point for the current running/paused period
     * - storedActiveSeconds/storedPausedSeconds: Accumulated time from previous periods
     *
     * This approach allows the timer to accurately track time across multiple
     * pause/resume cycles.
     */
    const updateLoop = () => {
      setState((prevState) => {
        if (prevState.state === TimerState.Running) {
          // Calculate total active seconds: time since tempStartTime + previously stored seconds
          const newActiveSeconds =
            Math.floor((Date.now() - (prevState.tempStartTime ?? 0)) / 1000) +
            prevState.storedActiveSeconds;

          // Format the active time for display
          const newActiveTime = secondsToTimerFormat(newActiveSeconds);

          // Calculate rounded time using either temp or permanent rounding settings
          // Temp settings take precedence (used for session-specific rounding overrides)
          const newRoundedActiveTime = secondsToTimerFormat(
            getRoundedSeconds(
              newActiveSeconds,
              prevState.tempTimerRoundingSettings?.roundingInterval ??
                prevState.timerRoundingSettings.roundingInterval,
              prevState.tempTimerRoundingSettings?.roundingDirection ??
                prevState.timerRoundingSettings.roundingDirection
            )
          );

          // Update browser tab title to show current time and project
          document.title = `${newActiveTime} - ${prevState.projectTitle} | Work Manager`;

          // Calculate money earned based on rounded seconds
          // Formula: (rounded seconds / 3600) * hourly salary
          return {
            ...prevState,
            activeSeconds: newActiveSeconds,
            activeTime: newActiveTime,
            roundedActiveTime: newRoundedActiveTime,
            moneyEarned: (
              (getRoundedSeconds(
                newActiveSeconds,
                prevState.tempTimerRoundingSettings?.roundingInterval ??
                  prevState.timerRoundingSettings.roundingInterval,
                prevState.tempTimerRoundingSettings?.roundingDirection ??
                  prevState.timerRoundingSettings.roundingDirection
              ) /
                3600) *
              prevState.salary
            ).toFixed(2),
          };
        } else if (prevState.state === TimerState.Paused) {
          // Calculate total paused seconds: time since tempStartTime + previously stored paused seconds
          const newPausedSeconds =
            Math.floor((Date.now() - (prevState.tempStartTime ?? 0)) / 1000) +
            prevState.storedPausedSeconds;

          const newPausedTime = secondsToTimerFormat(newPausedSeconds);

          return {
            ...prevState,
            pausedSeconds: newPausedSeconds,
            pausedTime: newPausedTime,
          };
        }
        // If stopped, no updates needed
        return prevState;
      });
    };

    // Start the interval (updates every 1000ms = 1 second)
    intervalRef.current = setInterval(updateLoop, 1000);
    // Run immediately so UI updates right away (don't wait for first interval)
    updateLoop();
  }, []);

  // ============================================================================
  // Timer Control Actions
  // ============================================================================

  /**
   * Modifies the active seconds by a delta amount (positive or negative).
   *
   * This is used for manual time adjustments (e.g., user adds/subtracts time).
   *
   * The function:
   * 1. Calculates new active seconds (ensuring it doesn't go below 0)
   * 2. Recalculates the startTime to maintain consistency
   * 3. Updates both stored and current active seconds
   *
   * @param delta - Number of seconds to add (positive) or subtract (negative)
   */
  const modifyActiveSeconds = useCallback(
    (delta: number) => {
      // Ensure active seconds never go below 0
      const newActiveSeconds = Math.max(0, state.activeSeconds + delta);
      const now = new Date().getTime();
      // Recalculate start time to maintain consistency with the new active seconds
      const newStartTime = new Date(now - newActiveSeconds * 1000);

      // Update both stored and current values, reset temp start time
      // This ensures the timer continues correctly from the adjusted time
      setState((prev) => ({
        ...prev,
        startTime: newStartTime.getTime(),
        activeSeconds: newActiveSeconds,
        activeTime: secondsToTimerFormat(newActiveSeconds),
        storedActiveSeconds: newActiveSeconds,
        tempStartTime: Date.now(),
      }));
    },
    [state.activeSeconds]
  );

  /**
   * Modifies the paused seconds by a delta amount (positive or negative).
   *
   * Similar to modifyActiveSeconds but for paused time tracking.
   * Used when user manually adjusts the paused time.
   *
   * @param delta - Number of seconds to add (positive) or subtract (negative)
   */
  const modifyPausedSeconds = useCallback(
    (delta: number) => {
      // Ensure paused seconds never go below 0
      const newPausedSeconds = Math.max(0, state.pausedSeconds + delta);
      const now = new Date().getTime();
      // Recalculate start time accounting for both active and paused seconds
      const newStartTime = new Date(
        now - newPausedSeconds * 1000 - state.activeSeconds * 1000
      );

      // Update both stored and current values
      // Reset temp start time only when paused to maintain consistency
      setState((prev) => ({
        ...prev,
        startTime: newStartTime.getTime(),
        pausedSeconds: newPausedSeconds,
        pausedTime: secondsToTimerFormat(newPausedSeconds),
        storedPausedSeconds: newPausedSeconds,
        ...(prev.state === TimerState.Paused && {
          tempStartTime: Date.now(),
        }),
      }));
    },
    [state.pausedSeconds, state.activeSeconds]
  );

  /**
   * Restores/resumes the timer update loop.
   *
   * Used when the timer needs to be restored (e.g., after page reload or
   * when re-initializing a persisted timer).
   */
  const restoreTimer = useCallback(() => {
    startLoop();
  }, [startLoop]);

  /**
   * Configures the timer with project information.
   *
   * This can only be called when the timer is stopped to prevent
   * changing project settings while a timer is running.
   *
   * @param projectId - ID of the project being tracked
   * @param projectTitle - Display name of the project
   * @param currency - Currency for payment calculations
   * @param salary - Hourly salary rate
   * @param hourlyPayment - Whether payment is hourly (vs fixed)
   * @param userId - ID of the user tracking time
   * @param memo - Optional memo/note for this timer session
   *
   * Improvement suggestion: Consider accepting a project object instead of
   * individual parameters to reduce parameter count and improve maintainability.
   */
  const configureProject = useCallback(
    (
      projectId: string,
      projectTitle: string,
      currency: Currency,
      salary: number,
      hourlyPayment: boolean,
      userId: string,
      memo: string | null
    ) => {
      // Only allow configuration when timer is stopped
      if (state.state !== TimerState.Stopped) return;

      setState((prev) => ({
        ...prev,
        projectId,
        projectTitle,
        currency,
        salary,
        hourlyPayment,
        userId,
        memo,
      }));
    },
    [state.state]
  );

  /**
   * Starts the timer.
   *
   * Can only be called when:
   * - Timer is in Stopped state
   * - A project has been configured (projectTitle exists)
   *
   * Sets both startTime and tempStartTime to current time to begin tracking.
   */
  const startTimer = useCallback(() => {
    if (state.state !== TimerState.Stopped || !state.projectTitle) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Running,
      startTime: Date.now(), // Original start time (used for session calculation)
      tempStartTime: Date.now(), // Current reference point for time calculations
    }));
    startLoop(); // Start the update loop
  }, [state.state, state.projectTitle, startLoop]);

  /**
   * Pauses the timer.
   *
   * Can only be called when timer is Running.
   *
   * Stores the current active seconds and resets tempStartTime so that
   * paused time tracking can begin from this point.
   */
  const pauseTimer = useCallback(() => {
    if (state.state !== TimerState.Running) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Paused,
      storedActiveSeconds: prev.activeSeconds, // Save current active seconds
      tempStartTime: Date.now(), // Reset reference point for paused time tracking
    }));
    startLoop(); // Continue loop to track paused time
  }, [state.state, startLoop]);

  /**
   * Resumes the timer from paused state.
   *
   * Can only be called when timer is Paused.
   *
   * Stores the current paused seconds and resets tempStartTime so that
   * active time tracking can resume from this point.
   */
  const resumeTimer = useCallback(() => {
    if (state.state !== TimerState.Paused) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Running,
      storedPausedSeconds: prev.pausedSeconds, // Save current paused seconds
      tempStartTime: Date.now(), // Reset reference point for active time tracking
    }));
    startLoop(); // Continue loop to track active time
  }, [state.state, startLoop]);

  /**
   * Stops the timer and resets all values to initial state.
   *
   * This:
   * 1. Clears the update interval
   * 2. Resets the browser tab title
   * 3. Resets all timer values to zero/initial state
   * 4. Clears temporary rounding settings and memo
   *
   * Note: This does NOT save the session - use getCurrentSession() before
   * calling stopTimer() if you need to persist the session.
   */
  const stopTimer = useCallback(() => {
    // Clear the update interval to stop time tracking
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Reset browser tab title
    document.title = `Work Manager`;

    // Reset all timer state to initial values
    setState((prev) => ({
      ...prev,
      state: TimerState.Stopped,
      moneyEarned: "0.00",
      activeTime: "00:00",
      roundedActiveTime: "00:00",
      pausedTime: "00:00",
      activeSeconds: 0,
      pausedSeconds: 0,
      tempTimerRoundingSettings: undefined, // Clear temporary rounding overrides
      startTime: null,
      tempStartTime: null,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,
      memo: null, // Clear memo
    }));
  }, []);

  /**
   * Cancels the timer (alias for stopTimer).
   *
   * Improvement suggestion: Consider if this is needed or if stopTimer
   * should be used directly. Having both might cause confusion.
   */
  const cancelTimer = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  /**
   * Cleanup effect: Clears the interval when component unmounts.
   *
   * This prevents memory leaks by ensuring the interval is cleared
   * even if the component is unmounted while the timer is running.
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Sets the permanent timer rounding settings.
   *
   * These settings persist and are used as the default for all sessions.
   *
   * @param timerRoundingSettings - The rounding configuration to use
   */
  const setTimerRounding = useCallback(
    (timerRoundingSettings: TimerRoundingSettings) => {
      setState((prev) => ({
        ...prev,
        timerRoundingSettings,
      }));
    },
    []
  );

  /**
   * Sets temporary timer rounding settings (overrides permanent settings).
   *
   * These settings take precedence over permanent settings and are typically
   * used for session-specific rounding adjustments. They are cleared when
   * the timer is stopped.
   *
   * @param timerRoundingSettings - The temporary rounding configuration
   */
  const setTempTimerRounding = useCallback(
    (timerRoundingSettings: TimerRoundingSettings) => {
      setState((prev) => ({
        ...prev,
        tempTimerRoundingSettings: timerRoundingSettings,
      }));
    },
    []
  );

  /**
   * Generates a timer session object ready to be saved to the database.
   *
   * This function:
   * 1. Uses calculateSessionTimeValues to compute time values
   * 2. Creates a database-ready session object
   *
   * Note: The distinction between `true_end_time` (actual end) and `end_time`
   * (calculated end based on rounded time) allows tracking of actual vs billed time.
   *
   * @returns A timer session object ready for database insertion
   */
  const getCurrentSession = useCallback(() => {
    // Calculate time values using the extracted helper function
    const { finalActiveSeconds, normalizedStartTime, calculatedEndTime } =
      calculateSessionTimeValues(
        state.activeSeconds,
        state.pausedSeconds,
        state.startTime,
        state.timerRoundingSettings,
        state.tempTimerRoundingSettings
      );

    // Create database-ready session object
    const newTimerSession: TablesInsert<"work_time_entry"> = {
      user_id: state.userId,
      work_project_id: state.projectId,
      start_time: normalizedStartTime.toISOString(), // Normalized start time
      true_end_time: new Date().toISOString(), // Actual end time (when function is called)
      end_time: calculatedEndTime.toISOString(), // Calculated end time (based on rounded time)
      hourly_payment: state.hourlyPayment,
      active_seconds: finalActiveSeconds, // Rounded active seconds
      paused_seconds: state.pausedSeconds,
      salary: state.salary,
      currency: state.currency,
      memo: state.memo,
    };

    return newTimerSession;
  }, [
    state.tempTimerRoundingSettings,
    state.timerRoundingSettings,
    state.salary,
    state.currency,
    state.hourlyPayment,
    state.userId,
    state.projectId,
    state.startTime,
    state.activeSeconds,
    state.pausedSeconds,
    state.memo,
  ]);

  /**
   * Returns the timer state and all control functions.
   *
   * The state is spread into the return object, so components can access
   * timer values directly (e.g., `timer.activeTime`) along with control
   * functions (e.g., `timer.startTimer()`).
   */
  return {
    ...state,
    configureProject,
    restoreTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    cancelTimer,
    getCurrentSession,
    modifyActiveSeconds,
    modifyPausedSeconds,
    setTempTimerRounding,
    setTimerRounding,
  };
}
