// frontend/src/features/request-composer/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";

export type HeaderRow = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type QueryParamRow = HeaderRow;

export type BodyType = "none" | "application/json";

export const getBodyValidationError = (
  bodyType: BodyType,
  body: string
): string | null => {
  if (bodyType === "none") {
    return null;
  }

  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return null;
  }

  try {
    JSON.parse(trimmedBody);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JSON";
  }
};

export type ComposerDraft = {
  method: HttpMethod;
  url: string;
  headers?: HeaderRow[];
  body?: string;
};

const createHeaderRow = (overrides: Partial<HeaderRow> = {}): HeaderRow => {
  const id =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return {
    id,
    enabled: true,
    key: "",
    value: "",
    ...overrides,
  };
};

const normalizeRows = (rows: unknown): HeaderRow[] => {
  if (!Array.isArray(rows)) return [];

  return rows.filter(
    (row): row is HeaderRow =>
      !!row &&
      typeof row === "object" &&
      "id" in row &&
      "key" in row &&
      "value" in row &&
      "enabled" in row
  );
};

const parseQueryRowsFromUrl = (url: string): QueryParamRow[] => {
  if (!url.trim()) return [];

  try {
    const parsedUrl = new URL(url);

    return Array.from(parsedUrl.searchParams.entries()).map(([key, value]) =>
      createHeaderRow({ key, value })
    );
  } catch {
    return [];
  }
};

const rowsToQueryString = (rows: QueryParamRow[]) =>
  new URLSearchParams(
    rows
      .filter((row) => row.enabled && row.key.trim().length > 0)
      .map((row) => [row.key.trim(), row.value] as [string, string])
  ).toString();

const syncUrlWithParams = (url: string, rows: QueryParamRow[]) => {
  if (!url.trim()) return url;

  try {
    const parsedUrl = new URL(url);
    parsedUrl.search = rowsToQueryString(rows);

    return parsedUrl.toString();
  } catch {
    return url;
  }
};

const deriveBodyType = (body: unknown): BodyType =>
  typeof body === "string" && body.trim().length > 0
    ? "application/json"
    : "none";

interface ComposerState {
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  params: QueryParamRow[];
  bodyType: BodyType;
  body: string;

  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: HeaderRow[]) => void;
  setParams: (params: QueryParamRow[]) => void;
  setBodyType: (bodyType: BodyType) => void;
  loadDraft: (draft: ComposerDraft) => void;
  addHeader: (header?: Partial<HeaderRow>) => void;
  updateHeader: (id: string, patch: Partial<Omit<HeaderRow, "id">>) => void;
  removeHeader: (id: string) => void;
  addParam: (param?: Partial<QueryParamRow>) => void;
  updateParam: (id: string, patch: Partial<Omit<QueryParamRow, "id">>) => void;
  removeParam: (id: string) => void;
  setBody: (body: string) => void;
  resetDraft: () => void;
}

export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
      method: "GET",
      url: "",
      headers: [],
      params: [],
      bodyType: "none",
      body: "",

      setMethod: (method) => set({ method }),

      setUrl: (url) =>
        set((state) => {
          if (!url.trim()) {
            return {
              url,
              params: [],
            };
          }

          try {
            return {
              url,
              params: parseQueryRowsFromUrl(url),
            };
          } catch {
            return {
              url,
              params: state.params,
            };
          }
        }),

      setHeaders: (headers) => set({ headers: normalizeRows(headers) }),

      setParams: (params) =>
        set((state) => {
          const normalizedParams = normalizeRows(params);

          return {
            params: normalizedParams,
            url: syncUrlWithParams(state.url, normalizedParams),
          };
        }),

      setBodyType: (bodyType) =>
        set(() => ({
          bodyType,
        })),

      loadDraft: (draft) =>
        set(() => {
          return {
            method: draft.method,
            url: draft.url,
            headers: normalizeRows(draft.headers),
            params: parseQueryRowsFromUrl(draft.url),
            bodyType: deriveBodyType(draft.body),
            body: draft.body ?? "",
          };
        }),

      addHeader: (header) =>
        set((state) => ({
          headers: [...normalizeRows(state.headers), createHeaderRow(header)],
        })),

      updateHeader: (id, patch) =>
        set((state) => ({
          headers: normalizeRows(state.headers).map((row) =>
            row.id === id ? { ...row, ...patch } : row
          ),
        })),

      removeHeader: (id) =>
        set((state) => ({
          headers: normalizeRows(state.headers).filter((row) => row.id !== id),
        })),

      addParam: (param) =>
        set((state) => {
          const nextParams = [...state.params, createHeaderRow(param)];

          return {
            params: nextParams,
            url: syncUrlWithParams(state.url, nextParams),
          };
        }),

      updateParam: (id, patch) =>
        set((state) => {
          const nextParams = state.params.map((row) =>
            row.id === id ? { ...row, ...patch } : row
          );

          return {
            params: nextParams,
            url: syncUrlWithParams(state.url, nextParams),
          };
        }),

      removeParam: (id) =>
        set((state) => {
          const nextParams = state.params.filter((row) => row.id !== id);

          return {
            params: nextParams,
            url: syncUrlWithParams(state.url, nextParams),
          };
        }),

      setBody: (body) => set({ body }),

      resetDraft: () =>
        set({
          method: "GET",
          url: "",
          headers: [],
          params: [],
          bodyType: "none",
          body: "",
        }),
    }),
    {
      name: "relay-composer-storage",
      partialize: (state) => ({
        method: state.method,
        url: state.url,
        headers: state.headers,
        body: state.body,
      }),
      merge: (persistedState, currentState) => {
        const hydratedState = persistedState as
          | Partial<ComposerState>
          | undefined;
        const hydratedHeaders = normalizeRows(
          hydratedState?.headers ?? currentState.headers
        );
        const hydratedParams = parseQueryRowsFromUrl(
          hydratedState?.url ?? currentState.url
        );

        return {
          ...currentState,
          ...hydratedState,
          headers: hydratedHeaders,
          params: hydratedParams,
          bodyType: deriveBodyType(hydratedState?.body),
          body: hydratedState?.body ?? currentState.body,
        };
      },
    }
  )
);
