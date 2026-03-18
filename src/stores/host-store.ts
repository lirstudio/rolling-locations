import { create } from "zustand";

interface HostStore {
  isSyncing: boolean;
  setSyncing: (v: boolean) => void;
}

export const useHostStore = create<HostStore>()((set) => ({
  isSyncing: false,
  setSyncing: (v) => set({ isSyncing: v }),
}));
