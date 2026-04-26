import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWorkspaceActionMatrix } from "@/lib/role-guards";
import {
  useComposerStore,
  type HttpMethod,
} from "@/features/request-composer/store";
import { Clock3, MoreVertical, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useClearHistory,
  useDeleteHistoryItem,
  useWorkspaceHistory,
} from "../hooks";
import type { Role } from "@/features/workspace/types";
import {
  ConfirmDialog,
  EmptyState,
  SectionSkeleton,
} from "@/features/workspace/components/workspace-panel-shared";
import {
  createHeaderRows,
  serializeBody,
} from "@/features/workspace/components/workspace-panel-utils";

interface HistoryTabProps {
  workspaceId: string;
  role: Role;
  isActive: boolean;
}

export function HistoryTab({ workspaceId, role, isActive }: HistoryTabProps) {
  const workspaceActions = getWorkspaceActionMatrix(role);
  const loadDraft = useComposerStore((state) => state.loadDraft);
  const historyQuery = useWorkspaceHistory(workspaceId, isActive);
  const { mutateAsync: deleteHistoryItem, isPending: isDeletingHistoryItem } =
    useDeleteHistoryItem();
  const { mutateAsync: clearHistory, isPending: isClearingHistory } =
    useClearHistory();
  const [searchText, setSearchText] = useState("");
  const [historyToDelete, setHistoryToDelete] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const historyItems = useMemo(
    () => historyQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [historyQuery.data?.pages]
  );
  const filteredHistoryItems = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) return historyItems;

    return historyItems.filter((request) => {
      return (
        request.method.toLowerCase().includes(normalizedSearch) ||
        request.url.toLowerCase().includes(normalizedSearch) ||
        String(request.responseStatus ?? "").includes(normalizedSearch)
      );
    });
  }, [historyItems, searchText]);

  const handleLoadHistoryRequest = (request: {
    method: string;
    url: string;
    headers: unknown;
    body: unknown;
  }) => {
    loadDraft({
      method: request.method as HttpMethod,
      url: request.url,
      headers: createHeaderRows(request.headers),
      body: serializeBody(request.body),
    });
  };

  const handleDeleteHistory = async () => {
    if (!historyToDelete) return;

    await deleteHistoryItem({
      workspaceId,
      requestId: historyToDelete.id,
    });
  };

  const handleClearHistory = async () => {
    await clearHistory({ workspaceId });
  };

  if (!isActive) {
    return <SectionSkeleton />;
  }

  if (historyQuery.isLoading && !historyQuery.data) {
    return <SectionSkeleton />;
  }

  if (!filteredHistoryItems.length) {
    return (
      <EmptyState
        title={searchText.trim() ? "No matching history" : "No history yet"}
        description={
          searchText.trim()
            ? "Try another search term or clear the field."
            : "History will load on demand so the request composer remains the fastest part of the app."
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-border/20 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">History</p>
            <p className="truncate text-xs text-muted-foreground">
              {historyQuery.data?.pages[0]?.pagination.total ??
                historyItems.length}{" "}
              saved request(s)
            </p>
          </div>

          {workspaceActions.canClearHistory ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="History actions"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setIsClearDialogOpen(true)}
                >
                  Clear history
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-2 px-1">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search history"
          />
        </div>
      </div>

      <div className="divide-y divide-border/10">
        {filteredHistoryItems.map((request) => (
          <div
            key={request.id}
            role="button"
            tabIndex={0}
            onClick={() => handleLoadHistoryRequest(request)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleLoadHistoryRequest(request);
              }
            }}
            className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-accent/30"
          >
            <Clock3 className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                <span className="mr-2 font-semibold text-emerald-500">
                  {request.method}
                </span>
                {request.url}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {request.responseStatus ?? "?"} •{" "}
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(event) => event.stopPropagation()}
                  aria-label="History actions"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => handleLoadHistoryRequest(request)}
                >
                  Load into composer
                </DropdownMenuItem>
                {workspaceActions.canDeleteHistoryItems ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() =>
                        setHistoryToDelete({
                          id: request.id,
                          label: request.url,
                        })
                      }
                    >
                      Delete request
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {historyQuery.hasNextPage ? (
        <div className="flex justify-center py-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => historyQuery.fetchNextPage()}
            disabled={historyQuery.isFetchingNextPage}
          >
            {historyQuery.isFetchingNextPage ? "Loading more..." : "Load more"}
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!historyToDelete}
        onOpenChange={(open) => {
          if (!open) setHistoryToDelete(null);
        }}
        title="Delete request?"
        description={
          historyToDelete
            ? `Delete ${historyToDelete.label} from history?`
            : undefined
        }
        confirmLabel="Delete request"
        onConfirm={handleDeleteHistory}
        isConfirming={isDeletingHistoryItem}
      />

      <ConfirmDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        title="Clear history?"
        description="This removes every request from history for this workspace."
        confirmLabel="Clear history"
        onConfirm={handleClearHistory}
        isConfirming={isClearingHistory}
      />
    </div>
  );
}
