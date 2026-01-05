// src/stores/timeTrackerManagerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Currency } from "@/types/settings.types";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import { Tables } from "@/types/db.types";

/**
 * Timer data structure stored in the manager.
 *
 * This represents a single timer instance that can be managed by the store.
 * The data structure mirrors the TimeTrackerState from useTimeTracker hook,
 * with the addition of:
 * - id: Unique identifier for the timer
 * - forceEndTimer: Flag to force end a timer (e.g., when max timers reached)
 * - createdAt: Timestamp when the timer was created
 *
 * Note: This store uses Zustand with persistence, so timer data survives
 * page reloads and browser restarts.
 */
export interface TimerData {
  id: string;
  projectId: string;
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  userId: string;
  timerRoundingSettings: TimerRoundingSettings;
  state: TimerState;
  activeSeconds: number;
  pausedSeconds: number;
  startTime: number | null;
  tempStartTime: number | null;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  moneyEarned: string;
  activeTime: string;
  roundedActiveTime: string;
  pausedTime: string;
  forceEndTimer: boolean; // Flag to force end timer (e.g., when max timers reached)
  createdAt: number; // Timestamp when timer was created
  memo: string | null;
}

/**
 * State interface for the time tracker manager store.
 *
 * This store manages multiple timer instances simultaneously (up to 5).
 * It provides:
 * - CRUD operations for timers
 * - Validation (max 5 timers, one per project)
 * - Query methods (get timer, get running timer, get all timers)
 * - State tracking (isTimerRunning flag)
 *
 * The store is persisted to localStorage, so timers survive page reloads.
 */
interface TimeTrackerManagerState {
  resetStore: () => void; // Clears all timers and resets state
  timers: Record<string, TimerData>; // Map of timer ID to timer data
  isTimerRunning: boolean; // Flag indicating if any timer is currently running

  // Timer Management
  /**
   * Adds a new timer for a project.
   *
   * Validates:
   * - Maximum 5 timers allowed
   * - One timer per project (no duplicates)
   *
   * @param project - Project data from database
   * @param roundingSettings - Default rounding settings (used if project doesn't have specific settings)
   * @returns Success status, timer ID if successful, or error message
   */
  addTimer: (
    project: Tables<"timer_project">,
    roundingSettings: TimerRoundingSettings
  ) => {
    success: boolean;
    timerId?: string;
    error?: { german: string; english: string };
  };
  removeTimer: (timerId: string) => void; // Removes a timer from the store
  updateTimer: (timerId: string, updates: Partial<TimerData>) => void; // Updates timer data
  getTimer: (timerId: string) => TimerData | undefined; // Gets a specific timer by ID
  getRunningTimer: () => TimerData | undefined; // Gets the currently running timer (if any)
  getAllTimers: () => TimerData[]; // Gets all timers as an array
  setForceEndTimer: (timerId: string, forceEndTimer: boolean) => void; // Sets the forceEndTimer flag
}

/**
 * Zustand store for managing multiple time tracker instances.
 *
 * This store:
 * - Persists timer data to localStorage (survives page reloads)
 * - Manages up to 5 concurrent timers
 * - Enforces one timer per project
 * - Tracks which timer is currently running
 *
 * Usage: const { timers, addTimer, removeTimer } = useTimeTrackerManager();
 */
