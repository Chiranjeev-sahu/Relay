import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";

import type { EditableVariable } from "./hooks";

interface VariableRowProps {
  variable: EditableVariable;
  onChange: (
    localId: number,
    field: keyof EditableVariable,
    value: string | boolean
  ) => void;
  onCopy: (value: string) => void;
  onRemove: (localId: number) => void;
  readOnly: boolean;
  masked: boolean;
}

export function VariableRow({
  variable,
  onChange,
  onCopy,
  onRemove,
  readOnly,
  masked,
}: VariableRowProps) {
  const [showValue, setShowValue] = useState(false);
  const displayValue = masked && !showValue ? "•••••••••" : variable.value;

  return (
    <div className="group flex items-center gap-2 rounded-md border border-border/40 bg-muted/10 px-2 py-1.5 transition-colors hover:border-border/60">
      <input
        value={variable.key}
        onChange={(e) => onChange(variable._localId, "key", e.target.value)}
        readOnly={readOnly}
        className="h-8 w-32 shrink-0 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground read-only:opacity-60"
        placeholder="Key"
      />

      <input
        value={displayValue}
        onChange={(e) => onChange(variable._localId, "value", e.target.value)}
        readOnly={readOnly || masked}
        className="h-8 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground read-only:opacity-60"
        placeholder="Value"
      />

      {masked ? (
        <button
          type="button"
          onClick={() => setShowValue((prev) => !prev)}
          className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
          title={showValue ? "Hide value" : "Show value"}
        >
          {showValue ? (
            <EyeOff className="size-3.5" />
          ) : (
            <Eye className="size-3.5" />
          )}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => onCopy(variable.value)}
        className="shrink-0 p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
        title="Copy value"
      >
        <Copy className="size-3.5" />
      </button>

      {!readOnly ? (
        <button
          type="button"
          onClick={() => onRemove(variable._localId)}
          className="shrink-0 p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
          title="Remove variable"
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
