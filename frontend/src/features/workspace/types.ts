export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  role: Role;
  inviteCode: string | null;
}

export interface GetWorkspacesResponse {
  success: boolean;
  workspaces: Workspace[];
}