export const useTimeTrackerManager = create(
  persist<TimeTrackerManagerState>(
    (set, get) => ({
      timers: {} as Record<string, TimerData>,
      isTimerRunning: false,

      /**
       * Resets the entire store to initial state.
       *
       * Removes all timers and resets the isTimerRunning flag.
       * Useful for logout or complete reset scenarios.
       */
      resetStore: () =>
        set({
          timers: {} as Record<string, TimerData>,
          isTimerRunning: false,
        }),

      /**
       * Adds a new timer for a project.
       *
       * Process:
       * 1. Creates timer data from project and rounding settings
       * 2. Validates maximum timer limit (5 timers)
       * 3. Validates no duplicate timer for the same project
       * 4. Generates unique ID and adds to store
       *
       * Rounding settings priority:
       * - Project-specific settings take precedence
       * - Falls back to default roundingSettings parameter
       *
       * Improvement suggestion: Consider extracting validation logic
       * into separate functions for better testability and readability.
       */
      addTimer: (project, roundingSettings) => {
        // Build timer data structure from project and settings
        // Project-specific rounding settings override defaults
        const timerData = {
          projectId: project.id,
          projectTitle: project.title,
          currency: project.currency,
          salary: project.salary,
          hourlyPayment: project.hourly_payment,
          userId: project.user_id,
          // Merge project rounding settings with defaults
          // Project settings take precedence if they exist
          timerRoundingSettings: {
            roundingDirection:
              project.rounding_direction ?? roundingSettings.roundingDirection,
            roundingInterval:
              project.rounding_interval ?? roundingSettings.roundingInterval,
            roundInTimeFragments:
              project.round_in_time_fragments !== null
                ? project.round_in_time_fragments
                : roundingSettings.roundInTimeFragments,
            timeFragmentInterval:
              project.time_fragment_interval ??
              roundingSettings.timeFragmentInterval,
          },
          // Initialize timer in stopped state with zero values
          state: TimerState.Stopped,
          activeSeconds: 0,
          pausedSeconds: 0,
          startTime: null,
          tempStartTime: null,
          storedActiveSeconds: 0,
          storedPausedSeconds: 0,
          moneyEarned: "0.00",
          activeTime: "00:00",
          roundedActiveTime: "00:00",
          pausedTime: "00:00",
          forceEndTimer: false,
          createdAt: new Date().getTime(),
          memo: null,
        };

        const currentTimers = get().timers;
        const timerCount = Object.keys(currentTimers).length;

        // Validation: Check if maximum 5 time trackers reached
        if (timerCount >= 5) {
          return {
            success: false,
            error: {
              german:
                "Es können maximal 5 Timer gleichzeitig laufen. Bitte stoppen oder entfernen Sie einen bestehenden Timer.",
              english:
                "Maximum 5 time trackers allowed. Please stop or remove an existing timer first.",
            },
          };
        }

        // Validation: Check if project already has a time tracker
        // Prevents duplicate timers for the same project
        const existingTimerForProject = Object.values(currentTimers).find(
          (timer) => timer.projectId === timerData.projectId
        );
        if (existingTimerForProject) {
          return {
            success: false,
            error: {
              german: `Ein Timer für das Projekt "${timerData.projectTitle}" existiert bereits.`,
              english: `A time tracker for project "${timerData.projectTitle}" already exists.`,
            },
          };
        }

        // Generate unique ID and create new timer
        const id = crypto.randomUUID();
        const newTimer: TimerData = {
          id,
          ...timerData,
        };

        // Add timer to store
        set((state) => {
          return {
            timers: { ...state.timers, [id]: newTimer },
          };
        });

        return {
          success: true,
          timerId: id,
        };
      },

      /**
       * Removes a timer from the store.
       *
       * Uses object destructuring to remove the timer by ID.
       * If timer doesn't exist, operation is a no-op (safe).
       *
       * @param timerId - ID of the timer to remove
       *
       * Improvement suggestion: Consider checking if timer exists and
       * returning a success/error status, or at least logging a warning.
       */
      removeTimer: (timerId) => {
        set((state) => {
          // Destructure to remove timer: { [timerId]: _, ...rest } removes timerId key
          const { [timerId]: _, ...rest } = state.timers;
          return {
            timers: rest,
          };
        });
      },

      /**
       * Updates a timer with partial data.
       *
       * This function:
       * 1. Validates timer exists
       * 2. Updates isTimerRunning flag if state changes to/from Running
       * 3. Merges updates with existing timer data
       *
       * Note: The isTimerRunning flag is updated based on state changes,
       * but there's a potential race condition if multiple timers are updated
       * simultaneously. The check for activeTimer ensures the flag is only
       * set to false if no timers are running.
       *
       * @param timerId - ID of the timer to update
       * @param updates - Partial timer data to merge
       *
       * Improvement suggestion: Consider extracting the isTimerRunning
       * update logic into a separate function or using a computed value
       * instead of maintaining a separate flag.
       */
      updateTimer: (timerId, updates) => {
        set((state) => {
          const timer = state.timers[timerId];
          // If timer doesn't exist, return state unchanged (no-op)
          if (!timer) return state;

          // Update isTimerRunning flag based on state changes
          if (updates.state === TimerState.Running) {
            // Timer is starting, set flag to true
            set({ isTimerRunning: true });
          } else {
            // Timer is stopping/pausing, check if any timer is still running
            const activeTimer = get().getRunningTimer();
            if (!activeTimer) {
              // No timers running, set flag to false
              set({ isTimerRunning: false });
            }
          }

          // Merge updates with existing timer data
          return {
            timers: {
              ...state.timers,
              [timerId]: { ...timer, ...updates },
            },
          };
        });
      },

      /**
       * Gets a specific timer by ID.
       *
       * @param timerId - ID of the timer to retrieve
       * @returns Timer data or undefined if not found
       */
      getTimer: (timerId) => {
        return get().timers[timerId];
      },

      /**
       * Gets the currently running timer (if any).
       *
       * Searches through all timers to find one with state === Running.
       *
       * @returns The running timer or undefined if no timer is running
       *
       * Note: This assumes only one timer can run at a time. If multiple
       * timers could run simultaneously, this would need to return an array.
       */
      getRunningTimer: () => {
        return Object.values(get().timers).find(
          (timer) => timer.state === TimerState.Running
        );
      },

      /**
       * Gets all timers as an array.
       *
       * Useful for rendering lists of timers or iterating over all timers.
       *
       * @returns Array of all timer data objects
       */
      getAllTimers: () => {
        return Object.values(get().timers);
      },

      /**
       * Sets the forceEndTimer flag for a timer.
       *
       * This flag is used to force a timer to end (e.g., when maximum
       * timer limit is reached and a new timer needs to be created).
       *
       * @param timerId - ID of the timer
       * @param forceEndTimer - Boolean value to set
       *
       * Improvement suggestion: Consider if this flag is actually used
       * in the codebase. If not, it might be dead code that can be removed.
       */
      setForceEndTimer: (timerId, forceEndTimer) => {
        set((state) => {
          const timer = state.timers[timerId];
          // If timer doesn't exist, return state unchanged (no-op)
          if (!timer) return state;
          return {
            timers: {
              ...state.timers,
              [timerId]: { ...timer, forceEndTimer },
            },
          };
        });
      },
    }),
    {
      // Persist store to localStorage with this key
      // Timer data will survive page reloads and browser restarts
      name: "time-tracker-manager-storage",
    }
  )
);
