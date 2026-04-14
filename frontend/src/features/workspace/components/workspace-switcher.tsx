import { Badge } from "@/components/ui/badge";
import { useWorkspaces } from "../hooks";
import { useWorkspaceStore } from "../store";
import type { Workspace } from "../types";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const WorkspaceSwitcher = () => {
  const { data, isLoading, error } = useWorkspaces();
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  useEffect(() => {
    if (data?.workspaces?.length && !activeWorkspaceId) {
      setActiveWorkspace(data.workspaces[0].id);
    }
  }, [data, activeWorkspaceId, setActiveWorkspace]);

  if (isLoading) return <p className="p-4 text-sm">Loading workspaces...</p>;
  if (error) {
    console.error("Busted:", error);
  }

  return (
    <div className="p-3">
      {data?.workspaces?.map((workspace: Workspace) => (
        <div
          key={workspace.id}
          className={cn(
            "flex justify-between",
            activeWorkspaceId === workspace.id && "bg-accent"
          )}
          onClick={() => setActiveWorkspace(workspace.id)}
        >
          <p>{workspace.name}</p>
          <Badge>{workspace.role}</Badge>
        </div>
      ))}
    </div>
  );
};
