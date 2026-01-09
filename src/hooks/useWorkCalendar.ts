import { useEffect, useMemo, useRef, useCallback } from "react";
import { useDisclosure, usePrevious } from "@mantine/hooks";

import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";
import { useAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useCalendarStore } from "@/stores/calendarStore";

import { getStartOfDay } from "@/components/WorkCalendar/calendarUtils";
import { addDays, differenceInCalendarDays } from "date-fns";

import {
  CalendarSession,
  CalendarAppointment,
  CalendarDay,
  CalendarEvent,
  ViewMode,
} from "@/types/workCalendar.types";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";

// Zoom levels for hour height multiplier
const ZOOM_LEVELS = [1, 2, 4, 6, 12] as const;

// Default appointment color when no project is associated
const DEFAULT_APPOINTMENT_COLOR = "var(--mantine-color-gray-6)";
const DEFAULT_SESSION_COLOR = "var(--mantine-color-teal-6)";

interface ViewportTop {
  old: number;
  new: number;
  isSmooth: boolean;
}

interface UseWorkCalendarReturn {
  // Data
  calendarDays: CalendarDay[];
  visibleProjects: WorkProject[];
  projects: WorkProject[];

  // State
  drawerOpened: boolean;
  selectedSession: WorkTimeEntry | null;
  selectedProject: WorkProject | null;
  addingMode: boolean;
  viewMode: ViewMode;
  zoomIndex: number;
  rasterHeight: number;
  hourMultiplier: number;

  // Refs
  viewport: React.RefObject<HTMLDivElement | null>;

  // Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  handleReferenceDateChange: (date: Date) => void;
  handleNextAndPrev: (delta?: number) => void;
  handleSessionClick: (sessionId: string) => void;
  handleAppointmentClick: (appointmentId: string) => void;
  handleScrollToNow: () => void;
  setAddingMode: (mode: boolean) => void;
}

/**
 * Custom hook to manage work calendar state and logic
 *
 * Features:
 * - Combines time entries and appointments into unified calendar view
 * - Handles day/week view modes with date navigation
 * - Manages zoom levels and scroll position
 * - Provides sorted events for each day
 */
