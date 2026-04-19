import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeEnvironmentByWorkspaceId: Record<string, string | null>;
  activeCollectionByWorkspaceId: Record<string, number | null>;
  setActiveWorkspace: (id: string | null) => void;
  setActiveEnvironment: (
    workspaceId: string,
    environmentId: string | null
  ) => void;
  setActiveCollection: (
    workspaceId: string,
    collectionId: number | null
  ) => void;
  resetWorkspaceState: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeEnvironmentByWorkspaceId: {},
      activeCollectionByWorkspaceId: {},

      setActiveWorkspace: (id: string | null) => {
        set({ activeWorkspaceId: id });
      },

      setActiveEnvironment: (
        workspaceId: string,
        environmentId: string | null
      ) => {
        set((state) => ({
          activeEnvironmentByWorkspaceId: {
            ...state.activeEnvironmentByWorkspaceId,
            [workspaceId]: environmentId,
          },
        }));
      },

      setActiveCollection: (
        workspaceId: string,
        collectionId: number | null
      ) => {
        set((state) => ({
          activeCollectionByWorkspaceId: {
            ...state.activeCollectionByWorkspaceId,
            [workspaceId]: collectionId,
          },
        }));
      },

      resetWorkspaceState: () => {
        set({
          activeWorkspaceId: null,
          activeEnvironmentByWorkspaceId: {},
          activeCollectionByWorkspaceId: {},
        });
      },
    }),
    {
      name: "relay-workspace-storage",
    }
  )
);
