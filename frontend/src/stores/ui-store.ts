import { create } from "zustand";

interface UIstate {
  isLeftOpen: boolean;
  isRightOpen: boolean;
  activeRightTab: string;
}

interface UIactions {
  toggleLeft: () => void;

  toggleRight: () => void;

  setActiveTab: (tab: string) => void;
}

export const useUIstore = create<UIstate & UIactions>()((set) => ({
  isLeftOpen: true,
  isRightOpen: true,
  activeRightTab: "collections",

  toggleLeft: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),
  toggleRight: () => set((state) => ({ isRightOpen: !state.isRightOpen })),
  setActiveTab: (tab) => set({ activeRightTab: tab }),
}));
