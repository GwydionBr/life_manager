import { create } from "zustand";
import { persist } from "zustand/middleware";

import { TimerData } from "@/types/timeTracker.types";
import { ViewMode } from "@/types/workCalendar.types";
import { addDays } from "date-fns";
import { WorkProject, WorkTimeEntry } from "@/types/work.types";

interface CalendarStoreState {
  activeTimer: TimerData | null;
  selectedProject: WorkProject | null;
  selectedSession: WorkTimeEntry | null;
  // View-specific date states
  dayViewDate: Date;
  weekViewDateRange: [Date , Date];
  monthViewDate: Date;
  // Legacy fields for backward compatibility (computed from view-specific states)
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
  // View-specific setters
  setDayViewDate: (date: Date) => void;
  setWeekViewDateRange: (dateRange: [Date, Date]) => void;
  setMonthViewDate: (date: Date) => void;
  // Legacy setters for backward compatibility
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

const today = new Date();
const initialWeekRange: [Date, Date] = [addDays(today, -3), addDays(today, 3)];

const initialState: CalendarStoreState = {
  activeTimer: null,
  viewMode: "week",
  zoomIndex: 1,
  rasterHeight: 60,
  eventIsHovered: false,
  eventIsSelected: false,
  addingMode: false,
  selectedProject: null,
  selectedSession: null,
  // View-specific initial states
  dayViewDate: today,
  weekViewDateRange: initialWeekRange,
  monthViewDate: today,
  // Legacy fields initialized from view-specific states
  dateRange: initialWeekRange,
  currentDateRange: initialWeekRange,
  referenceDate: today,
  newEventStartY: null,
  newEventEndY: null,
  newEventDay: null,
  isCalendarAsideMinimized: true,
};

export const useCalendarStore = create<
  CalendarStoreState & CalendarStoreActions
>()(
  persist(
    (set) => ({
      ...initialState,
      resetStore: () =>
        set({
          ...initialState,
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
      // View-specific setters
      setDayViewDate: (date: Date) =>
        set((state) => ({
          dayViewDate: date,
          referenceDate: state.viewMode === "day" ? date : state.referenceDate,
        })),
      setWeekViewDateRange: (dateRange: [Date, Date]) =>
        set((state) => ({
          weekViewDateRange: dateRange,
          dateRange: state.viewMode === "week" ? dateRange : state.dateRange,
          currentDateRange:
            state.viewMode === "week" ? dateRange : state.currentDateRange,
          referenceDate:
            state.viewMode === "week" ? dateRange[0] : state.referenceDate,
        })),
      setMonthViewDate: (date: Date) =>
        set((state) => ({
          monthViewDate: date,
          referenceDate:
            state.viewMode === "month" ? date : state.referenceDate,
        })),
      // Legacy setters for backward compatibility
      setDateRange: (dateRange: [Date | null, Date | null]) =>
        set((state) => {
          if (state.viewMode === "week" && dateRange[0] && dateRange[1]) {
            return {
              dateRange,
              weekViewDateRange: [dateRange[0], dateRange[1]],
              currentDateRange: [dateRange[0], dateRange[1]],
            };
          }
          return { dateRange };
        }),
      setCurrentDateRange: (currentDateRange: [Date, Date]) =>
        set((state) => {
          if (state.viewMode === "week") {
            return {
              currentDateRange,
              weekViewDateRange: currentDateRange,
              dateRange: currentDateRange,
            };
          }
          return { currentDateRange };
        }),
      setReferenceDate: (referenceDate: Date) =>
        set((state) => {
          if (state.viewMode === "day") {
            return { referenceDate, dayViewDate: referenceDate };
          }
          if (state.viewMode === "month") {
            return { referenceDate, monthViewDate: referenceDate };
          }
          return { referenceDate };
        }),
      setNewEventStartY: (newEventStartY: number | null) =>
        set({ newEventStartY: newEventStartY }),
      setNewEventEndY: (newEventEndY: number | null) =>
        set({ newEventEndY: newEventEndY }),
      setNewEventDay: (newEventDay: Date | null) =>
        set({ newEventDay: newEventDay }),
      setViewMode: (viewMode: ViewMode) =>
        set((state) => {
          // When switching views, update legacy fields based on the new view mode
          let newReferenceDate = state.referenceDate;
          let newDateRange: [Date | null, Date | null] = state.dateRange;
          let newCurrentDateRange: [Date, Date] = state.currentDateRange;

          if (viewMode === "day") {
            newReferenceDate = state.dayViewDate;
          } else if (viewMode === "week") {
            newReferenceDate = state.weekViewDateRange[0];
            newDateRange = state.weekViewDateRange;
            newCurrentDateRange = state.weekViewDateRange;
          } else if (viewMode === "month") {
            newReferenceDate = state.monthViewDate;
          }

          return {
            viewMode,
            referenceDate: newReferenceDate,
            dateRange: newDateRange,
            currentDateRange: newCurrentDateRange,
          };
        }),
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
      }),
    }
  )
);
