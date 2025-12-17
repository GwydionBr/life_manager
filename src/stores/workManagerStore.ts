import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkStoreState {
  activeProjectId: string | null;
  lastActiveProjectId: string | null;
}

interface WorkStoreActions {
  resetStore: () => void;
  setActiveProjectId: (id: string | null) => void;
}

export const useWorkStore = create<WorkStoreState & WorkStoreActions>()(
  persist(
    (set) => ({
      activeProjectId: null,
      lastActiveProjectId: null,

      resetStore: () =>
        set({
          activeProjectId: null,
          lastActiveProjectId: null,
        }),

      setActiveProjectId(id) {
        set({ activeProjectId: id });
        if (id) {
          set({ lastActiveProjectId: id });
        }
      },
    }),
    {
      name: "work-store",
    }
  )
);
