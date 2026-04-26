import { api } from "@/lib/api-client";

export interface HistoryUserSummary {
  name: string | null;
  image: string | null;
}

export interface HistoryRequestSummary {
  id: number;
  method: string;
  url: string;
  headers: unknown;
  body: unknown;
  responseStatus: number | null;
  responseBody: unknown;
  createdAt: string;
  user: HistoryUserSummary | null;
}

export interface GetHistoryResponse {
  success: boolean;
  data: HistoryRequestSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getWorkspaceHistory = async (
  workspaceId: string,
  page: number,
  limit = 20
): Promise<GetHistoryResponse> => {
  const response = await api.get(`/workspaces/${workspaceId}/requests`, {
    params: { page, limit },
  });
  return response.data;
};

export const deleteWorkspaceHistoryItem = async (
  workspaceId: string,
  requestId: number
): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/requests/${requestId}`);
};

export const clearWorkspaceHistory = async (
  workspaceId: string
): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/requests/clear`);
};
