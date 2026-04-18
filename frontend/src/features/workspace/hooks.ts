import { queryClient } from "@/app/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  getWorkspaces,
  joinWorkspace,
  regenerateWorkspaceInviteCode,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from "./api";
import type {
  CreateWorkspaceInput,
  JoinWorkspaceInput,
  WorkspaceInviteVariables,
  WorkspaceMemberActionVariables,
  UpdateWorkspaceMemberRoleVariables,
} from "./types";

export const workspaceKeys = {
  list: () => ["workspaces"] as const,
  members: (workspaceId: string) =>
    ["workspaces", workspaceId, "members"] as const,
} as const;

const invalidateWorkspaces = () => {
  queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
};

const invalidateWorkspaceMembers = (workspaceId: string) => {
  queryClient.invalidateQueries({
    queryKey: workspaceKeys.members(workspaceId),
  });
};

export const useWorkspaces = () => {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: getWorkspaces,
  });
};

export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: (payload: CreateWorkspaceInput) => createWorkspace(payload),
    onSuccess: invalidateWorkspaces,
  });
};

export const useJoinWorkspace = () => {
  return useMutation({
    mutationFn: (payload: JoinWorkspaceInput) => joinWorkspace(payload),
    onSuccess: invalidateWorkspaces,
  });
};

export const useUpdateMemberRole = () => {
  return useMutation({
    mutationFn: (variables: UpdateWorkspaceMemberRoleVariables) =>
      updateWorkspaceMemberRole(variables),
    onSuccess: (_data, variables) => {
      invalidateWorkspaceMembers(variables.workspaceId);
      invalidateWorkspaces();
    },
  });
};

export const useRemoveMember = () => {
  return useMutation({
    mutationFn: ({ workspaceId, memberId }: WorkspaceMemberActionVariables) =>
      removeWorkspaceMember(workspaceId, memberId),
    onSuccess: (_data, variables) => {
      invalidateWorkspaceMembers(variables.workspaceId);
      invalidateWorkspaces();
    },
  });
};

export const useRegenerateInviteCode = () => {
  return useMutation({
    mutationFn: ({ workspaceId }: WorkspaceInviteVariables) =>
      regenerateWorkspaceInviteCode(workspaceId),
    onSuccess: (_data, variables) => {
      invalidateWorkspaces();
      invalidateWorkspaceMembers(variables.workspaceId);
    },
  });
};

export const useDeleteWorkspace = () => {
  return useMutation({
    mutationFn: ({ workspaceId }: WorkspaceInviteVariables) =>
      deleteWorkspace(workspaceId),
    onSuccess: invalidateWorkspaces,
  });
};
