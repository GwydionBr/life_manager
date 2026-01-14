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
  activeSeconds: number;
  timerRoundingSettings: TimerRoundingSettings;
  storedActiveSeconds: number;
  memo: string;
  color: string | null;
  backgroundColor: string;
  removeTimer: () => void;
  submitTimer: () => void;
  setIsTimeTrackerMinimized: (value: boolean) => void;
  startTimer: () => void;
  cancelTimer: () => void;
  modifyActiveSeconds: (delta: number) => void;
  setTempTimerRounding: (timerRoundingSettings: TimerRoundingSettings) => void;
  setMemo: (memo: string) => void;
}

export default function TimeTrackerComponentBig({
  timer,
  state,
  activeTime,
  activeSeconds,
  roundedActiveTime,
  isTimeTrackerMinimized,
  isSubmitting,
  storedActiveSeconds,
  timerRoundingSettings,
  moneyEarned,
  memo,
  color,
  backgroundColor,
  removeTimer,
  submitTimer,
  startTimer,
  cancelTimer,
  modifyActiveSeconds,
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
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          activeSeconds={activeSeconds}
          storedActiveSeconds={storedActiveSeconds}
          timerRoundingSettings={timerRoundingSettings}
          startTimer={startTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          removeTimer={removeTimer}
          modifyActiveSeconds={modifyActiveSeconds}
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
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          moneyEarned={moneyEarned}
          storedActiveSeconds={storedActiveSeconds}
          timerRoundingSettings={timerRoundingSettings}
          color={color}
          backgroundColor={backgroundColor}
          startTimer={startTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          modifyActiveSeconds={modifyActiveSeconds}
          setTempTimerRounding={setTempTimerRounding}
          removeTimer={removeTimer}
          setMemo={setMemo}
        />
      </Collapse>
    </Stack>
  );
}
