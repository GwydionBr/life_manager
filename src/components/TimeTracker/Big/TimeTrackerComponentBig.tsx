import { TimerRoundingSettings, TimerState } from "@/types/timeTracker.types";

import { Stack, Collapse } from "@mantine/core";
import { Currency } from "@/types/settings.types";
import TimeTrackerComponentBigMin from "./TimeTrackerComponentBigMin";
import TimeTrackerComponentBigMax from "./TimeTrackerComponentBigMax";

interface TimeTrackerComponentBigProps {
  projectTitle: string;
  isTimeTrackerMinimized: boolean;
  isSubmitting: boolean;
  moneyEarned: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
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
  projectTitle,
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
  salary,
  moneyEarned,
  currency,
  hourlyPayment,
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
          projectTitle={projectTitle}
          state={state}
          activeTime={activeTime}
          pausedTime={pausedTime}
          roundedActiveTime={roundedActiveTime}
          isSubmitting={isSubmitting}
          activeSeconds={activeSeconds}
          storedActiveSeconds={storedActiveSeconds}
          storedPausedSeconds={storedPausedSeconds}
          timerRoundingSettings={timerRoundingSettings}
          currency={currency}
          salary={salary}
          hourlyPayment={hourlyPayment}
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
          projectTitle={projectTitle}
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
          currency={currency}
          salary={salary}
          hourlyPayment={hourlyPayment}
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
