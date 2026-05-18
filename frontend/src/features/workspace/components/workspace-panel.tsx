import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getWorkspaceActionMatrix } from "@/lib/role-guards";
import { cn } from "@/lib/utils";
import { useUIstore } from "@/stores/ui-store";
import { Clock3, FolderGit2, Layers, Trash2, Users } from "lucide-react";
import { useState } from "react";

import { CollectionsTab } from "@/features/collections/components";
import { EnvironmentsTab } from "@/features/environments/components";
import { HistoryTab } from "@/features/history/components/history-tab";
import { useDeleteWorkspace, useWorkspaces } from "../hooks";
import { useWorkspaceStore } from "../store";
import type { WorkspaceSummary } from "../types";
import {
  ConfirmDialog,
  EmptyState,
  SectionSkeleton,
} from "./workspace-panel-shared";
import { MembersTab } from "./members-tab";

export function WorkspacePanel() {
  const { data, isLoading } = useWorkspaces();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { activeRightTab, setActiveTab } = useUIstore();
  const { mutateAsync: deleteWorkspace, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();
  const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false);

  const activeWorkspace = data?.workspaces?.find(
    (workspace: WorkspaceSummary) => workspace.id === activeWorkspaceId
  );
  const workspaceActions = getWorkspaceActionMatrix(activeWorkspace?.role);

  const tabItems = [
    {
      value: "collections" as const,
      label: "Collections",
      icon: FolderGit2,
    },
    {
      value: "members" as const,
      label: "Members",
      icon: Users,
    },
    {
      value: "environments" as const,
      label: "Environments",
      icon: Layers,
    },
    {
      value: "history" as const,
      label: "History",
      icon: Clock3,
    },
  ];

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspaceId) return;

    await deleteWorkspace({ workspaceId: activeWorkspaceId });
  };

  if (isLoading) {
    return <SectionSkeleton />;
  }

  if (!activeWorkspace) {
    return (
      <EmptyState
        title="No workspace selected"
        description="Choose a workspace on the left to load members, collections, environments, and history here."
      />
    );
  }

  const isCollectionsTabActive = activeRightTab === "collections";
  const isMembersTabActive = activeRightTab === "members";
  const isEnvironmentsTabActive = activeRightTab === "environments";
  const isHistoryTabActive = activeRightTab === "history";

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <aside className="flex w-10 shrink-0 flex-col items-center gap-2 border-r bg-background/95 px-1 py-3">
        {tabItems.map((tab) => {
          const isActive = activeRightTab === tab.value;
          const Icon = tab.icon;

          return (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={tab.label}
                >
                  <Icon className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">{tab.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="space-y-3 border-b bg-background px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">
                {activeWorkspace.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {activeWorkspace.description ||
                  "Workspace context and management"}
              </p>
            </div>
            <Badge>{activeWorkspace.role}</Badge>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            {workspaceActions.canDeleteWorkspace ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 w-full px-2 text-xs"
                onClick={() => setIsDeleteWorkspaceOpen(true)}
                disabled={isDeletingWorkspace}
              >
                <Trash2 />
                {isDeletingWorkspace ? "Deleting..." : "Delete workspace"}
              </Button>
            ) : null}
          </div>
        </div>

        <ConfirmDialog
          open={isDeleteWorkspaceOpen}
          onOpenChange={setIsDeleteWorkspaceOpen}
          title="Delete workspace?"
          description="This removes the workspace and all its data for every member."
          confirmLabel="Delete workspace"
          onConfirm={handleDeleteWorkspace}
          isConfirming={isDeletingWorkspace}
        />

        <div className="min-h-0 flex-1 overflow-auto">
          {isCollectionsTabActive ? (
            <CollectionsTab
              workspaceId={activeWorkspace.id}
              role={activeWorkspace.role}
              isActive={isCollectionsTabActive}
            />
          ) : null}

          {isMembersTabActive ? (
            <MembersTab
              workspaceId={activeWorkspace.id}
              role={activeWorkspace.role}
              isActive={isMembersTabActive}
            />
          ) : null}

          {isEnvironmentsTabActive ? (
            <EnvironmentsTab
              workspaceId={activeWorkspace.id}
              role={activeWorkspace.role}
              isActive={isEnvironmentsTabActive}
            />
          ) : null}

          {isHistoryTabActive ? (
            <HistoryTab
              workspaceId={activeWorkspace.id}
              role={activeWorkspace.role}
              isActive={isHistoryTabActive}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
