import { api } from "@/lib/api-client";
import type { GetWorkspacesResponse } from "./types";

export const getWorkspaces = async (): Promise<GetWorkspacesResponse> => {
  const response = await api.get("/workspaces");
  return response.data;
};
