import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/query-client";
import { useWorkspaceStore } from "@/features/workspace/store";
import {
  getMe,
  login,
  logout,
  register,
  startGoogleAuth,
  type LoginPayload,
  type MeUser,
  type RegisterPayload,
} from "./api";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: 0,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useAuth = () => {
  const meQuery = useMe();

  return {
    ...meQuery,
    user: meQuery.data ?? null,
    isAuthenticated: !!meQuery.data,
  };
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (user: MeUser) => {
      queryClient.setQueryData(["me"], user);
      queryClient.removeQueries({ queryKey: ["workspaces"] });
      useWorkspaceStore.getState().resetWorkspaceState();
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (user: MeUser) => {
      queryClient.setQueryData(["me"], user);
      queryClient.removeQueries({ queryKey: ["workspaces"] });
      useWorkspaceStore.getState().resetWorkspaceState();
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["workspaces"] });
      useWorkspaceStore.getState().resetWorkspaceState();
    },
  });
};

export const useGoogleAuth = () => {
  return startGoogleAuth;
};
