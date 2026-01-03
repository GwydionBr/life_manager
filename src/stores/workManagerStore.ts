import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkStoreState {
  activeProjectId: string | null;
  lastActiveProjectId: string | null;
  analysisOpened: boolean;
  editProjectOpened: boolean;
  newWorkTimeEntryFormOpened: boolean;
  isWorkNavbarOpen: boolean;
  filterOpened: boolean;
  payoutOpened: boolean;
  payoutConversionOpened: boolean;
  filterTimeSpan: [Date | null, Date | null];
  selectedModeActive: boolean;
  selectedTimeEntryIds: string[];
}

interface WorkStoreActions {
  setActiveProjectId: (id: string | null) => void;
  setAnalysisOpened: (opened: boolean) => void;
  toggleAnalysisOpened: () => void;
  setEditProjectOpened: (opened: boolean) => void;
  toggleEditProjectOpened: () => void;
  setNewWorkTimeEntryFormOpened: (opened: boolean) => void;
  toggleNewWorkTimeEntryFormOpened: () => void;
  setIsWorkNavbarOpen: (opened: boolean) => void;
  toggleWorkNavbar: () => void;
  setFilterOpened: (opened: boolean) => void;
  toggleFilterOpened: () => void;
  setPayoutOpened: (opened: boolean) => void;
  togglePayoutOpened: () => void;
  setPayoutConversionOpened: (opened: boolean) => void;
  togglePayoutConversionOpened: () => void;
  setFilterTimeSpan: (timeSpan: [Date | null, Date | null]) => void;
  setSelectedModeActive: (active: boolean) => void;
  toggleSelectedModeActive: () => void;
  setSelectedTimeEntryIds: (ids: string[]) => void;
  resetStore: () => void;
}

const initialState: WorkStoreState = {
  activeProjectId: null,
  lastActiveProjectId: null,
  analysisOpened: false,
  editProjectOpened: false,
  isWorkNavbarOpen: true,
  filterOpened: false,
  payoutOpened: false,
  payoutConversionOpened: false,
  filterTimeSpan: [null, null],
  selectedModeActive: false,
  selectedTimeEntryIds: [],
  newWorkTimeEntryFormOpened: false,
};

export const useWorkStore = create<WorkStoreState & WorkStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveProjectId(id) {
        set({ activeProjectId: id });
        if (id) {
          set({ lastActiveProjectId: id });
        }
      },
      setAnalysisOpened(opened) {
        set({ analysisOpened: opened });
      },
      toggleAnalysisOpened() {
        set({ analysisOpened: !get().analysisOpened });
      },
      setEditProjectOpened(opened) {
        set({ editProjectOpened: opened });
      },
      toggleEditProjectOpened() {
        set({ editProjectOpened: !get().editProjectOpened });
      },
      setIsWorkNavbarOpen(opened) {
        set({ isWorkNavbarOpen: opened });
      },
      toggleWorkNavbar() {
        set({ isWorkNavbarOpen: !get().isWorkNavbarOpen });
      },
      setFilterOpened(opened) {
        set({ filterOpened: opened });
      },
      toggleFilterOpened() {
        set({ filterOpened: !get().filterOpened });
      },
      setPayoutOpened(opened) {
        set({ payoutOpened: opened });
      },
      togglePayoutOpened() {
        set({ payoutOpened: !get().payoutOpened });
      },
      setPayoutConversionOpened(opened) {
        set({ payoutConversionOpened: opened });
      },
      togglePayoutConversionOpened() {
        set({ payoutConversionOpened: !get().payoutConversionOpened });
      },
      setFilterTimeSpan(timeSpan) {
        set({ filterTimeSpan: timeSpan });
      },
      setSelectedModeActive(active) {
        set({ selectedModeActive: active });
      },
      toggleSelectedModeActive() {
        set({ selectedModeActive: !get().selectedModeActive });
      },
      setSelectedTimeEntryIds(ids) {
        set({ selectedTimeEntryIds: ids });
      },
      setNewWorkTimeEntryFormOpened(opened) {
        set({ newWorkTimeEntryFormOpened: opened });
      },
      toggleNewWorkTimeEntryFormOpened() {
        set({ newWorkTimeEntryFormOpened: !get().newWorkTimeEntryFormOpened });
      },
      resetStore: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: "work-store",
    }
  )
);
