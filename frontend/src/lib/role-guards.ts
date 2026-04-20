import type { Role } from "@/features/workspace/types";

export type WorkspaceAction =
  | "viewMembers"
  | "manageMembers"
  | "viewCollections"
  | "createCollections"
  | "editCollections"
  | "deleteCollections"
  | "viewEnvironments"
  | "manageEnvironments"
  | "viewHistory"
  | "deleteHistoryItems"
  | "clearHistory"
  | "copyInviteCode"
  | "regenerateInviteCode"
  | "deleteWorkspace";

const roleRank: Record<Role, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

const actionMatrix: Record<WorkspaceAction, Role[]> = {
  viewMembers: ["VIEWER", "MEMBER", "ADMIN", "OWNER"],
  manageMembers: ["ADMIN", "OWNER"],
  viewCollections: ["VIEWER", "MEMBER", "ADMIN", "OWNER"],
  createCollections: ["MEMBER", "ADMIN", "OWNER"],
  editCollections: ["MEMBER", "ADMIN", "OWNER"],
  deleteCollections: ["ADMIN", "OWNER"],
  viewEnvironments: ["VIEWER", "MEMBER", "ADMIN", "OWNER"],
  manageEnvironments: ["ADMIN", "OWNER"],
  viewHistory: ["VIEWER", "MEMBER", "ADMIN", "OWNER"],
  deleteHistoryItems: ["MEMBER", "ADMIN", "OWNER"],
  clearHistory: ["ADMIN", "OWNER"],
  copyInviteCode: ["ADMIN", "OWNER"],
  regenerateInviteCode: ["OWNER"],
  deleteWorkspace: ["OWNER"],
};

export const canPerformWorkspaceAction = (
  role: Role | null | undefined,
  action: WorkspaceAction
) => {
  if (!role) return false;
  return actionMatrix[action].includes(role);
};

export const canAtLeast = (
  role: Role | null | undefined,
  minimumRole: Role
) => {
  if (!role) return false;
  return roleRank[role] >= roleRank[minimumRole];
};

export const getWorkspaceActionMatrix = (role: Role | null | undefined) => ({
  canViewMembers: canPerformWorkspaceAction(role, "viewMembers"),
  canManageMembers: canPerformWorkspaceAction(role, "manageMembers"),
  canViewCollections: canPerformWorkspaceAction(role, "viewCollections"),
  canCreateCollections: canPerformWorkspaceAction(role, "createCollections"),
  canEditCollections: canPerformWorkspaceAction(role, "editCollections"),
  canDeleteCollections: canPerformWorkspaceAction(role, "deleteCollections"),
  canViewEnvironments: canPerformWorkspaceAction(role, "viewEnvironments"),
  canManageEnvironments: canPerformWorkspaceAction(role, "manageEnvironments"),
  canViewHistory: canPerformWorkspaceAction(role, "viewHistory"),
  canDeleteHistoryItems: canPerformWorkspaceAction(role, "deleteHistoryItems"),
  canClearHistory: canPerformWorkspaceAction(role, "clearHistory"),
  canCopyInviteCode: canPerformWorkspaceAction(role, "copyInviteCode"),
  canRegenerateInviteCode: canPerformWorkspaceAction(
    role,
    "regenerateInviteCode"
  ),
  canDeleteWorkspace: canPerformWorkspaceAction(role, "deleteWorkspace"),
});
