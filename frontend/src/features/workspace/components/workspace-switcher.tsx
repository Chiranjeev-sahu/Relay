import { Badge } from "@/components/ui/badge"
import { useWorkspaces } from "../hooks"
import { useWorkspaceStore } from "../store"
import type { Workspace } from "../types"
import { cn } from "@/lib/utils"

export const WorkspaceSwitcher = () => {
  const { data, isLoading, error } = useWorkspaces()
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore()

  if (isLoading) return <p className="p-4 text-sm">Loading workspaces...</p>
  if (error) {
    console.error("Busted:", error)
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
  )
}
