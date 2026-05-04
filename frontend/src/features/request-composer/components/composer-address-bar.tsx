import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSendRequest } from "../hooks/use-send-request";
import {
  getBodyValidationError,
  useComposerStore,
  type HttpMethod,
} from "../store";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "@/features/workspace/hooks";
import { useWorkspaceStore } from "@/features/workspace/store";
import { SaveToCollectionDialog } from "./save-to-collection-dialog";
import { BookmarkPlus, Copy } from "lucide-react";
import { buildCurl } from "../utils/curl";
import { toast } from "sonner";
import type { Role } from "@/features/workspace/types";

const CAN_SAVE: Role[] = ["OWNER", "ADMIN", "MEMBER"];

const methodStyles: Record<HttpMethod, string> = {
  GET: "text-emerald-500",
  POST: "text-amber-400",
  PUT: "text-blue-400",
  PATCH: "text-orange-400",
  DELETE: "text-red-400",
  OPTIONS: "text-purple-400",
};

export const ComposerBar = () => {
  const method = useComposerStore((state) => state.method);
  const url = useComposerStore((state) => state.url);
  const setMethod = useComposerStore((state) => state.setMethod);
  const setUrl = useComposerStore((state) => state.setUrl);
  const headers = useComposerStore((state) => state.headers);
  const bodyType = useComposerStore((state) => state.bodyType);
  const body = useComposerStore((state) => state.body);

  const [saveOpen, setSaveOpen] = useState(false);

  const bodyValidationError = getBodyValidationError(bodyType, body);
  const { mutate: sendRequest, isPending } = useSendRequest();

  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: workspacesData } = useWorkspaces();
  const activeWorkspace = workspacesData?.workspaces.find(
    (w) => w.id === activeWorkspaceId
  );
  const userRole = activeWorkspace?.role ?? null;
  const canSave = userRole !== null && CAN_SAVE.includes(userRole);

  const handleCopyCurl = async () => {
    const cmd = buildCurl({ method, url, headers, bodyType, body });
    try {
      await navigator.clipboard.writeText(cmd);
      toast.success("cURL copied to clipboard");
    } catch {
      toast.error("Failed to copy cURL");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (url.trim() && canSave) {
          setSaveOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [url, canSave]);

  const handleSend = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    sendRequest({ method, url: trimmedUrl, headers, bodyType, body });
  };

  return (
    <>
      <div className="flex w-full items-center gap-2 border-b bg-background px-3 py-2">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger
            className={cn(
              "h-8 w-26 shrink-0 rounded border bg-muted/60 px-2 text-xs font-bold tracking-wide",
              "focus:ring-0 focus:ring-offset-0",
              methodStyles[method]
            )}
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent position="popper" className="min-w-28 p-1">
            {(
              [
                [
                  "GET",
                  "text-emerald-500",
                  "data-highlighted:bg-emerald-500/10! data-highlighted:text-emerald-500! data-[state=checked]:bg-emerald-500/10! data-[state=checked]:text-emerald-500!",
                ],
                [
                  "POST",
                  "text-amber-400",
                  "data-highlighted:bg-amber-400/10! data-highlighted:text-amber-400! data-[state=checked]:bg-amber-400/10! data-[state=checked]:text-amber-400!",
                ],
                [
                  "PUT",
                  "text-blue-400",
                  "data-highlighted:bg-blue-400/10! data-highlighted:text-blue-400! data-[state=checked]:bg-blue-400/10! data-[state=checked]:text-blue-400!",
                ],
                [
                  "PATCH",
                  "text-orange-400",
                  "data-highlighted:bg-orange-400/10! data-highlighted:text-orange-400! data-[state=checked]:bg-orange-400/10! data-[state=checked]:text-orange-400!",
                ],
                [
                  "DELETE",
                  "text-red-400",
                  "data-highlighted:bg-red-400/10! data-highlighted:text-red-400! data-[state=checked]:bg-red-400/10! data-[state=checked]:text-red-400!",
                ],
                [
                  "OPTIONS",
                  "text-purple-400",
                  "data-highlighted:bg-purple-400/10! data-highlighted:text-purple-400! data-[state=checked]:bg-purple-400/10! data-[state=checked]:text-purple-400!",
                ],
              ] as [HttpMethod, string, string][]
            ).map(([m, color, highlighted]) => (
              <SelectItem
                key={m}
                value={m}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-bold",
                  color,
                  highlighted
                )}
              >
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter request URL…"
          spellCheck={false}
          autoComplete="off"
          className={cn(
            "h-8 min-w-0 flex-1 rounded border bg-background px-3 font-mono text-sm outline-none",
            "transition-colors placeholder:text-muted-foreground/60",
            "focus:border-ring focus:ring-2 focus:ring-ring/20"
          )}
        />

        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 px-5 font-semibold"
          onClick={handleSend}
          disabled={isPending || !url.trim() || !!bodyValidationError}
        >
          {isPending ? "Sending…" : "Send"}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 shrink-0 px-2 text-muted-foreground hover:text-foreground"
              onClick={handleCopyCurl}
              disabled={!url.trim()}
            >
              <Copy className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy as cURL</TooltipContent>
        </Tooltip>

        {canSave && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 shrink-0 gap-1.5 px-3 font-medium"
                onClick={() => setSaveOpen(true)}
                disabled={!url.trim()}
              >
                <BookmarkPlus className="size-3.5" />
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save to collection</TooltipContent>
          </Tooltip>
        )}
      </div>

      <SaveToCollectionDialog open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  );
};
