import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile } from "@/types/profile.types";

interface ProfileState extends Profile {}

interface ProfileActions {
  setProfileState: (adjustment: Partial<ProfileState>) => void;
  resetStore: () => void;
}

const initialState: ProfileState = {
  avatar_url: null,
  created_at: "",
  email: "",
  full_name: null,
  id: "",
  initialized: false,
  updated_at: null,
  username: "",
  website: null,
};

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setProfileState: (adjustment: Partial<ProfileState>) => {
        set({ ...get(), ...adjustment });
      },
      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: "profile",
    }
  )
);
