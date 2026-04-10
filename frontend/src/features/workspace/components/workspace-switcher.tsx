import { useWorkspaces } from "../hooks"
import { useWorkspaceStore } from "../store"

export const WorkspaceSwitcher = () => {
  const { data, isLoading, error } = useWorkspaces()
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore()

  if (isLoading) return <p className="p-4 text-sm">Loading workspaces...</p>
  if (error) {
    console.error("Busted:", error)
  }
  return (
    <select
      className="w-full rounded bg-slate-800 p-2 text-white"
      value={activeWorkspaceId || ""} // Controlled component
      onChange={(e) => setActiveWorkspace(e.target.value)}
    >
      <option value="" disabled>
        Select Workspace
      </option>

      {data?.workspaces?.map((workspace: any) => (
        <option key={workspace.id} value={workspace.id}>
          {workspace.name}
        </option>
      ))}
    </select>
  )
}
