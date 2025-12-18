import { useState, useEffect, useCallback, useRef } from "react";
import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";
import {
  secondsToTimerFormat,
  getRoundedSeconds,
} from "@/lib/workHelperFunctions";
import { Currency } from "@/types/settings.types";
import { TablesInsert } from "@/types/db.types";

interface TimeTrackerState {
  projectId: string;
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  userId: string;
  timerRoundingSettings: TimerRoundingSettings;
  tempTimerRoundingSettings?: TimerRoundingSettings;
  moneyEarned: string;
  activeTime: string;
  roundedActiveTime: string;
  pausedTime: string;
  state: TimerState;
  activeSeconds: number;
  pausedSeconds: number;
  startTime: number | null;
  tempStartTime: number | null;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  memo: string | null;
}

export function useTimeTracker(initialState: TimeTrackerState) {
  const [state, setState] = useState<TimeTrackerState>(initialState);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer-Loop Funktion
  const startLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const updateLoop = () => {
      setState((prevState) => {
        if (prevState.state === TimerState.Running) {
          const newActiveSeconds =
            Math.floor((Date.now() - (prevState.tempStartTime ?? 0)) / 1000) +
            prevState.storedActiveSeconds;

          const newActiveTime = secondsToTimerFormat(newActiveSeconds);
          const newRoundedActiveTime = secondsToTimerFormat(
            getRoundedSeconds(
              newActiveSeconds,
              prevState.tempTimerRoundingSettings?.roundingInterval ??
                prevState.timerRoundingSettings.roundingInterval,
              prevState.tempTimerRoundingSettings?.roundingDirection ??
                prevState.timerRoundingSettings.roundingDirection
            )
          );
          document.title = `${newActiveTime} - ${prevState.projectTitle} | Work Manager`;
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
        return prevState;
      });
    };

    intervalRef.current = setInterval(updateLoop, 1000);
    updateLoop();
  }, [
    state.timerRoundingSettings,
    state.salary,
    state.tempStartTime,
    state.storedActiveSeconds,
    state.storedPausedSeconds,
  ]);

  // Timer-Aktionen

  const modifyActiveSeconds = useCallback(
    (delta: number) => {
      const newActiveSeconds = Math.max(0, state.activeSeconds + delta);
      const now = new Date().getTime();
      const newStartTime = new Date(now - newActiveSeconds * 1000);

      if (state.state !== TimerState.Running) {
        setState((prev) => ({
          ...prev,
          startTime: newStartTime.getTime(),
          storedActiveSeconds: newActiveSeconds,
          activeTime: secondsToTimerFormat(newActiveSeconds),
          activeSeconds: newActiveSeconds,
          tempStartTime: Date.now(),
        }));
      } else {
        setState((prev) => ({
          ...prev,
          startTime: newStartTime.getTime(),
          activeSeconds: newActiveSeconds,
          activeTime: secondsToTimerFormat(newActiveSeconds),
          storedActiveSeconds: newActiveSeconds,
          tempStartTime: Date.now(),
        }));
      }
    },
    [state.state, state.activeSeconds]
  );

  const modifyPausedSeconds = useCallback(
    (delta: number) => {
      const newPausedSeconds = Math.max(0, state.pausedSeconds + delta);
      const now = new Date().getTime();
      const newStartTime = new Date(
        now - newPausedSeconds * 1000 - state.activeSeconds * 1000
      );

      if (state.state !== TimerState.Paused) {
        setState((prev) => ({
          ...prev,
          startTime: newStartTime.getTime(),
          storedPausedSeconds: newPausedSeconds,
          pausedTime: secondsToTimerFormat(newPausedSeconds),
          pausedSeconds: newPausedSeconds,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          startTime: newStartTime.getTime(),
          pausedSeconds: newPausedSeconds,
          pausedTime: secondsToTimerFormat(newPausedSeconds),
          storedPausedSeconds: newPausedSeconds,
          tempStartTime: Date.now(),
        }));
      }
    },
    [state.state, state.pausedSeconds]
  );

  const restoreTimer = useCallback(() => {
    startLoop();
  }, [startLoop]);

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

  const startTimer = useCallback(() => {
    if (state.state !== TimerState.Stopped || !state.projectTitle) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Running,
      startTime: Date.now(),
      tempStartTime: Date.now(),
    }));
    startLoop();
  }, [state.state, state.projectTitle, startLoop]);

  const pauseTimer = useCallback(() => {
    if (state.state !== TimerState.Running) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Paused,
      storedActiveSeconds: prev.activeSeconds,
      tempStartTime: Date.now(),
    }));
    startLoop();
  }, [state.state, startLoop]);

  const resumeTimer = useCallback(() => {
    if (state.state !== TimerState.Paused) return;

    setState((prev) => ({
      ...prev,
      state: TimerState.Running,
      storedPausedSeconds: prev.pausedSeconds,
      tempStartTime: Date.now(),
    }));
    startLoop();
  }, [state.state, startLoop]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    document.title = `Work Manager`;

    setState((prev) => ({
      ...prev,
      state: TimerState.Stopped,
      moneyEarned: "0.00",
      activeTime: "00:00",
      roundedActiveTime: "00:00",
      pausedTime: "00:00",
      activeSeconds: 0,
      pausedSeconds: 0,
      tempTimerRoundingSettings: undefined,
      startTime: null,
      tempStartTime: null,
      storedActiveSeconds: 0,
      storedPausedSeconds: 0,
      memo: null,
    }));
  }, []);

  const cancelTimer = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const setTimerRounding = useCallback(
    (timerRoundingSettings: TimerRoundingSettings) => {
      setState((prev) => ({
        ...prev,
        timerRoundingSettings,
      }));
    },
    [state.timerRoundingSettings]
  );

  const setTempTimerRounding = useCallback(
    (timerRoundingSettings: TimerRoundingSettings) => {
      setState((prev) => ({
        ...prev,
        tempTimerRoundingSettings: timerRoundingSettings,
      }));
    },
    [state.tempTimerRoundingSettings]
  );

  const getCurrentSession = useCallback(() => {
    const currentActiveSeconds = state.timerRoundingSettings
      .roundInTimeFragments
      ? state.activeSeconds
      : getRoundedSeconds(
          state.activeSeconds,
          state.tempTimerRoundingSettings?.roundingInterval ??
            state.timerRoundingSettings.roundingInterval,
          state.tempTimerRoundingSettings?.roundingDirection ??
            state.timerRoundingSettings.roundingDirection
        );

    const newStartTime = new Date(state.startTime ?? 0);
    newStartTime.setSeconds(0);
    newStartTime.setMilliseconds(0);

    const newEndTime = new Date(
      newStartTime.getTime() +
        (currentActiveSeconds + state.pausedSeconds) * 1000
    );

    const newTimerSession: TablesInsert<"timer_session"> = {
      user_id: state.userId,
      project_id: state.projectId,
      start_time: newStartTime.toISOString(),
      true_end_time: new Date().toISOString(),
      end_time: newEndTime.toISOString(),
      hourly_payment: state.hourlyPayment,
      active_seconds: currentActiveSeconds,
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
