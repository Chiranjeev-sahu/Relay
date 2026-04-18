import { api } from "@/lib/api-client";

export interface MeUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export const getMe = async (): Promise<MeUser> => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const login = async (payload: LoginPayload): Promise<MeUser> => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const register = async (payload: RegisterPayload): Promise<MeUser> => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const startGoogleAuth = () => {
  const baseUrl = (
    api.defaults.baseURL ?? "http://localhost:3000/api/v1"
  ).replace(/\/$/, "");
  window.location.assign(`${baseUrl}/auth/google`);
};
