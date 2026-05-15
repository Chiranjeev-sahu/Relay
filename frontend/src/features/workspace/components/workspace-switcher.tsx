import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { canPerformWorkspaceAction } from "@/lib/role-guards";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  useJoinWorkspace,
  useRegenerateInviteCode,
  useWorkspaces,
} from "../hooks";
import { useWorkspaceStore } from "../store";
import type { WorkspaceSummary } from "../types";
import { useUIstore } from "@/stores/ui-store";
import { SectionSkeleton } from "./workspace-panel-shared";

const getWorkspaceInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "W";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();

  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
};

type JoinWorkspaceDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string;
  onInviteCodeChange: (value: string) => void;
  onJoin: () => void;
  isJoining: boolean;
  trigger: React.ReactElement;
};

const JoinWorkspaceDialog = ({
  isOpen,
  onOpenChange,
  inviteCode,
  onInviteCodeChange,
  onJoin,
  isJoining,
  trigger,
}: JoinWorkspaceDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join workspace</DialogTitle>
          <DialogDescription>
            Paste an invite code to join another workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Invite Code
          </p>
          <input
            value={inviteCode}
            onChange={(event) => onInviteCodeChange(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Paste invite code"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onJoin}
            disabled={isJoining || !inviteCode.trim()}
          >
            {isJoining ? "Joining..." : "Join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const WorkspaceSwitcher = () => {
  const { data, isLoading, error } = useWorkspaces();
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const isLeftOpen = useUIstore((state) => state.isLeftOpen);
  const { mutateAsync: joinWorkspace, isPending: isJoiningWorkspace } =
    useJoinWorkspace();
  const { mutateAsync: regenerateInviteCode, isPending: isRegenerating } =
    useRegenerateInviteCode();
  const [copyingWorkspaceId, setCopyingWorkspaceId] = useState<string | null>(
    null
  );
  const [copiedWorkspaceId, setCopiedWorkspaceId] = useState<string | null>(
    null
  );
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (data?.workspaces?.length && !activeWorkspaceId) {
      setActiveWorkspace(data.workspaces[0].id);
    }
  }, [data, activeWorkspaceId, setActiveWorkspace]);

  useEffect(() => {
    if (!data?.workspaces?.length || !activeWorkspaceId) {
      return;
    }

    const workspaceExists = data.workspaces.some(
      (workspace) => workspace.id === activeWorkspaceId
    );

    if (!workspaceExists) {
      setActiveWorkspace(data.workspaces[0].id);
    }
  }, [data, activeWorkspaceId, setActiveWorkspace]);

  const handleCopyInviteCode = async (workspace: WorkspaceSummary) => {
    if (!workspace.inviteCode) return;

    try {
      setCopyingWorkspaceId(workspace.id);
      await navigator.clipboard.writeText(workspace.inviteCode);
      setCopiedWorkspaceId(workspace.id);
      toast.success("Invite code copied");
      window.setTimeout(() => {
        setCopiedWorkspaceId((current) =>
          current === workspace.id ? null : current
        );
      }, 1500);
    } catch {
      toast.error("Invite code could not be copied");
    } finally {
      setCopyingWorkspaceId(null);
    }
  };

  const handleRegenerateInviteCode = async (workspaceId: string) => {
    try {
      await regenerateInviteCode({ workspaceId });
      toast.success("Invite code regenerated");
    } catch {
      toast.error("Invite code could not be regenerated");
    }
  };

  const handleJoinWorkspace = async () => {
    const trimmedInviteCode = inviteCode.trim();

    if (!trimmedInviteCode) {
      toast.error("Enter an invite code first");
      return;
    }

    try {
      const response = await joinWorkspace({ inviteCode: trimmedInviteCode });
      setActiveWorkspace(response.workspace.id);
      setInviteCode("");
      setIsJoinDialogOpen(false);
      toast.success(response.message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not join workspace";
      toast.error(message);
    }
  };

  if (isLoading) return <SectionSkeleton />;
  if (error) {
    console.error("Busted:", error);
  }

  if (!isLeftOpen) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-3">
        <div className="my-2 w-full">
          <JoinWorkspaceDialog
            isOpen={isJoinDialogOpen}
            onOpenChange={setIsJoinDialogOpen}
            inviteCode={inviteCode}
            onInviteCodeChange={setInviteCode}
            onJoin={handleJoinWorkspace}
            isJoining={isJoiningWorkspace}
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 w-full rounded-md border-emerald-500/20 bg-emerald-500/10 px-0 text-xs text-emerald-400 hover:bg-emerald-500/20 focus-visible:ring-emerald-500/30"
                    aria-label="Join workspace"
                  >
                    <Plus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Join workspace</TooltipContent>
              </Tooltip>
            }
          />
        </div>
        {data?.workspaces?.map((workspace: WorkspaceSummary) => {
          const isActive = activeWorkspaceId === workspace.id;

          return (
            <button
              key={workspace.id}
              type="button"
              onClick={() => setActiveWorkspace(workspace.id)}
              title={workspace.name}
              aria-label={workspace.name}
              className={cn(
                "flex h-8 w-10 items-center justify-center rounded-sm text-[11px] font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {getWorkspaceInitials(workspace.name)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {isLeftOpen ? (
        <div className="my-2 flex items-center gap-2 p-1">
          <JoinWorkspaceDialog
            isOpen={isJoinDialogOpen}
            onOpenChange={setIsJoinDialogOpen}
            inviteCode={inviteCode}
            onInviteCodeChange={setInviteCode}
            onJoin={handleJoinWorkspace}
            isJoining={isJoiningWorkspace}
            trigger={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 w-full justify-center border-emerald-500/20 bg-emerald-500/10 px-3 text-xs text-emerald-400 hover:bg-emerald-500/20 focus-visible:ring-emerald-500/30"
              >
                Join workspace
              </Button>
            }
          />
        </div>
      ) : null}

      {data?.workspaces?.map((workspace: WorkspaceSummary) => {
        const isActive = activeWorkspaceId === workspace.id;
        const canManageInvite = canPerformWorkspaceAction(
          workspace.role,
          "copyInviteCode"
        );
        const canRegenerateInvite = canPerformWorkspaceAction(
          workspace.role,
          "regenerateInviteCode"
        );

        return (
          <div
            key={workspace.id}
            className={cn(
              "flex items-center justify-between gap-2 rounded-none px-2 py-1.5 transition-colors hover:bg-accent/60",
              isActive && "bg-accent"
            )}
            onClick={() => setActiveWorkspace(workspace.id)}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{workspace.name}</p>
              {workspace.description ? (
                <p className="truncate text-xs text-muted-foreground">
                  {workspace.description}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Badge>{workspace.role}</Badge>

              {canManageInvite ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Invite
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{workspace.name} invite</DialogTitle>
                      <DialogDescription>
                        Copy the invite code or regenerate it with the owner
                        action.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 rounded-lg border bg-muted p-3">
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">
                        Invite Code
                      </p>
                      <p className="font-mono text-sm break-all">
                        {workspace.inviteCode ?? "No invite code available"}
                      </p>
                    </div>

                    <DialogFooter className="sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCopyInviteCode(workspace)}
                        disabled={
                          !workspace.inviteCode ||
                          copyingWorkspaceId === workspace.id
                        }
                      >
                        {copiedWorkspaceId === workspace.id
                          ? "Copied"
                          : copyingWorkspaceId === workspace.id
                            ? "Copying..."
                            : "Copy code"}
                      </Button>

                      {canRegenerateInvite ? (
                        <Button
                          type="button"
                          onClick={() =>
                            handleRegenerateInviteCode(workspace.id)
                          }
                          disabled={isRegenerating}
                        >
                          {isRegenerating ? "Regenerating..." : "Regenerate"}
                        </Button>
                      ) : null}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
