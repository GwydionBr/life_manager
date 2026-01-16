import {
  useMemo,
  useRef,
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";
import { useDisclosure, usePrevious, useDidUpdate } from "@mantine/hooks";

import { useWorkProjects } from "@/db/collections/work/work-project/use-work-project-query";
import { useWorkTimeEntries } from "@/db/collections/work/work-time-entry/use-work-time-entry-query";
import { useCalendarAppointments } from "@/db/collections/work/appointment/use-appointment-query";
import { useCalendarStore } from "@/stores/calendarStore";

import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { de, enUS } from "date-fns/locale";

import {
  CalendarTimeEntry,
  CalendarAppointment,
  CalendarDay,
  CalendarEvent,
  ViewMode,
} from "@/types/workCalendar.types";
import { WorkProject, WorkTimeEntry, Appointment } from "@/types/work.types";
import { useIntl } from "./useIntl";

// Zoom levels for hour height multiplier
const ZOOM_LEVELS = [1, 2, 4, 6, 12] as const;

// Default appointment color when no project is associated
const DEFAULT_APPOINTMENT_COLOR = "var(--mantine-color-gray-6)";
const DEFAULT_TIME_ENTRY_COLOR = "var(--mantine-color-teal-6)";

interface UseWorkCalendarReturn {
  // Data
  calendarDays: CalendarDay[];
  visibleProjects: WorkProject[];
  projects: WorkProject[];

  // State
  drawerOpened: boolean;
  appointmentDrawerOpened: boolean;
  newAppointmentModalOpened: boolean;
  selectedSession: WorkTimeEntry | null;
  selectedAppointment: Appointment | null;
  selectedProject: WorkProject | null;
  addingMode: boolean;
  viewMode: ViewMode;
  zoomIndex: number;
  rasterHeight: number;
  hourMultiplier: number;
  clickedDate: Date | null;

  // Refs
  viewport: React.RefObject<HTMLDivElement | null>;

  // Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  openAppointmentDrawer: () => void;
  closeAppointmentDrawer: () => void;
  openNewAppointmentModal: () => void;
  closeNewAppointmentModal: () => void;
  handleCreateAppointment: () => void;
  handleReferenceDateChange: (date: Date) => void;
  handleNextAndPrev: (delta?: number) => void;
  handleTimeEntryClick: (timeEntryId: string) => void;
  handleAppointmentClick: (appointmentId: string) => void;
  handleScrollToNow: () => void;
  setAddingMode: (mode: boolean) => void;
  handleDayClick: (date: Date) => void;
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
  const { locale } = useIntl();
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

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const { data: projects } = useWorkProjects();
  const { data: timeEntries } = useWorkTimeEntries();
  const { data: appointments } = useCalendarAppointments();

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [
    appointmentDrawerOpened,
    { open: openAppointmentDrawer, close: closeAppointmentDrawer },
  ] = useDisclosure(false);
  const [
    newAppointmentModalOpened,
    { open: openNewAppointmentModal, close: closeNewAppointmentModal },
  ] = useDisclosure(false);
  const viewport = useRef<HTMLDivElement>(null);
  const previousZoomIndex = usePrevious(zoomIndex);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  // Current zoom multiplier
  const hourMultiplier = ZOOM_LEVELS[zoomIndex];

  /**
   * Generate array of dates to display based on view mode and date range
   */
  const days: Date[] = useMemo(() => {
    if (viewMode === "day") {
      return [startOfDay(referenceDate)];
    }

    if (viewMode === "month") {
      const monthStart = startOfMonth(referenceDate);
      const monthEnd = endOfMonth(referenceDate);
      const calendarStart = startOfWeek(monthStart, {
        locale: locale === "de-DE" ? de : enUS,
      });
      const calendarEnd = endOfWeek(monthEnd, {
        locale: locale === "de-DE" ? de : enUS,
      });

      const daysArray: Date[] = [];
      let currentDay = calendarStart;

      while (currentDay <= calendarEnd) {
        daysArray.push(startOfDay(currentDay));
        currentDay = addDays(currentDay, 1);
      }

      return daysArray;
    }

    // Week view
    const [rangeStart, rangeEnd] = currentDateRange;
    const start = startOfDay(rangeStart);
    const end = startOfDay(rangeEnd);
    const length = differenceInCalendarDays(end, start) + 1;

    return Array.from({ length }, (_, i) => addDays(start, i));
  }, [viewMode, currentDateRange, referenceDate, locale]);

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
    const map = new Map<string, CalendarTimeEntry[]>();

    // Initialize all days with empty arrays
    days.forEach((d) => {
      map.set(d.toISOString().slice(0, 10), []);
    });

    // Distribute sessions to overlapping days
    timeEntries.forEach((session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      const project = projectMap.get(session.work_project_id);

      const calendarSession: CalendarTimeEntry = {
        ...session,
        projectTitle: project?.title ?? "",
        color: project?.color ?? DEFAULT_TIME_ENTRY_COLOR,
      };

      // Check each day for overlap with this session
      days.forEach((d) => {
        const dayStart = startOfDay(d);
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
        const dayStart = startOfDay(d);
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

      if (viewMode === "month") {
        const newDate = addMonths(referenceDate, delta);
        setReferenceDate(newDate);
        // Update date range to cover the entire month
        const monthStart = startOfMonth(newDate);
        const monthEnd = endOfMonth(newDate);
        setDateRange([monthStart, monthEnd]);
        setCurrentDateRange([monthStart, monthEnd]);
        return;
      }

      // Week view
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
   */
  const handleAppointmentClick = useCallback(
    (appointmentId: string) => {
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        openAppointmentDrawer();
      }
    },
    [appointments, openAppointmentDrawer]
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

  /**
   * Close appointment drawer and clear selection
   */
  const handleCloseAppointmentDrawer = useCallback(() => {
    closeAppointmentDrawer();
    setSelectedAppointment(null);
  }, [closeAppointmentDrawer]);

  /**
   * Open appointment modal for creating a new appointment
   */
  const handleCreateAppointment = useCallback(() => {
    setSelectedAppointment(null);
    openNewAppointmentModal();
  }, [openNewAppointmentModal]);

  /**
   * Handle day click in month view - open new entry modal with that date
   */
  const handleDayClick = useCallback(
    (date: Date) => {
      setClickedDate(date);
      setSelectedAppointment(null);
      openNewAppointmentModal();
    },
    [openNewAppointmentModal]
  );

  // Scroll to current time on initial mount
  // Uses useLayoutEffect to run before paint, with a small delay to ensure DOM is ready
  useLayoutEffect(() => {
    // Small timeout to ensure ScrollArea has mounted and rendered
    const timeoutId = requestAnimationFrame(() => {
      handleScrollToNow();
    });
    return () => cancelAnimationFrame(timeoutId);
  }, [handleScrollToNow]);

  // Initialize date range when switching to month view
  useEffect(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(referenceDate);
      const monthEnd = endOfMonth(referenceDate);
      const [currentStart, currentEnd] = currentDateRange;

      // Only update if the current range doesn't match the month
      if (
        !currentStart ||
        !currentEnd ||
        currentStart.getTime() !== monthStart.getTime() ||
        currentEnd.getTime() !== monthEnd.getTime()
      ) {
        setDateRange([monthStart, monthEnd]);
        setCurrentDateRange([monthStart, monthEnd]);
      }
    }
  }, [
    viewMode,
    referenceDate,
    currentDateRange,
    setDateRange,
    setCurrentDateRange,
  ]);

  // Maintain scroll position when zoom changes (only on updates, not initial mount)
  useDidUpdate(() => {
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
  }, [zoomIndex]);

  return {
    // Data
    calendarDays,
    visibleProjects,
    projects,

    // State
    drawerOpened,
    appointmentDrawerOpened,
    newAppointmentModalOpened,
    selectedSession,
    selectedAppointment,
    selectedProject,
    addingMode,
    viewMode,
    zoomIndex,
    rasterHeight,
    hourMultiplier,
    clickedDate,

    // Refs
    viewport,

    // Actions
    openDrawer,
    closeDrawer: handleCloseDrawer,
    openAppointmentDrawer,
    closeAppointmentDrawer: handleCloseAppointmentDrawer,
    openNewAppointmentModal,
    closeNewAppointmentModal: () => {
      closeNewAppointmentModal();
      setClickedDate(null);
    },
    handleCreateAppointment,
    handleReferenceDateChange,
    handleNextAndPrev,
    handleTimeEntryClick: handleSessionClick,
    handleAppointmentClick,
    handleScrollToNow,
    setAddingMode,
    handleDayClick,
  };
}
