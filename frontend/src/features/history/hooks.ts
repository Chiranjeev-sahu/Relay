import { queryClient } from "@/app/query-client";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

import {
  clearWorkspaceHistory,
  deleteWorkspaceHistoryItem,
  getWorkspaceHistory,
} from "./api";

export const historyKeys = {
  list: (workspaceId: string | null) =>
    ["workspaces", workspaceId, "requests"] as const,
};

const invalidateHistory = (workspaceId: string) => {
  queryClient.invalidateQueries({ queryKey: historyKeys.list(workspaceId) });
};

export const useWorkspaceHistory = (
  workspaceId: string | null,
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: historyKeys.list(workspaceId),
    queryFn: ({ pageParam }) =>
      getWorkspaceHistory(workspaceId as string, pageParam as number),
    initialPageParam: 1,
    enabled: enabled && !!workspaceId,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 30_000,
  });
};

export const useDeleteHistoryItem = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      requestId,
    }: {
      workspaceId: string;
      requestId: number;
    }) => deleteWorkspaceHistoryItem(workspaceId, requestId),
    onSuccess: (_data, variables) => {
      invalidateHistory(variables.workspaceId);
    },
  });
};

export const useClearHistory = () => {
  return useMutation({
    mutationFn: ({ workspaceId }: { workspaceId: string }) =>
      clearWorkspaceHistory(workspaceId),
    onSuccess: (_data, variables) => {
      invalidateHistory(variables.workspaceId);
    },
  });
};
