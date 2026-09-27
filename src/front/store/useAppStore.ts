import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPublic } from "@/models/types/user";

interface AppState {
  user: UserPublic | null;
  isAuthenticated: boolean;
  theme: "light" | "dark" | "system";
  setUser: (user: UserPublic | null) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      theme: "system",
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTheme: (theme) => set({ theme }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "app-storage", // name of the item in the storage (must be unique)
      // partialize: (state) => ({ theme: state.theme }), // Uncomment to only persist theme
    }
  )
);
