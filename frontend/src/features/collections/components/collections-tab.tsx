import { canAtLeast, getWorkspaceActionMatrix } from "@/lib/role-guards";
import { Search } from "lucide-react";

import type { Role } from "@/features/workspace/types";
import {
  ConfirmDialog,
  EmptyState,
  SectionSkeleton,
} from "@/features/workspace/components/workspace-panel-shared";
import { CollectionItem } from "./collection-item";
import {
  CreateCollectionDialog,
  RenameCollectionDialog,
  RenameRequestDialog,
} from "./collection-dialogs";
import { useCollectionsTab } from "./hooks";

interface CollectionsTabProps {
  workspaceId: string;
  role: Role;
  isActive: boolean;
}

export function CollectionsTab({
  workspaceId,
  role,
  isActive,
}: CollectionsTabProps) {
  const workspaceActions = getWorkspaceActionMatrix(role);
  const canCreateRequests = canAtLeast(role, "MEMBER");
  const canEditCollections = canAtLeast(role, "MEMBER");
  const tab = useCollectionsTab(workspaceId, isActive);

  if (!isActive) return <SectionSkeleton />;
  if (tab.collectionsQuery.isLoading && !tab.collectionsQuery.data) {
    return <SectionSkeleton />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="border-b border-border/20 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Collections</p>
          </div>

          {workspaceActions.canCreateCollections ? (
            <CreateCollectionDialog tab={tab} />
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-2 px-2 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={tab.searchText}
            onChange={(e) => tab.setSearchText(e.target.value)}
            className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search collections and saved requests"
          />
        </div>
      </div>

      {tab.visibleCollections.length ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="divide-y divide-border/10">
            {tab.visibleCollections.map((collection) => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                tab={tab}
                workspaceId={workspaceId}
                isExpanded={tab.activeCollectionId === collection.id}
                canCreateRequests={canCreateRequests}
                canDeleteCollections={workspaceActions.canDeleteCollections}
                canEditCollections={canEditCollections}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-2">
          <EmptyState
            title={
              tab.normalizedSearch
                ? "No matching collections"
                : "No collections found"
            }
            description={
              tab.normalizedSearch
                ? "Try a different search term or clear the search box."
                : "Create a collection with the New button at the top."
            }
          />
        </div>
      )}

      <ConfirmDialog
        open={!!tab.collectionToDelete}
        onOpenChange={(open) => {
          if (!open) tab.setCollectionToDelete(null);
        }}
        title="Delete collection?"
        description={
          tab.collectionToDelete
            ? `Delete ${tab.collectionToDelete.name} and all saved requests?`
            : undefined
        }
        confirmLabel="Delete collection"
        onConfirm={tab.handleDeleteCollection}
        isConfirming={tab.isDeletingCollection}
      />

      <ConfirmDialog
        open={!!tab.requestToDelete}
        onOpenChange={(open) => {
          if (!open) tab.setRequestToDelete(null);
        }}
        title="Delete request?"
        description={
          tab.requestToDelete
            ? `Delete ${tab.requestToDelete.name} from this collection?`
            : undefined
        }
        confirmLabel="Delete request"
        onConfirm={tab.handleDeleteCollectionRequest}
        isConfirming={tab.isDeletingCollectionRequest}
      />

      <RenameCollectionDialog tab={tab} />
      <RenameRequestDialog tab={tab} />
    </div>
  );
}
