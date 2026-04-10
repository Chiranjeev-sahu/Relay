import { useQuery } from "@tanstack/react-query"
import { getWorkspaces } from "./api"

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  })
}
