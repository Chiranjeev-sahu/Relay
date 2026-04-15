export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
}

export interface WorkspaceSummary extends Workspace {
  role: Role;
  inviteCode: string | null;
}

export interface WorkspaceMember {
  memberId: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  joinedAt: string;
}

export interface GetWorkspacesResponse {
  success: boolean;
  workspaces: WorkspaceSummary[];
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string | null;
}

export interface CreateWorkspaceResponse {
  success: boolean;
  workspace: Workspace;
}

export interface JoinWorkspaceInput {
  inviteCode: string;
}

export interface JoinWorkspaceResponse {
  success: boolean;
  message: string;
  workspace: Pick<Workspace, "id" | "name">;
}

export interface GetMembersResponse {
  success: boolean;
  members: WorkspaceMember[];
}

export interface UpdateMemberRoleInput {
  role: Exclude<Role, "OWNER">;
}

export interface UpdateMemberRoleResponse {
  success: boolean;
  updated: {
    id: string;
    workspaceId: string;
    userId: string;
    role: Role;
    joinedAt: string;
  };
}

export interface RegenerateInviteCodeResponse {
  success: boolean;
  inviteCode: string;
}