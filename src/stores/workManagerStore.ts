import { get } from "http";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkStoreState {
  activeProjectId: string | null;
  lastActiveProjectId: string | null;
  analysisOpened: boolean;
  editProjectOpened: boolean;
  isWorkNavbarOpen: boolean;
}

interface WorkStoreActions {
  setActiveProjectId: (id: string | null) => void;
  setAnalysisOpened: (opened: boolean) => void;
  toggleAnalysisOpened: () => void;
  setEditProjectOpened: (opened: boolean) => void;
  toggleEditProjectOpened: () => void;
  setIsWorkNavbarOpen: (opened: boolean) => void;
  toggleWorkNavbar: () => void;
  resetStore: () => void;
}

const initialState: WorkStoreState = {
  activeProjectId: null,
  lastActiveProjectId: null,
  analysisOpened: false,
  editProjectOpened: false,
  isWorkNavbarOpen: false,
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
