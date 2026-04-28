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
  name?: string;
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

const splitRawUrl = (url: string): { base: string; query: string } => {
  const qIndex = url.indexOf("?");
  if (qIndex === -1) return { base: url, query: "" };
  return { base: url.slice(0, qIndex), query: url.slice(qIndex + 1) };
};

const parseQueryRowsFromUrl = (url: string): QueryParamRow[] => {
  const { query } = splitRawUrl(url);
  if (!query) return [];

  return query.split("&").map((pair) => {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) return createHeaderRow({ key: pair, value: "" });
    return createHeaderRow({
      key: pair.slice(0, eqIndex),
      value: pair.slice(eqIndex + 1),
    });
  });
};

const rowsToQueryString = (rows: QueryParamRow[]) =>
  rows
    .filter((row) => row.enabled && row.key.trim().length > 0)
    .map((row) => {
      const k = row.key.trim();
      return row.value !== "" ? `${k}=${row.value}` : k;
    })
    .join("&");

const syncUrlWithParams = (url: string, rows: QueryParamRow[]) => {
  if (!url.trim()) return url;
  const { base } = splitRawUrl(url);
  const qs = rowsToQueryString(rows);
  return qs ? `${base}?${qs}` : base;
};

const deriveBodyType = (body: unknown): BodyType =>
  typeof body === "string" && body.trim().length > 0
    ? "application/json"
    : "none";

interface ComposerState {
  requestName: string;
  /** True when the current request has been edited since it was last loaded or saved. */
  isDirty: boolean;
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  params: QueryParamRow[];
  bodyType: BodyType;
  body: string;

  setRequestName: (name: string) => void;
  /** Mark the current state as saved. Optionally updates requestName at the same time. */
  markSaved: (name?: string) => void;
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
      requestName: "",
      isDirty: false,
      method: "GET",
      url: "",
      headers: [],
      params: [],
      bodyType: "none",
      body: "",

      setRequestName: (requestName) => set({ requestName }),

      markSaved: (name) =>
        set((state) => ({
          isDirty: false,
          requestName: name !== undefined ? name : state.requestName,
        })),

      setMethod: (method) => set({ method, isDirty: true }),

      setUrl: (url) =>
        set((state) => {
          if (!url.trim()) {
            return { url, params: [], isDirty: true };
          }

          const { query: newQuery } = splitRawUrl(url);
          const { query: currentQuery } = splitRawUrl(state.url);
          const paramsChanged = newQuery !== currentQuery;

          return {
            url,
            isDirty: true,
            params: paramsChanged ? parseQueryRowsFromUrl(url) : state.params,
          };
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

      setBodyType: (bodyType) => set({ bodyType, isDirty: true }),

      loadDraft: (draft) =>
        set(() => ({
          requestName: draft.name ?? "",
          isDirty: false,
          method: draft.method,
          url: draft.url,
          headers: normalizeRows(draft.headers),
          params: parseQueryRowsFromUrl(draft.url),
          bodyType: deriveBodyType(draft.body),
          body: draft.body ?? "",
        })),

      addHeader: (header) =>
        set((state) => ({
          headers: [...normalizeRows(state.headers), createHeaderRow(header)],
        })),

      updateHeader: (id, patch) =>
        set((state) => ({
          isDirty: true,
          headers: normalizeRows(state.headers).map((row) =>
            row.id === id ? { ...row, ...patch } : row
          ),
        })),

      removeHeader: (id) =>
        set((state) => ({
          isDirty: true,
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
            isDirty: true,
            params: nextParams,
            url: syncUrlWithParams(state.url, nextParams),
          };
        }),

      removeParam: (id) =>
        set((state) => {
          const nextParams = state.params.filter((row) => row.id !== id);

          return {
            isDirty: true,
            params: nextParams,
            url: syncUrlWithParams(state.url, nextParams),
          };
        }),

      setBody: (body) => set({ body, isDirty: true }),

      resetDraft: () =>
        set({
          requestName: "",
          isDirty: false,
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
        requestName: state.requestName,
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
          // Never restore dirty state — on app load everything is "clean"
          isDirty: false,
          headers: hydratedHeaders,
          params: hydratedParams,
          bodyType: deriveBodyType(hydratedState?.body),
          body: hydratedState?.body ?? currentState.body,
        };
      },
    }
  )
);
