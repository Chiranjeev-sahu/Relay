import { useMutation } from "@tanstack/react-query";
import { useComposerStore, type HttpMethod, type ProxyResponse } from "../store";
import { api } from "@/lib/api-client";
import { useWorkspaceStore } from "@/features/workspace/store";

interface SendRequestParams {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
}

interface BackendResponse {
  success: boolean;
  data: ProxyResponse;
  error?: string;
  code?: string;
}

export const useSendRequest = () => {
  const {
    setResponse,
    setStatus,
    setResponseHeaders,
    setDuration,
    setSize,
    setError,
  } = useComposerStore();

  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId
  );

  return useMutation({
    mutationFn: async ({ method, url, headers, body }: SendRequestParams) => {
      const res = await api.post<BackendResponse>("/proxy", {
        method,
        url,
        headers,
        body,
        workspaceId: activeWorkspaceId,
      });
      return res.data;
    },

    onSuccess: (response) => {
      if (response.success) {
        const { data, status, headers, duration, size } = response.data;

        setResponse(data);
        setStatus(status);
        setResponseHeaders(headers);
        setDuration(duration);
        setSize(size);
        setError(null);
      } else {
        setError({
          message: response.error || "Proxy failed",
          code: response.code,
        });
        setResponse(null);
        setStatus(null);
      }
    },

    onError: (error: { response?: { data?: { error?: string; code?: string } }; message: string }) => {
      const backendError = error.response?.data;

      setError({
        message: backendError?.error || error.message,
        code: backendError?.code || "NETWORK_ERROR",
      });

      setResponse(null);
      setStatus(null);
      setDuration(null);
      setSize(null);
      setResponseHeaders(null);
    },
  });
};
