import { useState, useCallback, useMemo } from "react";
import { useMounted } from "@mantine/hooks";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntryMutations } from "@/db/collections/work/work-time-entry/use-work-time-entry-mutations";
import { useAppointmentMutations } from "@/db/collections/work/appointment/use-appointment-mutations";
import { useTimeTrackerManager, Timer } from "@/stores/timeTrackerManagerStore";

import { alpha, Box, Transition } from "@mantine/core";
import TimeTrackerComponentBig from "./Big/TimeTrackerComponentBig";
import TimeTrackerComponentSmall from "./Small/TimeTrackerComponentSmall";

import { InsertWorkTimeEntry } from "@/types/work.types";
import { AppointmentStatus } from "@/types/workCalendar.types";

interface TimeTrackerInstanceProps {
  timer: Timer;
  isBig: boolean;
  isTimeTrackerMinimized: boolean;
  setIsTimeTrackerMinimized: (value: boolean) => void;
}

export default function TimeTrackerInstance({
  timer,
  isBig,
  isTimeTrackerMinimized,
  setIsTimeTrackerMinimized,
}: TimeTrackerInstanceProps) {
  const isMounted = useMounted();
  const [memo, setMemo] = useState<string>(timer.memo ?? "");
  const { removeTimer, startTimer, stopTimer } = useTimeTrackerManager();

  const { data: projects } = useWorkProjects();
  const project = useMemo(
    () => projects.find((p) => p.id === timer.projectId),
    [projects, timer.projectId]
  );

  const { addWorkTimeEntry } = useWorkTimeEntryMutations();
  const { updateAppointment } = useAppointmentMutations();

  const [showSmall, setShowSmall] = useState(true);

  // TODO: Implement stopping other running timers
  // const stopOtherRunningTimers = useCallback(() => {
  //   const allTimers = getAllTimers();
  //   allTimers.forEach((otherTimer) => {
  //     // Skip current timer and only stop running timers
  //     if (
  //       otherTimer.id !== timer.id &&
  //       otherTimer.state === TimerState.Running
  //     ) {
  //       setForceEndTimer(otherTimer.id, true);
  //     }
  //   });
  // }, [timer, getAllTimers, setForceEndTimer]);

  const { timerState, getCurrentTimeEntry } = useTimeTracker(timer);

  const startTimerWithStopOthers = useCallback(() => {
    // Check if automatic stopping is enabled (defaults to true)
    // TODO: Implement stopping other running timers
    // if (settings?.automaticly_stop_other_timer ?? true) {
    //   stopOtherRunningTimers();
    // }
    startTimer(timer.id);
  }, [startTimer, timer.id]);

  // TODO: Check if restoring timer is still needed
  // useEffect(() => {
  //   restoreTimer();
  //   // TODO Check if this is needed
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // TODO: Check if force end timer is still needed
  // useEffect(() => {
  //   if (forceEndTimer) {
  //     submitTimer();
  //     setForceEndTimer(timer.id, false);
  //   }
  //   // TODO Check if this is needed
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [forceEndTimer]);

  // Don't render until component is mounted
  if (!isMounted) return null;

  async function submitTimer() {
    // Prevent double submission (commented out until mutation hook is implemented)
    // if (isCreatingWorkTimeEntry) return;

    // Get session data from hook (includes proper rounding calculations)
    let newSession: InsertWorkTimeEntry = {
      ...getCurrentTimeEntry(),
      memo: memo === "" ? null : memo,
    };

    const newTimeEntry = await addWorkTimeEntry(
      newSession,
      timerState.timerRoundingSettings
    );

    if (timer.appointmentId && newTimeEntry) {
      await updateAppointment(timer.appointmentId, {
        work_time_entry_id: newTimeEntry[0].id,
        status: AppointmentStatus.CONVERTED,
      });
    }

    // Reset timer state after submission
    stopTimer(timer.id);
    setMemo("");
  }

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
              timerState={timerState}
              color={project?.color ?? null}
              backgroundColor={
                project?.color
                  ? alpha(project.color, 0.1)
                  : "var(--mantine-color-body)"
              }
              removeTimer={() => removeTimer(timer.id)}
              memo={memo}
              startTimer={startTimerWithStopOthers}
              cancelTimer={() => stopTimer(timer.id)}
              isTimeTrackerMinimized={isTimeTrackerMinimized}
              setIsTimeTrackerMinimized={setIsTimeTrackerMinimized}
              setMemo={setMemo}
              submitTimer={submitTimer}
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
              timerState={timerState}
              showSmall={showSmall}
              setShowSmall={setShowSmall}
              submitTimer={submitTimer}
              startTimer={startTimerWithStopOthers}
              cancelTimer={() => stopTimer(timer.id)}
            />
          </div>
        )}
      </Transition>
    </Box>
  );
}
