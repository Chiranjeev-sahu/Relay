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
import { Plus } from "lucide-react";

import type { useCollectionsTab } from "./hooks";

interface CreateCollectionDialogProps {
  tab: ReturnType<typeof useCollectionsTab>;
}

export function CreateCollectionDialog({ tab }: CreateCollectionDialogProps) {
  return (
    <Dialog
      open={tab.isCreateCollectionOpen}
      onOpenChange={tab.setIsCreateCollectionOpen}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="h-8 px-3">
          <Plus className="mr-1 size-4" />
          New
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create collection</DialogTitle>
          <DialogDescription>
            Add a collection to group requests for this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Name
            </p>
            <input
              value={tab.collectionName}
              onChange={(e) => tab.setCollectionName(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Collection name"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Description
            </p>
            <textarea
              value={tab.collectionDescription}
              onChange={(e) => tab.setCollectionDescription(e.target.value)}
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Optional description"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => tab.setIsCreateCollectionOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={tab.handleCreateCollection}
            disabled={tab.isCreatingCollection || !tab.collectionName.trim()}
          >
            {tab.isCreatingCollection ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SaveRequestDialogProps {
  tab: ReturnType<typeof useCollectionsTab>;
  collectionName: string;
}

export function SaveRequestDialog({
  tab,
  collectionName,
}: SaveRequestDialogProps) {
  return (
    <Dialog
      open={tab.isCreateRequestOpen}
      onOpenChange={tab.setIsCreateRequestOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save request</DialogTitle>
          <DialogDescription>
            Store the current composer request in {collectionName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Name
            </p>
            <input
              value={tab.requestName}
              onChange={(e) => tab.setRequestName(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Request name"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Uses the current method, URL, headers, and body from the composer.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => tab.setIsCreateRequestOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={tab.handleCreateRequest}
            disabled={
              tab.isCreatingCollectionRequest ||
              !tab.requestName.trim() ||
              !tab.composerUrl.trim() ||
              !!tab.composerBodyValidationError
            }
          >
            {tab.isCreatingCollectionRequest ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RenameCollectionDialogProps {
  tab: ReturnType<typeof useCollectionsTab>;
}

export function RenameCollectionDialog({ tab }: RenameCollectionDialogProps) {
  return (
    <Dialog
      open={!!tab.renameCollection}
      onOpenChange={(open) => {
        if (!open) tab.setRenameCollection(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>
            Update the collection name or description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Name
            </p>
            <input
              autoFocus
              value={tab.renameCollectionName}
              onChange={(e) => tab.setRenameCollectionName(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Collection name"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Description
            </p>
            <textarea
              value={tab.renameCollectionDescription}
              onChange={(e) =>
                tab.setRenameCollectionDescription(e.target.value)
              }
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Optional description"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => tab.setRenameCollection(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={tab.handleRenameCollection}
            disabled={
              tab.isRenamingCollection || !tab.renameCollectionName.trim()
            }
          >
            {tab.isRenamingCollection ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RenameRequestDialogProps {
  tab: ReturnType<typeof useCollectionsTab>;
}

export function RenameRequestDialog({ tab }: RenameRequestDialogProps) {
  return (
    <Dialog
      open={!!tab.renameRequest}
      onOpenChange={(open) => {
        if (!open) tab.setRenameRequest(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename request</DialogTitle>
          <DialogDescription>
            Enter a new name for this request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Name
          </p>
          <input
            autoFocus
            value={tab.renameRequestName}
            onChange={(e) => tab.setRenameRequestName(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Request name"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => tab.setRenameRequest(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={tab.handleRenameRequest}
            disabled={tab.isRenamingRequest || !tab.renameRequestName.trim()}
          >
            {tab.isRenamingRequest ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