export function useWorkCalendar(): UseWorkCalendarReturn {
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

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const viewport = useRef<HTMLDivElement>(null);
  const previousZoomIndex = usePrevious(zoomIndex);

  // Current zoom multiplier
  const hourMultiplier = ZOOM_LEVELS[zoomIndex];

  /**
   * Generate array of dates to display based on view mode and date range
   */
  const days: Date[] = useMemo(() => {
    const [rangeStart, rangeEnd] = currentDateRange;

    if (viewMode === "day") {
      return [getStartOfDay(referenceDate)];
    }

    const start = getStartOfDay(rangeStart);
    const end = getStartOfDay(rangeEnd);
    const length = differenceInCalendarDays(end, start) + 1;

    return Array.from({ length }, (_, i) => addDays(start, i));
  }, [viewMode, currentDateRange, referenceDate]);

  /**
   * Create a map of project ID to project for fast lookups
   */
  const projectMap = useMemo(() => {
    return new Map(projects.map((p) => [p.id, p]));
  }, [projects]);

  /**
   * Bucket sessions by day with project info attached
   * Sessions are sorted by start time within each day
   */
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();

    // Initialize all days with empty arrays
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });

    // Distribute sessions to overlapping days
    timeEntries.forEach((session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      const project = projectMap.get(session.work_project_id);

      const calendarSession: CalendarSession = {
        ...session,
        projectTitle: project?.title ?? "",
        color: project?.color ?? DEFAULT_SESSION_COLOR,
      };

      // Check each day for overlap with this session
      days.forEach((d) => {
        const dayStart = getStartOfDay(d);
        const dayEnd = addDays(dayStart, 1);
        const overlaps = start < dayEnd && end > dayStart;

        if (overlaps) {
          const key = dayStart.toISOString().slice(0, 10);
          map.get(key)?.push(calendarSession);
        }
      });
    });

    // Sort sessions within each day by start time
    map.forEach((sessions) => {
      sessions.sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });

    return map;
  }, [timeEntries, days, projectMap]);

  /**
   * Bucket appointments by day with project info attached
   * Appointments are sorted by start date within each day
   */
  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();

    // Initialize all days with empty arrays
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });

    // Distribute appointments to overlapping days
    appointments.forEach((appointment) => {
      const start = new Date(appointment.start_date);
      const end = new Date(appointment.end_date);
      const project = appointment.work_project_id
        ? projectMap.get(appointment.work_project_id)
        : null;

      const calendarAppointment: CalendarAppointment = {
        ...appointment,
        projectTitle: project?.title ?? "",
        color: project?.color ?? DEFAULT_APPOINTMENT_COLOR,
      };

      // Check each day for overlap with this appointment
      days.forEach((d) => {
        const dayStart = getStartOfDay(d);
        const dayEnd = addDays(dayStart, 1);
        const overlaps = start < dayEnd && end > dayStart;

        if (overlaps) {
          const key = dayStart.toISOString().slice(0, 10);
          map.get(key)?.push(calendarAppointment);
        }
      });
    });

    // Sort appointments within each day by start date
    map.forEach((appts) => {
      appts.sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
    });

    return map;
  }, [appointments, days, projectMap]);

  /**
   * Combine sessions and appointments into unified calendar days
   * Events are sorted by start time for chronological ordering
   */
  const calendarDays: CalendarDay[] = useMemo(() => {
    return days.map((d) => {
      const key = d.toISOString().slice(0, 10);
      const sessions = sessionsByDay.get(key) ?? [];
      const dayAppointments = appointmentsByDay.get(key) ?? [];

      // Create unified events list sorted by start time
      const events: CalendarEvent[] = [
        ...sessions.map(
          (s): CalendarEvent => ({
            type: "session",
            data: s,
          })
        ),
        ...dayAppointments.map(
          (a): CalendarEvent => ({
            type: "appointment",
            data: a,
          })
        ),
      ].sort((a, b) => {
        const aStart =
          a.type === "session"
            ? new Date(a.data.start_time).getTime()
            : new Date(a.data.start_date).getTime();
        const bStart =
          b.type === "session"
            ? new Date(b.data.start_time).getTime()
            : new Date(b.data.start_date).getTime();
        return aStart - bStart;
      });

      return {
        day: d,
        sessions,
        appointments: dayAppointments,
        events,
      };
    });
  }, [days, sessionsByDay, appointmentsByDay]);

  /**
   * Get all projects visible in the current view
   * Based on sessions and appointments overlapping visible days
   */
  const visibleProjects: WorkProject[] = useMemo(() => {
    const projectIds = new Set<string>();

    // Collect project IDs from sessions
    sessionsByDay.forEach((sessions) => {
      sessions.forEach((s) => {
        if (s.work_project_id) {
          projectIds.add(s.work_project_id);
        }
      });
    });

    // Collect project IDs from appointments
    appointmentsByDay.forEach((appts) => {
      appts.forEach((a) => {
        if (a.work_project_id) {
          projectIds.add(a.work_project_id);
        }
      });
    });

    // Map IDs to projects and filter out undefined
    const activeProjects = Array.from(projectIds)
      .map((id) => projectMap.get(id))
      .filter((p): p is WorkProject => p !== undefined);

    // Sort by title for consistent ordering
    return activeProjects.sort((a, b) => a.title.localeCompare(b.title));
  }, [sessionsByDay, appointmentsByDay, projectMap]);

  /**
   * Get current time as decimal hours (e.g., 14.5 for 2:30 PM)
   */
  const getCurrentTime = useCallback(() => {
    const now = new Date();
    return (now.getHours() * 60 + now.getMinutes()) / 60;
  }, []);

  /**
   * Handle reference date change and switch to day view
   */
  const handleReferenceDateChange = useCallback(
    (date: Date) => {
      setReferenceDate(date);
      setViewMode("day");
    },
    [setReferenceDate, setViewMode]
  );

  /**
   * Navigate to next/previous time period
   */
  const handleNextAndPrev = useCallback(
    (delta: number = 1) => {
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
    },
    [
      viewMode,
      referenceDate,
      dateRange,
      setReferenceDate,
      setDateRange,
      setCurrentDateRange,
    ]
  );

  /**
   * Handle session click to open edit drawer
   */
  const handleSessionClick = useCallback(
    (sessionId: string) => {
      const session = timeEntries.find((s) => s.id === sessionId);
      const project = session
        ? projectMap.get(session.work_project_id)
        : undefined;

      if (session && project) {
        setSelectedSession(session);
        setSelectedProject(project);
        openDrawer();
      }
    },
    [
      timeEntries,
      projectMap,
      setSelectedSession,
      setSelectedProject,
      openDrawer,
    ]
  );

  /**
   * Handle appointment click to open edit drawer
   * TODO: Implement appointment edit drawer
   */
  const handleAppointmentClick = useCallback(
    (appointmentId: string) => {
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (appointment) {
        // TODO: Implement appointment editing
        console.log("Appointment clicked:", appointment);
      }
    },
    [appointments]
  );

  /**
   * Scroll viewport to current time
   */
  const handleScrollToNow = useCallback(() => {
    if (viewport.current) {
      const currentTime = getCurrentTime();
      viewport.current.scrollTo({
        top: currentTime * rasterHeight * hourMultiplier - 50,
        behavior: "smooth",
      });
    }
  }, [getCurrentTime, rasterHeight, hourMultiplier]);

  /**
   * Close drawer and clear selection
   */
  const handleCloseDrawer = useCallback(() => {
    closeDrawer();
    setSelectedSession(null);
    setSelectedProject(null);
  }, [closeDrawer, setSelectedSession, setSelectedProject]);

  // Scroll to current time on initial mount
  useEffect(() => {
    handleScrollToNow();
  }, []);

  // Maintain scroll position when zoom changes
  useEffect(() => {
    if (viewport.current && previousZoomIndex !== undefined) {
      const currentTimeTop =
        (viewport.current.scrollTop - 50) /
        (rasterHeight * ZOOM_LEVELS[previousZoomIndex]);

      const roundedTimeTop = Math.round(currentTimeTop * 100) / 100;
      const newTop = roundedTimeTop * rasterHeight * hourMultiplier + 50;

      viewport.current.scrollTo({
        top: newTop,
        behavior: "instant",
      });
    }
  }, [zoomIndex, previousZoomIndex, rasterHeight, hourMultiplier]);

  return {
    // Data
    calendarDays,
    visibleProjects,
    projects,

    // State
    drawerOpened,
    selectedSession,
    selectedProject,
    addingMode,
    viewMode,
    zoomIndex,
    rasterHeight,
    hourMultiplier,

    // Refs
    viewport,

    // Actions
    openDrawer,
    closeDrawer: handleCloseDrawer,
    handleReferenceDateChange,
    handleNextAndPrev,
    handleSessionClick,
    handleAppointmentClick,
    handleScrollToNow,
    setAddingMode,
  };
}
