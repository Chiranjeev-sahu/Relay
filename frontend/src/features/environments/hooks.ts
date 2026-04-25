import { queryClient } from "@/app/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createEnvVariable,
  createWorkspaceEnvironment,
  deleteEnvVariable,
  deleteWorkspaceEnvironment,
  getWorkspaceEnvironments,
  updateEnvVariable,
  updateWorkspaceEnvironment,
  type CreateVariablePayload,
  type UpdateVariablePayload,
} from "./api";

export const environmentKeys = {
  list: (workspaceId: string | null) =>
    ["workspaces", workspaceId, "environments"] as const,
};

const invalidateEnvironments = (workspaceId: string) => {
  queryClient.invalidateQueries({
    queryKey: environmentKeys.list(workspaceId),
  });
};

// ── Environment hooks ────────────────────────────────────────────────────────

export const useWorkspaceEnvironments = (
  workspaceId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: environmentKeys.list(workspaceId),
    queryFn: () => getWorkspaceEnvironments(workspaceId as string),
    enabled: enabled && !!workspaceId,
    staleTime: 30_000,
  });
};

export const useCreateEnvironment = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      name,
    }: {
      workspaceId: string;
      name: string;
    }) => createWorkspaceEnvironment(workspaceId, name),
    onSuccess: (_data, variables) => {
      invalidateEnvironments(variables.workspaceId);
    },
  });
};

export const useUpdateEnvironment = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      environmentId,
      name,
    }: {
      workspaceId: string;
      environmentId: string;
      name: string;
    }) => updateWorkspaceEnvironment(workspaceId, environmentId, name),
    onSuccess: (_data, variables) => {
      invalidateEnvironments(variables.workspaceId);
    },
  });
};

export const useDeleteEnvironment = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      environmentId,
    }: {
      workspaceId: string;
      environmentId: string;
    }) => deleteWorkspaceEnvironment(workspaceId, environmentId),
    onSuccess: (_data, variables) => {
      invalidateEnvironments(variables.workspaceId);
    },
  });
};

// ── Variable hooks ───────────────────────────────────────────────────────────

export const useCreateEnvVariable = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      environmentId,
      payload,
    }: {
      workspaceId: string;
      environmentId: string;
      payload: CreateVariablePayload;
    }) => createEnvVariable(workspaceId, environmentId, payload),
    onSuccess: (_data, variables) => {
      invalidateEnvironments(variables.workspaceId);
    },
  });
};

export const useUpdateEnvVariable = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      environmentId,
      varId,
      payload,
    }: {
      workspaceId: string;
      environmentId: string;
      varId: number;
      payload: UpdateVariablePayload;
    }) => updateEnvVariable(workspaceId, environmentId, varId, payload),
    onSuccess: (_data, variables) => {
      invalidateEnvironments(variables.workspaceId);
    },
  });
};

export const useDeleteEnvVariable = () => {
  return useMutation({
    mutationFn: ({
      workspaceId,
      environmentId,
      varId,
    }: {
      workspaceId: string;
      environmentId: string;
      varId: number;
    }) => deleteEnvVariable(workspaceId, environmentId, varId),
    onSuccess: (_data, variables) => {
      invalidateEnvironments(variables.workspaceId);
    },
  });
};
