import { create } from "zustand";

export type RightTab = "collections" | "members" | "environments" | "history";

interface UIstate {
  isLeftOpen: boolean;
  isRightOpen: boolean;
  activeRightTab: RightTab;
}

interface UIactions {
  toggleLeft: () => void;

  toggleRight: () => void;

  setActiveTab: (tab: RightTab) => void;
}

export const useUIstore = create<UIstate & UIactions>()((set) => ({
  isLeftOpen: false,
  isRightOpen: true,
  activeRightTab: "collections",

  toggleLeft: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),
  toggleRight: () => set((state) => ({ isRightOpen: !state.isRightOpen })),
  setActiveTab: (tab) => set({ activeRightTab: tab }),
}));
