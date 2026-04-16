import { useMutation } from "@tanstack/react-query";
import { type HeaderRow, type HttpMethod } from "../store";
import { api } from "@/lib/api-client";
import { useWorkspaceStore } from "@/features/workspace/store";
import { useResponseStore, type ProxyResponse } from "@/features/response-viewer/store";

interface SendRequestParams {
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  body: string;
}

interface BackendResponse {
  success: boolean;
  data: ProxyResponse;
  error?: string;
  code?: string;
}

export const useSendRequest = () => {
  const { setResponse, setError, clear } = useResponseStore();

  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId
  );

  const headersToRecord = (headers: HeaderRow[]) =>
    Object.fromEntries(
      headers
        .filter((header) => header.enabled && header.key.trim().length > 0)
        .map((header) => [header.key.trim(), header.value])
    ) as Record<string, string>;

  return useMutation({
    mutationFn: async ({ method, url, headers, body }: SendRequestParams) => {
      const res = await api.post<BackendResponse>("/proxy", {
        method,
        url,
        headers: headersToRecord(headers),
        body,
        workspaceId: activeWorkspaceId,
      });
      return res.data;
    },

    onSuccess: (response) => {
      if (response.success) {
        setResponse(response.data);
        setError(null);
      } else {
        clear();
        setError({
          message: response.error || "Proxy failed",
          code: response.code,
        });
      }
    },

    onError: (error: { response?: { data?: { error?: string; code?: string } }; message: string }) => {
      const backendError = error.response?.data;

      clear();
      setError({
        message: backendError?.error || error.message,
        code: backendError?.code || "NETWORK_ERROR",
      });
    },
  });
};
