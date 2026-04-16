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
  enabled: boolean;
  key: string;
  value: string;
};

const createHeaderRow = (overrides: Partial<HeaderRow> = {}): HeaderRow => {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return {
    id,
    enabled: true,
    key: "",
    value: "",
    ...overrides,
  };
}

interface ComposerState {
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  body: string;

  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: HeaderRow[]) => void;
  addHeader: (header?: Partial<HeaderRow>) => void;
  updateHeader: (id: string, patch: Partial<Omit<HeaderRow, "id">>) => void;
  removeHeader: (id: string) => void;
  setBody: (body: string) => void;
  resetDraft: () => void;
}

export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
      method: "GET",
      url: "",
      headers: [],
      body: "",

      setMethod: (method) => set({ method }),
      setUrl: (url) => set({ url }),
      setHeaders: (headers) => set({ headers }),
      addHeader: (header) =>
        set((state) => ({
          headers: [...state.headers, createHeaderRow(header)],
        })),
      updateHeader: (id, patch) =>
        set((state) => ({
          headers: state.headers.map((row) =>
            row.id === id ? { ...row, ...patch } : row
          ),
        })),
      removeHeader: (id) =>
        set((state) => ({
          headers: state.headers.filter((row) => row.id !== id),
        })),
      setBody: (body) => set({ body }),
      resetDraft: () =>
        set({
          method: "GET",
          url: "",
          headers: [],
          body: "",
        }),
    }),
    { name: "relay-composer-storage" }
  )
);
