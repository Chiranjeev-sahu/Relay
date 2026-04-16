import { create } from "zustand";

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
  size: number;
}

type ResponseError = {
  message: string;
  code?: string;
} | null;

interface ResponseState {
  response: ProxyResponse | null;
  error: ResponseError;
  setResponse: (response: ProxyResponse | null) => void;
  setError: (error: ResponseError) => void;
  clear: () => void;
}

export const useResponseStore = create<ResponseState>()((set) => ({
  response: null,
  error: null,
  setResponse: (response) => set({ response }),
  setError: (error) => set({ error }),
  clear: () => set({ response: null, error: null }),
}));