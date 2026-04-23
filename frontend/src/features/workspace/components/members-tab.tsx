import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getWorkspaceActionMatrix } from "@/lib/role-guards";
import { MoreVertical, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useRemoveMember,
  useUpdateMemberRole,
  useWorkspaceMembers,
  useWorkspaces,
  useRegenerateInviteCode,
} from "../hooks";
import type { Role } from "../types";
import {
  ConfirmDialog,
  EmptyState,
  SectionSkeleton,
} from "./workspace-panel-shared";

interface MembersTabProps {
  workspaceId: string;
  role: Role;
  isActive: boolean;
}

const memberRoleOptions: Array<Exclude<Role, "OWNER">> = [
  "ADMIN",
  "MEMBER",
  "VIEWER",
];

export function MembersTab({ workspaceId, role, isActive }: MembersTabProps) {
  const workspaceActions = getWorkspaceActionMatrix(role);
  const membersQuery = useWorkspaceMembers(workspaceId, isActive);
  const { mutateAsync: updateMemberRole, isPending: isUpdatingMember } =
    useUpdateMemberRole();
  const { mutateAsync: removeMember, isPending: isRemovingMember } =
    useRemoveMember();
  const [searchText, setSearchText] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const workspacesQuery = useWorkspaces();
  const activeWorkspace = workspacesQuery.data?.workspaces?.find(
    (w) => w.id === workspaceId
  );

  const { mutateAsync: regenerateInviteCode, isPending: isRegenerating } =
    useRegenerateInviteCode();
  const [copyingWorkspaceId, setCopyingWorkspaceId] = useState<string | null>(
    null
  );
  const [copiedWorkspaceId, setCopiedWorkspaceId] = useState<string | null>(
    null
  );

  const handleCopyInviteCode = async () => {
    if (!activeWorkspace?.inviteCode) return;
    try {
      setCopyingWorkspaceId(activeWorkspace.id);
      await navigator.clipboard.writeText(activeWorkspace.inviteCode);
      setCopiedWorkspaceId(activeWorkspace.id);
      toast.success("Invite code copied");
      window.setTimeout(() => {
        setCopiedWorkspaceId((current) =>
          current === activeWorkspace.id ? null : current
        );
      }, 1500);
    } catch {
      toast.error("Invite code could not be copied");
    } finally {
      setCopyingWorkspaceId(null);
    }
  };

  const handleRegenerateInviteCode = async () => {
    try {
      await regenerateInviteCode({ workspaceId });
      toast.success("Invite code regenerated");
    } catch {
      toast.error("Invite code could not be regenerated");
    }
  };

  const filteredMembers = useMemo(() => {
    const members = membersQuery.data?.members ?? [];
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) return members;

    return members.filter((member) => {
      return (
        (member.name || "").toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch) ||
        member.role.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [membersQuery.data?.members, searchText]);

  const handleRoleChange = async (
    memberId: string,
    nextRole: Exclude<Role, "OWNER">
  ) => {
    await updateMemberRole({
      workspaceId,
      memberId,
      payload: { role: nextRole },
    });
  };

  const handleDeleteMember = async () => {
    if (!memberToRemove) return;

    await removeMember({ workspaceId, memberId: memberToRemove.id });
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Unable to copy email");
    }
  };

  if (!isActive) {
    return <SectionSkeleton />;
  }

  if (membersQuery.isLoading && !membersQuery.data) {
    return <SectionSkeleton />;
  }

  if (!filteredMembers.length) {
    return (
      <EmptyState
        title={searchText.trim() ? "No matching members" : "No members found"}
        description={
          searchText.trim()
            ? "Try another search term or clear the field."
            : "This workspace does not have any visible members yet."
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-border/20 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Members</p>
          </div>

          {workspaceActions.canManageMembers && activeWorkspace && (
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" size="sm" className="h-8 shrink-0 px-3">
                  Invite
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{activeWorkspace.name} invite</DialogTitle>
                  <DialogDescription>
                    Copy the invite code or regenerate it with the owner action.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Invite Code
                  </p>
                  <p className="font-mono text-sm break-all">
                    {activeWorkspace.inviteCode ?? "No invite code available"}
                  </p>
                </div>

                <DialogFooter className="sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyInviteCode}
                    disabled={
                      !activeWorkspace.inviteCode ||
                      copyingWorkspaceId === activeWorkspace.id
                    }
                  >
                    {copiedWorkspaceId === activeWorkspace.id
                      ? "Copied"
                      : copyingWorkspaceId === activeWorkspace.id
                        ? "Copying..."
                        : "Copy code"}
                  </Button>

                  {workspaceActions.canManageMembers ? (
                    <Button
                      type="button"
                      onClick={handleRegenerateInviteCode}
                      disabled={isRegenerating}
                    >
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </Button>
                  ) : null}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 px-1">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search members"
          />
        </div>
      </div>

      <div className="divide-y divide-border/10">
        {filteredMembers.map((member) => {
          const isOwner = member.role === "OWNER";
          const canManageMember = workspaceActions.canManageMembers && !isOwner;

          return (
            <div
              key={member.memberId}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {member.name || member.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {member.role}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label="Member actions"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => handleCopyEmail(member.email)}
                    >
                      Copy email
                    </DropdownMenuItem>

                    {canManageMember ? (
                      <>
                        <DropdownMenuSeparator />
                        {memberRoleOptions.map((nextRole) => (
                          <DropdownMenuItem
                            key={nextRole}
                            disabled={
                              isUpdatingMember || member.role === nextRole
                            }
                            onClick={() =>
                              handleRoleChange(
                                member.memberId,
                                nextRole as Exclude<Role, "OWNER">
                              )
                            }
                          >
                            Set role: {nextRole}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={isRemovingMember}
                          onClick={() =>
                            setMemberToRemove({
                              id: member.memberId,
                              label: member.name || member.email,
                            })
                          }
                        >
                          Remove member
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}
        title="Remove member?"
        description={
          memberToRemove
            ? `Remove ${memberToRemove.label} from this workspace?`
            : undefined
        }
        confirmLabel="Remove member"
        onConfirm={handleDeleteMember}
        isConfirming={isRemovingMember}
      />
    </div>
  );
}
