import { api } from "@/lib/api-client"

export const getWorkspaces = async () => {
  const response = await api.get("/workspaces")
  return response.data
}
