import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceStore } from "@/features/workspace/store";
import {
  useWorkspaceCollections,
  useCreateCollectionRequest,
} from "@/features/collections/hooks";
import { useComposerStore } from "../store";
import { Loader2, FolderOpen } from "lucide-react";

interface SaveToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveToCollectionDialog({
  open,
  onOpenChange,
}: SaveToCollectionDialogProps) {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { method, url, headers, body, bodyType } = useComposerStore();

  const [requestName, setRequestName] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  const { data: collectionsData, isLoading: collectionsLoading } =
    useWorkspaceCollections(activeWorkspaceId, open);

  const { mutate: saveRequest, isPending } = useCreateCollectionRequest();

  const collections = collectionsData?.collections ?? [];

  const handleSave = () => {
    if (!activeWorkspaceId || !selectedCollectionId || !requestName.trim())
      return;

    saveRequest(
      {
        workspaceId: activeWorkspaceId,
        collectionId: Number(selectedCollectionId),
        payload: {
          name: requestName.trim(),
          method,
          url,
          headers: headers.reduce<Record<string, string>>((acc, h) => {
            if (h.enabled && h.key.trim()) acc[h.key.trim()] = h.value;
            return acc;
          }, {}),
          body: bodyType !== "none" ? body : undefined,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRequestName("");
          setSelectedCollectionId("");
        },
      }
    );
  };

  const isValid =
    requestName.trim().length > 0 &&
    selectedCollectionId !== "" &&
    !!activeWorkspaceId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="size-4 text-muted-foreground" />
            Save to Collection
          </DialogTitle>
          <DialogDescription>
            Save the current request into a collection in this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          {/* Request name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Request name
            </label>
            <input
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="e.g. Get user by ID"
              autoFocus
              className="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              onKeyDown={(e) => e.key === "Enter" && isValid && handleSave()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Collection
            </label>
            {collectionsLoading ? (
              <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Loading collections…
              </div>
            ) : collections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No collections in this workspace yet.
              </p>
            ) : (
              <Select
                value={selectedCollectionId}
                onValueChange={setSelectedCollectionId}
              >
                <SelectTrigger className="h-9 w-full bg-background">
                  <SelectValue placeholder="Pick a collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((col) => (
                    <SelectItem key={col.id} value={String(col.id)}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="rounded-md border bg-muted/30 px-3 py-2">
            <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              Request
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-foreground">
              <span className="mr-1.5 font-semibold text-primary">
                {method}
              </span>
              {url || (
                <span className="text-muted-foreground italic">no URL</span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isValid || isPending}
              onClick={handleSave}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
