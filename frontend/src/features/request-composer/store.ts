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

interface ComposerState {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;

  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: Record<string, string>) => void;
  setBody: (body: string) => void;

  // Response Data (Now all allow null for resets)
  response: any | null;
  status: number | null;
  duration: number | null;
  resHeaders: Record<string, string> | null;
  size: number | null;
  error: { message: string; code?: string } | null;

  setResponse: (res: any | null) => void;
  setStatus: (status: number | null) => void;
  setDuration: (ms: number | null) => void;
  setResponseHeaders: (resHeaders: Record<string, string> | null) => void;
  setSize: (size: number | null) => void;
  setError: (err: { message: string; code?: string } | null) => void;
}

export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
      method: "GET",
      url: "",
      headers: { "Content-Type": "application/json" },
      body: "",
      response: null,
      status: null,
      duration: null,
      resHeaders: null,
      size: null,
      error: null,

      setMethod: (method) => set({ method }),
      setUrl: (url) => set({ url }),
      setHeaders: (headers) => set({ headers }),
      setBody: (body) => set({ body }),
      setResponse: (response) => set({ response }),
      setStatus: (status) => set({ status }),
      setDuration: (duration) => set({ duration }),
      setResponseHeaders: (resHeaders) => set({ resHeaders }),
      setSize: (size) => set({ size }),
      setError: (error) => set({ error }),
    }),
    { name: "relay-composer-storage" }
  )
);
