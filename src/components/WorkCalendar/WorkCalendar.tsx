import { useEffect, useMemo, useRef, useState } from "react";
import { useDisclosure, useHotkeys, usePrevious } from "@mantine/hooks";
import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";
import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useCalendarStore } from "@/stores/calendarStore";

import { ScrollArea, Stack } from "@mantine/core";
import CalendarGrid from "./Calendar/CalendarGrid";
import EditTimeEntryDrawer from "@/components/Work/WorkTimeEntry/EditTimeEntryDrawer";
import CalendarLegend from "./Calendar/CalendarLegend";

import { getStartOfDay } from "./calendarUtils";
import { addDays, differenceInCalendarDays } from "date-fns";

import {
  CalendarSession,
  CalendarDay,
  CalendarAppointment,
} from "@/types/workCalendar.types";
import { WorkProject } from "@/types/work.types";

const zoomLevel = [1, 2, 4, 6, 12]; // multiplier for hour height

export default function WorkCalendar() {
  const {
    viewMode,
    setViewMode,
    rasterHeight,
    addingMode,
    setAddingMode,
    referenceDate,
    setReferenceDate,
    selectedSession,
    setSelectedSession,
    selectedProject,
    setSelectedProject,
    dateRange,
    setDateRange,
    currentDateRange,
    setCurrentDateRange,
    zoomIndex,
  } = useCalendarStore();
  const { data: projects } = useWorkProjects();
  const { data: timeEntries } = useWorkTimeEntries();
  const { data: appointments } = useAppointments();
  const [viewportTop, setViewportTop] = useState({
    old: 0,
    new: 0,
    isSmooth: false,
  });
  const [drawerOpened, { open, close }] = useDisclosure(false);
  const viewport = useRef<HTMLDivElement>(null);
  const previousZoomIndex = usePrevious(zoomIndex);

  useHotkeys([
    [
      "Escape",
      () => {
        if (addingMode) {
          setAddingMode(false);
        }
      },
    ],
    [
      "mod + Enter",
      () => {
        if (!addingMode) {
          setAddingMode(true);
        }
      },
    ],
  ]);

  const days: Date[] = useMemo(() => {
    const [rangeStart, rangeEnd] = currentDateRange;
    if (viewMode === "day") return [getStartOfDay(referenceDate)];

    const start = getStartOfDay(rangeStart);
    const end = getStartOfDay(rangeEnd);
    const length = differenceInCalendarDays(end, start) + 1;
    return Array.from({ length }, (_, i) => addDays(start, i));
  }, [viewMode, currentDateRange, referenceDate]);

  const sessionsByDay = useMemo(() => {
    // Bucket raw sessions by day key so we can render a column per day
    const map = new Map<string, CalendarSession[]>();
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });
    timeEntries.forEach((s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      // include session if any overlap with current range days
      days.forEach((d) => {
        const dayStart = getStartOfDay(d);
        const dayEnd = addDays(dayStart, 1);
        const overlaps = start < dayEnd && end > dayStart;
        const project = projects.find((p) => p.id === s.work_project_id);
        if (overlaps) {
          const key = dayStart.toISOString().slice(0, 10);
          map.get(key)?.push({
            ...s,
            projectTitle: project?.title ?? "",
            color: project?.color ?? "var(--mantine-color-teal-6)",
          });
        }
      });
    });
    return map;
  }, [timeEntries, days, projects]);

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });
    appointments.forEach((a) => {
      const start = new Date(a.start_date);
      const end = new Date(a.end_date);
      const day = a.start_date.slice(0, 10);
      days.forEach((d) => {
        const dayStart = getStartOfDay(d);
        const dayEnd = addDays(dayStart, 1);
        const overlaps = start < dayEnd && end > dayStart;
        const project = projects.find((p) => p.id === a.work_project_id);
        if (overlaps) {
          map.get(day)?.push({
            ...a,
            projectTitle: project?.title ?? "",
            color: project?.color ?? "var(--mantine-color-teal-6)",
          });
        }
      });
    });
    return map;
  }, [appointments, days, projects]);

  const calendarDays: CalendarDay[] = useMemo(() => {
    return days.map((d) => ({
      day: d,
      sessions: sessionsByDay.get(d.toISOString().slice(0, 10)) ?? [],
      appointments: appointmentsByDay.get(d.toISOString().slice(0, 10)) ?? [],
    }));
  }, [days, sessionsByDay, appointmentsByDay]);

  // Projects visible in the current view (based on sessions overlapping the visible days)
  const visibleProjects: WorkProject[] = useMemo(() => {
    const ids = new Set<string>();
    sessionsByDay.forEach((items) => {
      items.forEach((s) => ids.add(String(s.work_project_id)));
    });

    // Sort projects by total time (descending) and assign colors based on time ranking
    const activeProjects = Array.from(ids)
      .map((id) => {
        const p = projects.find((pp) => pp.id === id);
        if (!p) return undefined;
        return p;
      })
      .filter((p) => p !== undefined);

    if (activeProjects.length === 0) return [];

    return activeProjects;
  }, [sessionsByDay, projects]);

  function getCurrentTime() {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    return (currentHour * 60 + currentMinute) / 60;
  }

  function handleReferenceDateChange(date: Date) {
    setReferenceDate(date);
    setViewMode("day");
  }

  function handleNextAndPrev(delta: number = 1) {
    if (viewMode === "day") {
      setReferenceDate(addDays(referenceDate, delta));
      return;
    }
    const [s, e] = dateRange;
    if (s && e) {
      const len = differenceInCalendarDays(e, s) + 1;
      const ns = addDays(s, delta * len);
      const ne = addDays(e, delta * len);
      setDateRange([ns, ne]);
      setCurrentDateRange([ns, ne]);
      setReferenceDate(ns);
    } else {
      setReferenceDate(addDays(referenceDate, delta * 7));
    }
  }

  function handleSessionClick(sessionId: string) {
    const session = timeEntries.find((s) => s.id === sessionId);
    const project = projects.find((p) => p.id === session?.work_project_id);
    if (session && project) {
      setSelectedSession(session);
      setSelectedProject(project);
      open();
    }
  }

  useEffect(() => {
    // if (!isFetchingProjects || !isFetchingTimeEntries) {
    handleScrollToNow();
    // }
  }, []);

  useEffect(() => {
    if (viewport.current && viewportTop.new !== viewportTop.old) {
      viewport.current.scrollTo({
        top: viewportTop.new,
        behavior: viewportTop.isSmooth ? "smooth" : "instant",
      });
      setViewportTop({
        old: viewportTop.new,
        new: viewportTop.new,
        isSmooth: true,
      });
    }
  }, [viewportTop, viewport.current]);

  // This effect is used to keep the viewport top position when the zoom index changes
  // Is used instead of handleZoomChange in CalendarHeader
  useEffect(() => {
    if (viewport.current && previousZoomIndex) {
      const currentTimeTop =
        (viewport.current.scrollTop - 50) /
        (rasterHeight * zoomLevel[previousZoomIndex]);

      const roundedTimeTop = Math.round(currentTimeTop * 100) / 100;

      const newTop = roundedTimeTop * rasterHeight * zoomLevel[zoomIndex] + 50;

      setViewportTop((prev) => ({
        old: prev.new,
        new: newTop,
        isSmooth: false,
      }));
    }
  }, [zoomIndex]);

  // function handleZoomChange(oldIndex: number, newIndex: number) {
  //   if (viewport.current) {
  //     const currentTimeTop =
  //       (viewport.current.scrollTop - 50) /
  //       (rasterHeight * zoomLevel[oldIndex]);

  //     const roundedTimeTop = Math.round(currentTimeTop * 100) / 100;

  //     const newTop = roundedTimeTop * rasterHeight * zoomLevel[newIndex] + 50;

  //     setViewportTop((prev) => ({
  //       old: prev.new,
  //       new: newTop,
  //       isSmooth: false,
  //     }));
  //   }
  // }

  function handleScrollToNow() {
    if (viewport.current) {
      const currentTime = getCurrentTime();
      viewport.current.scrollTo({
        top: currentTime * rasterHeight * zoomLevel[zoomIndex] - 50,
        behavior: "smooth",
      });
    }
  }

  return (
    <ScrollArea
      viewportRef={viewport}
      h="calc(100vh - 60px)"
      type="never"
      scrollbars="y"
    >
      <Stack>
        {/* <CalendarHeader
          referenceDate={referenceDate}
          handleZoomChange={handleZoomChange}
        /> */}
        <CalendarGrid
          visibleProjects={visibleProjects}
          handleNextAndPrev={handleNextAndPrev}
          isFetching={
            // isFetchingProjects ||
            // isFetchingTimeEntries ||
            // isFetchingAppointments
            false
          }
          days={calendarDays}
          setReferenceDate={handleReferenceDateChange}
          handleSessionClick={handleSessionClick}
          hourMultiplier={zoomLevel[zoomIndex]}
          rasterHeight={rasterHeight}
        />
      </Stack>
      <CalendarLegend
        visibleProjects={visibleProjects}
        handleScrollToNow={handleScrollToNow}
      />
      {selectedSession && selectedProject && (
        <EditTimeEntryDrawer
          timeEntry={selectedSession}
          project={selectedProject}
          opened={drawerOpened}
          onClose={() => {
            close();
            setSelectedSession(null);
            setSelectedProject(null);
          }}
        />
      )}
    </ScrollArea>
  );
}
