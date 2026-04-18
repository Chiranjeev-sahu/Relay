import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,

      setActiveWorkspace: (id: string | null) => {
        set({ activeWorkspaceId: id });
      },
    }),
    {
      name: "relay-workspace-storage",
    }
  )
);
