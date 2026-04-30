import { useComposerStore, type HttpMethod } from "../store";
import { useWorkspaceStore } from "@/features/workspace/store";
import { useWorkspaceEnvironments } from "@/features/environments/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const methodColors: Record<HttpMethod, string> = {
  GET: "text-emerald-500",
  POST: "text-amber-400",
  PUT: "text-blue-400",
  PATCH: "text-orange-400",
  DELETE: "text-red-400",
  OPTIONS: "text-purple-400",
};

export function RequestTabBar() {
  const method = useComposerStore((s) => s.method);
  const isDirty = useComposerStore((s) => s.isDirty);
  const requestName = useComposerStore((s) => s.requestName);
  const resetDraft = useComposerStore((s) => s.resetDraft);

  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const activeEnvironmentByWorkspaceId = useWorkspaceStore(
    (s) => s.activeEnvironmentByWorkspaceId
  );
  const setActiveEnvironment = useWorkspaceStore((s) => s.setActiveEnvironment);

  const activeEnvId = activeWorkspaceId
    ? (activeEnvironmentByWorkspaceId[activeWorkspaceId] ?? "__none__")
    : "__none__";

  const { data: envsData } = useWorkspaceEnvironments(activeWorkspaceId);
  const environments = envsData?.environments ?? [];

  const displayName = requestName.trim() || "Untitled";

  return (
    <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b bg-background px-2">
      <div className="flex min-w-0 items-center gap-1">
        <div
          className={cn(
            "flex min-w-0 items-center gap-1.5 rounded-[5px] border px-2.5 py-1",
            "border-border/70 bg-muted/50 shadow-sm"
          )}
        >
          <span
            className={cn(
              "shrink-0 text-[11px] font-bold tracking-wide",
              methodColors[method]
            )}
          >
            {method}
          </span>

          <span className="max-w-48 min-w-0 truncate text-sm text-foreground/80">
            {displayName}
          </span>

          {isDirty && (
            <span
              className="size-[5px] shrink-0 rounded-full bg-primary/60"
              aria-label="unsaved changes"
            />
          )}
        </div>

        <button
          type="button"
          onClick={resetDraft}
          title="New request (clears composer)"
          className="flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {activeWorkspaceId && (
        <Select
          value={activeEnvId}
          onValueChange={(val) => {
            if (!activeWorkspaceId) return;
            setActiveEnvironment(
              activeWorkspaceId,
              val === "__none__" ? null : val
            );
          }}
        >
          <SelectTrigger
            className={cn(
              "h-7 w-auto max-w-52 min-w-0 gap-1.5 rounded border border-border/60 px-2",
              "bg-muted/40 text-xs text-muted-foreground shadow-none",
              "focus:ring-1 focus:ring-ring/30 focus:ring-offset-0"
            )}
          >
            <Layers className="size-3 shrink-0 text-muted-foreground/70" />
            <SelectValue placeholder="No environment" />
          </SelectTrigger>

          <SelectContent align="end" className="min-w-44">
            <SelectItem
              value="__none__"
              className="text-xs text-muted-foreground"
            >
              No environment
            </SelectItem>

            {environments.length > 0 && <SelectSeparator />}

            {environments.map((env) => (
              <SelectItem key={env.id} value={env.id} className="text-xs">
                {env.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
