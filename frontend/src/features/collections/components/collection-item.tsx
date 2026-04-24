import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HttpMethod } from "@/features/request-composer/store";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Folder, MoreVertical } from "lucide-react";

import { SectionSkeleton } from "@/features/workspace/components/workspace-panel-shared";
import { methodStyles } from "./method-styles";
import type { useCollectionsTab } from "./hooks";
import { SaveRequestDialog } from "./collection-dialogs";

interface CollectionItemProps {
  collection: {
    id: number;
    name: string;
    description: string | null;
  };
  tab: ReturnType<typeof useCollectionsTab>;
  workspaceId: string;
  isExpanded: boolean;
  canCreateRequests: boolean;
  canDeleteCollections: boolean;
  canEditCollections: boolean;
}

export function CollectionItem({
  collection,
  tab,
  workspaceId,
  isExpanded,
  canCreateRequests,
  canDeleteCollections,
  canEditCollections,
}: CollectionItemProps) {
  const collectionData =
    isExpanded &&
    tab.selectedCollectionQuery.data?.collection.id === collection.id
      ? tab.selectedCollectionQuery.data
      : null;
  const collectionRequests = collectionData?.allRequests ?? [];
  const showMenu =
    (isExpanded && canCreateRequests) ||
    canDeleteCollections ||
    canEditCollections;

  return (
    <section className="bg-background">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2",
          isExpanded ? "bg-accent/30" : undefined
        )}
      >
        <button
          type="button"
          onClick={() =>
            tab.setActiveCollection(
              workspaceId,
              isExpanded ? null : collection.id
            )
          }
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <Folder className="size-4 shrink-0 text-muted-foreground" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{collection.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {collection.description || "No description"}
            </p>
          </div>

          <span className="shrink-0 text-xs text-muted-foreground">
            {isExpanded ? `${collectionRequests.length}` : ""}
          </span>
        </button>

        {isExpanded ? (
          <SaveRequestDialog tab={tab} collectionName={collection.name} />
        ) : null}

        {showMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Collection actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {isExpanded && canCreateRequests ? (
                <DropdownMenuItem
                  onClick={() => tab.setIsCreateRequestOpen(true)}
                >
                  Save request
                </DropdownMenuItem>
              ) : null}

              {canEditCollections ? (
                <DropdownMenuItem
                  onClick={() =>
                    tab.openRenameCollection({
                      id: collection.id,
                      name: collection.name,
                      description: collection.description,
                    })
                  }
                >
                  Edit collection
                </DropdownMenuItem>
              ) : null}

              {canDeleteCollections ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() =>
                      tab.setCollectionToDelete({
                        id: collection.id,
                        name: collection.name,
                      })
                    }
                  >
                    Delete collection
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {isExpanded ? (
        tab.selectedCollectionQuery.isLoading && !collectionData ? (
          <div className="px-3 pb-2">
            <SectionSkeleton />
          </div>
        ) : (
          <div className="pb-1">
            {collectionRequests.length ? (
              <div className="space-y-1 px-2 pt-1 pb-2">
                {collectionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="group flex items-center gap-2 px-3 py-2 transition-colors hover:bg-accent/60"
                  >
                    <button
                      type="button"
                      onClick={() => tab.handleLoadSavedRequest(request)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                          methodStyles[request.method as HttpMethod] ??
                            "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {request.method}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {request.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {request.url}
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
                          aria-label="Request actions"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => tab.handleLoadSavedRequest(request)}
                        >
                          Load into composer
                        </DropdownMenuItem>

                        {canEditCollections ? (
                          <DropdownMenuItem
                            onClick={() =>
                              tab.openRenameRequest({
                                collectionId: collection.id,
                                requestId: request.id,
                                name: request.name,
                              })
                            }
                          >
                            Rename request
                          </DropdownMenuItem>
                        ) : null}

                        {canDeleteCollections ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                tab.setRequestToDelete({
                                  collectionId: collection.id,
                                  requestId: request.id,
                                  name: request.name,
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
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No requests saved in this collection yet.
              </p>
            )}
          </div>
        )
      ) : null}
    </section>
  );
}
