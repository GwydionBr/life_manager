import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";

import { Stack, Collapse } from "@mantine/core";
import TimeTrackerComponentBigMin from "./TimeTrackerComponentBigMin";
import TimeTrackerComponentBigMax from "./TimeTrackerComponentBigMax";
import { TimerData } from "@/stores/timeTrackerManagerStore";

interface TimeTrackerComponentBigProps {
  timer: TimerData;
  isTimeTrackerMinimized: boolean;
  isSubmitting: boolean;
  moneyEarned: string;
  roundedActiveTime: string;
  state: TimerState;
  activeTime: string;
  pausedTime: string;
  activeSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  memo: string;
  color: string | null;
  backgroundColor: string;
  removeTimer: () => void;
  submitTimer: () => void;
  setIsTimeTrackerMinimized: (value: boolean) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  cancelTimer: () => void;
  modifyActiveSeconds: (delta: number) => void;
  modifyPausedSeconds: (delta: number) => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  setMemo: (memo: string) => void;
}

export default function TimeTrackerComponentBig({
  timer,
  state,
  activeTime,
  pausedTime,
  activeSeconds,
  roundedActiveTime,
  isTimeTrackerMinimized,
  isSubmitting,
  storedActiveSeconds,
  storedPausedSeconds,
  timerRoundingSettings,
  moneyEarned,
  memo,
  color,
  backgroundColor,
  removeTimer,
  submitTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  cancelTimer,
  modifyActiveSeconds,
  modifyPausedSeconds,
  setTempTimerRounding,
  setMemo,
}: TimeTrackerComponentBigProps) {
  return (
    <Stack align="center" w="100%">
      <Collapse in={isTimeTrackerMinimized} transitionDuration={400}>
        <TimeTrackerComponentBigMin
          timer={timer}
          state={state}
          activeTime={activeTime}
          pausedTime={pausedTime}
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          activeSeconds={activeSeconds}
          storedActiveSeconds={storedActiveSeconds}
          storedPausedSeconds={storedPausedSeconds}
          timerRoundingSettings={timerRoundingSettings}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resumeTimer={resumeTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          removeTimer={removeTimer}
          modifyActiveSeconds={modifyActiveSeconds}
          modifyPausedSeconds={modifyPausedSeconds}
          setTempTimerRounding={setTempTimerRounding}
          color={color}
          backgroundColor={backgroundColor}
        />
      </Collapse>
      <Collapse in={!isTimeTrackerMinimized} transitionDuration={400}>
        <TimeTrackerComponentBigMax
          timer={timer}
          state={state}
          memo={memo}
          activeSeconds={activeSeconds}
          activeTime={activeTime}
          pausedTime={pausedTime}
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          moneyEarned={moneyEarned}
          storedActiveSeconds={storedActiveSeconds}
          storedPausedSeconds={storedPausedSeconds}
          timerRoundingSettings={timerRoundingSettings}
          color={color}
          backgroundColor={backgroundColor}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resumeTimer={resumeTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          modifyActiveSeconds={modifyActiveSeconds}
          modifyPausedSeconds={modifyPausedSeconds}
          setTempTimerRounding={setTempTimerRounding}
          removeTimer={removeTimer}
          setMemo={setMemo}
        />
      </Collapse>
    </Stack>
  );
}
