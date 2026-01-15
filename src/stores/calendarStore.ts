import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TimerData } from "@/types/timeTracker.types";
import { ViewMode } from "@/types/workCalendar.types";
import { startOfWeek, endOfWeek } from "date-fns";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";

interface CalendarStoreState {
  activeTimer: TimerData | null;
  selectedProject: WorkProject | null;
  selectedSession: WorkTimeEntry | null;
  dateRange: [Date | null, Date | null];
  currentDateRange: [Date, Date];
  referenceDate: Date;
  newEventStartY: number | null;
  newEventEndY: number | null;
  newEventDay: Date | null;
  viewMode: ViewMode;
  zoomIndex: number;
  rasterHeight: number;
  eventIsHovered: boolean;
  eventIsSelected: boolean;
  addingMode: boolean;
  isCalendarAsideMinimized: boolean;
}

interface CalendarStoreActions {
  resetStore: () => void;
  setViewMode: (viewMode: ViewMode) => void;
  changeZoomIndex: (delta: number) => void;
  setSelectedProject: (selectedProject: WorkProject | null) => void;
  setSelectedSession: (selectedSession: WorkTimeEntry | null) => void;
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  setCurrentDateRange: (currentDateRange: [Date, Date]) => void;
  setReferenceDate: (referenceDate: Date) => void;
  setNewEventStartY: (newEventStartY: number | null) => void;
  setNewEventEndY: (newEventEndY: number | null) => void;
  setNewEventDay: (newEventDay: Date | null) => void;
  setActiveTimer: (timer: TimerData | null) => void;
  setEventIsHovered: (isHovered: boolean) => void;
  setEventIsSelected: (isSelected: boolean) => void;
  setAddingMode: (isAddingMode: boolean) => void;
  setIsCalendarAsideMinimized: (isMinimized: boolean) => void;
}

export const useCalendarStore = create<
  CalendarStoreState & CalendarStoreActions
>()(
  persist(
    (set) => ({
      activeTimer: null,
      viewMode: "week",
      zoomIndex: 1,
      rasterHeight: 60,
      eventIsHovered: false,
      eventIsSelected: false,
      addingMode: false,
      selectedProject: null,
      selectedSession: null,
      dateRange: [
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        endOfWeek(new Date(), { weekStartsOn: 1 }),
      ],
      currentDateRange: [
        startOfWeek(new Date(), { weekStartsOn: 1 }),
        endOfWeek(new Date(), { weekStartsOn: 1 }),
      ],
      referenceDate: new Date(),
      newEventStartY: null,
      newEventEndY: null,
      newEventDay: null,
      isCalendarAsideMinimized: true,
      resetStore: () =>
        set({
          activeTimer: null,
          viewMode: "week",
          zoomIndex: 1,
          rasterHeight: 60,
          eventIsHovered: false,
          eventIsSelected: false,
          addingMode: false,
          selectedProject: null,
          selectedSession: null,
          dateRange: [
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            endOfWeek(new Date(), { weekStartsOn: 1 }),
          ],
          currentDateRange: [
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            endOfWeek(new Date(), { weekStartsOn: 1 }),
          ],
          referenceDate: new Date(),
          newEventStartY: null,
          newEventEndY: null,
          newEventDay: null,
          isCalendarAsideMinimized: true,
        }),
      setIsCalendarAsideMinimized: (isMinimized: boolean) =>
        set({ isCalendarAsideMinimized: isMinimized }),
      setActiveTimer: (timer: TimerData | null) => set({ activeTimer: timer }),
      setEventIsHovered: (isHovered: boolean) =>
        set({ eventIsHovered: isHovered }),
      setEventIsSelected: (isSelected: boolean) =>
        set({ eventIsSelected: isSelected }),
      setAddingMode: (isAddingMode: boolean) =>
        set({ addingMode: isAddingMode }),
      setSelectedProject: (selectedProject: WorkProject | null) =>
        set({ selectedProject }),
      setSelectedSession: (selectedSession: WorkTimeEntry | null) =>
        set({ selectedSession }),
      setDateRange: (dateRange: [Date | null, Date | null]) =>
        set({ dateRange }),
      setCurrentDateRange: (currentDateRange: [Date, Date]) =>
        set({ currentDateRange }),
      setReferenceDate: (referenceDate: Date) => set({ referenceDate }),
      setNewEventStartY: (newEventStartY: number | null) =>
        set({ newEventStartY: newEventStartY }),
      setNewEventEndY: (newEventEndY: number | null) =>
        set({ newEventEndY: newEventEndY }),
      setNewEventDay: (newEventDay: Date | null) =>
        set({ newEventDay: newEventDay }),
      setViewMode: (viewMode: ViewMode) => set({ viewMode }),
      changeZoomIndex: (delta: number) =>
        set((state) => ({
          zoomIndex: Math.max(0, Math.min(state.zoomIndex + delta, 4)),
        })),
    }),
    {
      name: "calendar-store",
      partialize: (state) => ({
        zoomIndex: state.zoomIndex,
        isCalendarAsideMinimized: state.isCalendarAsideMinimized,
        referenceDate: state.referenceDate,
      }),
    }
  )
);
