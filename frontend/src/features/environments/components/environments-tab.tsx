import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCreateEnvironment,
  useDeleteEnvironment,
  useWorkspaceEnvironments,
} from "../hooks";
import { getWorkspaceActionMatrix } from "@/lib/role-guards";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Globe, MoreVertical, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { useWorkspaceStore } from "@/features/workspace/store";
import type { Role } from "@/features/workspace/types";
import {
  ConfirmDialog,
  EmptyState,
  SectionSkeleton,
} from "@/features/workspace/components/workspace-panel-shared";
import { EnvironmentEditorDialog } from "./environment-editor-dialog";
import { useEnvironmentEditor } from "./hooks";

interface EnvironmentsTabProps {
  workspaceId: string;
  role: Role;
  isActive: boolean;
}

export function EnvironmentsTab({
  workspaceId,
  role,
  isActive,
}: EnvironmentsTabProps) {
  const workspaceActions = getWorkspaceActionMatrix(role);
  const canManage = workspaceActions.canManageEnvironments;
  const isViewer = role === "VIEWER";

  const activeEnvironmentId = useWorkspaceStore(
    (state) => state.activeEnvironmentByWorkspaceId[workspaceId] ?? null
  );
  const setActiveEnvironment = useWorkspaceStore(
    (state) => state.setActiveEnvironment
  );

  const environmentsQuery = useWorkspaceEnvironments(workspaceId, isActive);
  const { mutateAsync: createEnvironment, isPending: isCreating } =
    useCreateEnvironment();
  const { mutateAsync: deleteEnvironment, isPending: isDeletingEnvironment } =
    useDeleteEnvironment();

  const editor = useEnvironmentEditor(workspaceId);

  const [searchText, setSearchText] = useState("");
  const [environmentToDelete, setEnvironmentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const activeEnvironment = environmentsQuery.data?.environments?.find(
    (env) => env.id === activeEnvironmentId
  );

  const filteredEnvironments = useMemo(() => {
    const environments = environmentsQuery.data?.environments ?? [];
    const normalizedSearch = searchText.trim().toLowerCase();
    if (!normalizedSearch) return environments;
    return environments.filter((env) =>
      env.name.toLowerCase().includes(normalizedSearch)
    );
  }, [environmentsQuery.data?.environments, searchText]);

  useEffect(() => {
    if (!workspaceId || !environmentsQuery.data?.environments?.length) return;

    const exists = environmentsQuery.data.environments.some(
      (env) => env.id === activeEnvironmentId
    );

    if (activeEnvironmentId && !exists) {
      setActiveEnvironment(workspaceId, null);
      return;
    }

    if (!activeEnvironmentId) {
      setActiveEnvironment(
        workspaceId,
        environmentsQuery.data.environments[0].id
      );
    }
  }, [
    activeEnvironmentId,
    environmentsQuery.data?.environments,
    setActiveEnvironment,
    workspaceId,
  ]);

  const handleCreateEnvironment = async () => {
    try {
      await createEnvironment({ workspaceId, name: "New environment" });
      toast.success("Environment created");
    } catch {
      toast.error("Failed to create environment");
    }
  };

  const handleDeleteEnvironment = async () => {
    if (!environmentToDelete) return;
    try {
      await deleteEnvironment({
        workspaceId,
        environmentId: environmentToDelete.id,
      });
      if (activeEnvironmentId === environmentToDelete.id) {
        setActiveEnvironment(workspaceId, null);
      }
    } catch {
      toast.error("Failed to delete environment");
    }
  };

  if (!isActive) return <SectionSkeleton />;
  if (environmentsQuery.isLoading && !environmentsQuery.data) {
    return <SectionSkeleton />;
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-border/20 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Environments</p>
            <p className="truncate text-xs text-muted-foreground">
              {activeEnvironment
                ? activeEnvironment.name
                : "No environment selected"}
            </p>
          </div>
          {canManage ? (
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 px-3"
              onClick={handleCreateEnvironment}
              disabled={isCreating}
            >
              {isCreating ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="mr-1 size-4" />
                  New
                </>
              )}
            </Button>
          ) : (
            <Badge variant={activeEnvironment ? "default" : "secondary"}>
              {activeEnvironment ? "Active" : "None"}
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 px-1">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search environments"
          />
        </div>
      </div>

      {filteredEnvironments.length ? (
        <div className="divide-y divide-border/10">
          {filteredEnvironments.map((environment) => {
            const isSelected = activeEnvironmentId === environment.id;

            return (
              <div
                key={environment.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent/30"
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveEnvironment(workspaceId, environment.id)
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  {isSelected ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Globe className="size-4 shrink-0 text-muted-foreground" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {environment.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {environment.environmentVariables.length} variable
                      {environment.environmentVariables.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label="Environment actions"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() =>
                        setActiveEnvironment(workspaceId, environment.id)
                      }
                      disabled={isSelected}
                    >
                      {isSelected ? "Active" : "Set active"}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => editor.openEditor(environment)}
                    >
                      {canManage ? "Edit" : "View variables"}
                    </DropdownMenuItem>

                    {canManage ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            setEnvironmentToDelete({
                              id: environment.id,
                              name: environment.name,
                            })
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={
            searchText.trim()
              ? "No matching environments"
              : "No environments yet"
          }
          description={
            searchText.trim()
              ? "Try a different search term."
              : canManage
                ? "Click + New to create one."
                : "No environments have been created."
          }
        />
      )}

      <ConfirmDialog
        open={!!environmentToDelete}
        onOpenChange={(open) => {
          if (!open) setEnvironmentToDelete(null);
        }}
        title="Delete environment?"
        description={
          environmentToDelete
            ? `Delete "${environmentToDelete.name}" and all its variables? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete environment"
        onConfirm={handleDeleteEnvironment}
        isConfirming={isDeletingEnvironment}
      />

      <EnvironmentEditorDialog
        editor={editor}
        canManage={canManage}
        isViewer={isViewer}
      />
    </div>
  );
}
