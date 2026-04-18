import { Circle, CircleCheckBig, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

export type KeyValueRow = {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
};

type KeyValueEditorProps = {
  title: string;
  rows: KeyValueRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onChangeKey: (id: string, key: string) => void;
  onChangeValue: (id: string, value: string) => void;
  addDisabled?: boolean;
  emptyLabel?: string;
};

export function KeyValueEditor({
  title,
  rows,
  onAdd,
  onRemove,
  onToggleEnabled,
  onChangeKey,
  onChangeValue,
  addDisabled = false,
  emptyLabel = "No items yet",
}: KeyValueEditorProps) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const lastRow = safeRows[safeRows.length - 1];
  const canAdd = !lastRow || lastRow.key.trim().length > 0;

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAdd}
          disabled={addDisabled || !canAdd}
          className="gap-1.5"
        >
          <PlusIcon className="size-4" />
          Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {safeRows.length === 0 ? (
          <div className="m-4 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No rows yet
          </div>
        ) : (
          <div className="divide-y border-y">
            <div className="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)_3rem] items-center bg-muted/30 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              <div />
              <div className="pl-2">Key</div>
              <div className="pl-2">Value</div>
              <div />
            </div>

            {safeRows.map((row) => {
              const rowDisabled = !row.enabled;

              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)_3rem] items-stretch bg-background py-0.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center justify-center border-r border-border/70 px-1">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => onToggleEnabled(row.id, !row.enabled)}
                      aria-label={row.enabled ? "Disable row" : "Enable row"}
                      className="mx-auto text-emerald-500 hover:text-emerald-600"
                    >
                      {row.enabled ? (
                        <CircleCheckBig className="size-4" />
                      ) : (
                        <Circle className="size-4" />
                      )}
                    </Button>
                  </div>

                  <div className="border-r border-border/70">
                    <input
                      value={row.key}
                      onChange={(e) => onChangeKey(row.id, e.target.value)}
                      disabled={rowDisabled}
                      placeholder="Key"
                      autoFocus
                      className="h-9 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-muted/30 disabled:text-muted-foreground/70 disabled:shadow-none disabled:ring-0 disabled:placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="border-r border-border/70">
                    <input
                      value={row.value}
                      onChange={(e) => onChangeValue(row.id, e.target.value)}
                      disabled={rowDisabled}
                      placeholder="Value"
                      className="h-9 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-muted/30 disabled:text-muted-foreground/70 disabled:shadow-none disabled:ring-0 disabled:placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="flex items-center justify-center px-1">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => onRemove(row.id)}
                      aria-label="Delete row"
                      className="mx-auto text-red-500 hover:text-red-400"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
