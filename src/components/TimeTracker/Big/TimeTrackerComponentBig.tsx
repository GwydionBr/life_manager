import { Stack, Collapse } from "@mantine/core";
import TimeTrackerComponentBigMin from "./TimeTrackerComponentBigMin";
import TimeTrackerComponentBigMax from "./TimeTrackerComponentBigMax";
import { TimeTrackerState } from "@/hooks/useTimeTracker";

interface TimeTrackerComponentBigProps {
  timerState: TimeTrackerState;
  isTimeTrackerMinimized: boolean;
  memo: string;
  color: string | null;
  backgroundColor: string;
  removeTimer: () => void;
  submitTimer: () => void;
  setIsTimeTrackerMinimized: (value: boolean) => void;
  startTimer: () => void;
  cancelTimer: () => void;
  setMemo: (memo: string) => void;
}

export default function TimeTrackerComponentBig({
  timerState,
  isTimeTrackerMinimized,
  memo,
  color,
  backgroundColor,
  removeTimer,
  submitTimer,
  startTimer,
  cancelTimer,
  setMemo,
}: TimeTrackerComponentBigProps) {
  return (
    <Stack align="center" w="100%">
      <Collapse in={isTimeTrackerMinimized} transitionDuration={400}>
        <TimeTrackerComponentBigMin
          timerState={timerState}
          startTimer={startTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          removeTimer={removeTimer}
          color={color}
          backgroundColor={backgroundColor}
        />
      </Collapse>
      <Collapse in={!isTimeTrackerMinimized} transitionDuration={400}>
        <TimeTrackerComponentBigMax
          timerState={timerState}
          memo={memo}
          color={color}
          backgroundColor={backgroundColor}
          startTimer={startTimer}
          submitTimer={submitTimer}
          cancelTimer={cancelTimer}
          removeTimer={removeTimer}
          setMemo={setMemo}
        />
      </Collapse>
    </Stack>
  );
}
