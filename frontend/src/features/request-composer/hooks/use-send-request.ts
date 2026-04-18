import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AxiosError } from "axios";
import { useWorkspaceStore } from "@/features/workspace/store";
import {
  useResponseStore,
  type ProxyResponse,
} from "@/features/response-viewer/store";
import { type BodyType, type HeaderRow, type HttpMethod } from "../store";

interface SendRequestParams {
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  bodyType: BodyType;
  body: string;
}

interface BackendResponse {
  data: ProxyResponse;
}

interface BackendErrorResponse {
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

  const parseBody = (bodyType: BodyType, body: string) => {
    if (bodyType === "none") {
      return undefined;
    }

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return undefined;
    }

    return JSON.parse(trimmedBody) as unknown;
  };

  return useMutation({
    mutationFn: async ({
      method,
      url,
      headers,
      bodyType,
      body,
    }: SendRequestParams) => {
      const workspaceId = activeWorkspaceId ?? undefined;
      const parsedBody = parseBody(bodyType, body);

      const res = await api.post<BackendResponse>("/proxy", {
        method,
        url,
        headers: headersToRecord(headers),
        body: parsedBody,
        ...(workspaceId ? { workspaceId } : {}),
      });

      return res.data;
    },

    onSuccess: (response) => {
      setResponse(response.data);
      setError(null);
    },

    onError: (error: AxiosError<BackendErrorResponse>) => {
      const backendError = error.response?.data;

      clear();
      setError({
        message: backendError?.error || error.message,
        code: backendError?.code || "NETWORK_ERROR",
      });
    },
  });
};
