// src/stores/timeTrackerManagerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Currency } from "@/types/settings.types";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import { Tables } from "@/types/db.types";

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
  forceEndTimer: boolean;
  createdAt: number;
  memo: string | null;
}

interface TimeTrackerManagerState {
  resetStore: () => void;
  timers: Record<string, TimerData>;
  isTimerRunning: boolean;

  // Timer Management
  addTimer: (
    project: Tables<"timer_project">,
    roundingSettings: TimerRoundingSettings
  ) => {
    success: boolean;
    timerId?: string;
    error?: { german: string; english: string };
  };
  removeTimer: (timerId: string) => void;
  updateTimer: (timerId: string, updates: Partial<TimerData>) => void;
  getTimer: (timerId: string) => TimerData | undefined;
  getRunningTimer: () => TimerData | undefined;
  getAllTimers: () => TimerData[];
  setForceEndTimer: (timerId: string, forceEndTimer: boolean) => void;
}

export const useTimeTrackerManager = create(
  persist<TimeTrackerManagerState>(
    (set, get) => ({
      timers: {} as Record<string, TimerData>,
      isTimerRunning: false,

      resetStore: () =>
        set({
          timers: {} as Record<string, TimerData>,
          isTimerRunning: false,
        }),

      addTimer: (project, roundingSettings) => {
        const timerData = {
          projectId: project.id,
          projectTitle: project.title,
          currency: project.currency,
          salary: project.salary,
          hourlyPayment: project.hourly_payment,
          userId: project.user_id,
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

        // Check if maximum 5 time trackers reached
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

        // Check if project already has a time tracker
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

        const id = crypto.randomUUID();
        const newTimer: TimerData = {
          id,
          ...timerData,
        };

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

      removeTimer: (timerId) => {
        set((state) => {
          const { [timerId]: _, ...rest } = state.timers;
          return {
            timers: rest,
          };
        });
      },

      updateTimer: (timerId, updates) => {
        set((state) => {
          const timer = state.timers[timerId];
          if (!timer) return state;

          if (updates.state === TimerState.Running) {
            set({ isTimerRunning: true });
          } else {
            const activeTimer = get().getRunningTimer();
            if (!activeTimer) {
              set({ isTimerRunning: false });
            }
          }
          return {
            timers: {
              ...state.timers,
              [timerId]: { ...timer, ...updates },
            },
          };
        });
      },

      getTimer: (timerId) => {
        return get().timers[timerId];
      },

      getRunningTimer: () => {
        return Object.values(get().timers).find(
          (timer) => timer.state === TimerState.Running
        );
      },

      getAllTimers: () => {
        return Object.values(get().timers);
      },

      setForceEndTimer: (timerId, forceEndTimer) => {
        set((state) => {
          const timer = state.timers[timerId];
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
      name: "time-tracker-manager-storage",
    }
  )
);
