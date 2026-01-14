// src/stores/timeTrackerManagerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import { WorkProject } from "@/types/work.types";

export interface Timer {
  id: string;
  state: TimerState;
  startTime: number | null;
  createdAt: number;
  memo: string | null;
  deltaStartTime: number;
  deltaEndTime: number;
  projectId: string;
  appointmentId?: string;
  timerRoundingSettings?: TimerRoundingSettings;
}

export interface TimerData {
  id: string;
  activeSeconds: number;
  projectId: string;
}

interface TimeTrackerManagerState {
  timers: Record<string, Timer>;
  activeTimerData: Record<string, TimerData>;
  runningTimerCount: number;
}

interface TimeTrackerManagerActions {
  resetStore: () => void;
  addTimer: (
    project: WorkProject,
    roundingSettings?: TimerRoundingSettings,
    appointmentId?: string
  ) => { timerId: string } | { error: "limit" | "duplicate" };
  startTimer: (timerId: string) => void;
  stopTimer: (timerId: string) => void;
  removeTimer: (timerId: string) => void;
  updateTimer: (timerId: string, updates: Partial<Timer>) => void;
  updateTimerData: (timerId: string, updates: Partial<TimerData>) => void;
}

export const useTimeTrackerManager = create(
  persist<TimeTrackerManagerState & TimeTrackerManagerActions>(
    (set, get) => ({
      timers: {} as Record<string, Timer>,
      activeTimerData: {} as Record<string, TimerData>,
      runningTimerCount: 0,

      resetStore: () =>
        set({
          timers: {} as Record<string, Timer>,
          activeTimerData: {} as Record<string, TimerData>,
          runningTimerCount: 0,
        }),

      addTimer: (project, roundingSettings, appointmentId) => {
        const timerData = {
          projectId: project.id,
          timerRoundingSettings: roundingSettings,
          state: TimerState.Stopped,
          startTime: null,
          createdAt: new Date().getTime(),
          memo: null,
          appointmentId: appointmentId,
          deltaStartTime: 0,
          deltaEndTime: 0,
        };

        const currentTimers = get().timers;
        const timerCount = Object.keys(currentTimers).length;

        // Validation: Check if maximum 10 time trackers reached
        if (timerCount >= 10) {
          return {
            error: "limit",
          };
        }

        // Validation: Check if project already has a time tracker
        // Prevents duplicate timers for the same project
        const existingTimerForProject = Object.values(currentTimers).find(
          (timer) =>
            timer.projectId === timerData.projectId &&
            timer.projectId !== undefined
        );
        if (existingTimerForProject) {
          return {
            error: "duplicate",
          };
        }

        // Generate unique ID and create new timer
        const id = crypto.randomUUID();
        const newTimer: Timer = {
          id,
          ...timerData,
        };

        // Add timer to store
        set((state) => {
          return {
            timers: { ...state.timers, [id]: newTimer },
            activeTimerData: {
              ...state.activeTimerData,
              [id]: { id: id, activeSeconds: 0, projectId: project.id },
            },
          };
        });

        if (appointmentId) {
          get().startTimer(id);
        }

        return { timerId: id };
      },

      startTimer: (timerId) => {
        set((state) => {
          const timer = state.timers[timerId];
          if (!timer) return state;
          return {
            runningTimerCount: state.runningTimerCount + 1,
            timers: {
              ...state.timers,
              [timerId]: { ...timer, state: TimerState.Running, startTime: Date.now() },
            },
          };
        });
      },

      stopTimer: (timerId) => {
        set((state) => {
          const timer = state.timers[timerId];
          if (!timer) return state;
          return {
            runningTimerCount: state.runningTimerCount - 1,
            timers: {
              ...state.timers,
              [timerId]: {
                ...timer,
                state: TimerState.Stopped,
                timerRoundingSettings: undefined,
                startTime: null,
                appointmentId: undefined,
                memo: null,
                deltaStartTime: 0,
                deltaEndTime: 0,
              },
            },
            activeTimerData: {
              ...state.activeTimerData,
              [timerId]: {
                id: timerId,
                activeSeconds: 0,
                projectId: timer.projectId,
              },
            },
          };
        });
      },

      removeTimer: (timerId) => {
        set((state) => {
          const { [timerId]: timer, ...testTimers } = state.timers;
          const { [timerId]: _, ...restActiveTimerData } =
            state.activeTimerData;
          if (timer.state === TimerState.Running) {
            get().stopTimer(timerId);
          }
          return {
            timers: testTimers,
            activeTimerData: restActiveTimerData,
          };
        });
      },

      updateTimer: (timerId, updates) => {
        set((state) => {
          const timer = state.timers[timerId];
          if (!timer) return state;
          return {
            timers: {
              ...state.timers,
              [timerId]: { ...timer, ...updates },
            },
          };
        });
      },

      updateTimerData: (timerId, updates) => {
        set((state) => {
          return {
            activeTimerData: {
              ...state.activeTimerData,
              [timerId]: { ...state.activeTimerData[timerId], ...updates },
            },
          };
        });
      },
    }),

    {
      name: "time-tracker-manager-storage-v2",
    }
  )
);
