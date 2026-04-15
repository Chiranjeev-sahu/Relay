import { api } from "@/lib/api-client";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceResponse,
  GetMembersResponse,
  GetWorkspacesResponse,
  JoinWorkspaceInput,
  JoinWorkspaceResponse,
  RegenerateInviteCodeResponse,
  UpdateMemberRoleInput,
  UpdateMemberRoleResponse,
} from "./types";

export const getWorkspaces = async (): Promise<GetWorkspacesResponse> => {
  const response = await api.get("/workspaces");
  return response.data;
};

export const createWorkspace = async (
  payload: CreateWorkspaceInput
): Promise<CreateWorkspaceResponse> => {
  const response = await api.post("/workspaces", payload);
  return response.data;
};

export const joinWorkspace = async (
  payload: JoinWorkspaceInput
): Promise<JoinWorkspaceResponse> => {
  const response = await api.post("/workspaces/join", payload);
  return response.data;
};

export const getWorkspaceMembers = async (
  workspaceId: string
): Promise<GetMembersResponse> => {
  const response = await api.get(`/workspaces/${workspaceId}/members`);
  return response.data;
};

export const updateWorkspaceMemberRole = async (
  workspaceId: string,
  memberId: string,
  payload: UpdateMemberRoleInput
): Promise<UpdateMemberRoleResponse> => {
  const response = await api.patch(
    `/workspaces/${workspaceId}/members/${memberId}/role`,
    payload
  );
  return response.data;
};

export const removeWorkspaceMember = async (
  workspaceId: string,
  memberId: string
): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
};

export const regenerateWorkspaceInviteCode = async (
  workspaceId: string
): Promise<RegenerateInviteCodeResponse> => {
  const response = await api.post(`/workspaces/${workspaceId}/invite/regenerate`);
  return response.data;
};

export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  await api.delete(`/workspaces/${workspaceId}`);
};
 