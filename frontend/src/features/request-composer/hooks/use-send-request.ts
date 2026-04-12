import { useMutation } from "@tanstack/react-query";
import { useComposerStore, type HttpMethod } from "../store";
import { api } from "@/lib/api-client";

interface SendRequestParams {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
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

  return useMutation({
    mutationFn: async ({ method, url, headers, body }: SendRequestParams) => {
      const res = await api.post("/proxy", { method, url, headers, body });
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

    onError: (error: any) => {
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
