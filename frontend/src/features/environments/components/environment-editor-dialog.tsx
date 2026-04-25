import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

import type { useEnvironmentEditor } from "./hooks";
import { VariableRow } from "./variable-row";

interface EnvironmentEditorDialogProps {
  editor: ReturnType<typeof useEnvironmentEditor>;
  canManage: boolean;
  isViewer: boolean;
}

export function EnvironmentEditorDialog({
  editor,
  canManage,
  isViewer,
}: EnvironmentEditorDialogProps) {
  const {
    isOpen,
    editLabel,
    setEditLabel,
    isSaving,
    activeVarTab,
    setActiveVarTab,
    normalVariables,
    secretVariables,
    addVariable,
    updateEditVar,
    removeEditVar,
    handleCopyValue,
    handleSave,
    closeEditor,
  } = editor;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeEditor();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {canManage ? "Edit Environment" : "View Environment"}
          </DialogTitle>
          <DialogDescription>
            {canManage
              ? "Rename, add or modify variables. Click Save when done."
              : "You are viewing this environment in read-only mode."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Label
          </label>
          <input
            autoFocus
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            readOnly={!canManage}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground read-only:opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Environment name"
          />
        </div>

        <Tabs
          value={activeVarTab}
          onValueChange={(v) => setActiveVarTab(v as "variables" | "secrets")}
          className="mt-2"
        >
          <div className="flex items-center justify-between">
            <TabsList variant="line" className="h-9 gap-4 bg-transparent p-0">
              <TabsTrigger value="variables" className="text-xs font-medium">
                Variables
              </TabsTrigger>
              <TabsTrigger value="secrets" className="text-xs font-medium">
                Secrets
              </TabsTrigger>
            </TabsList>

            {canManage ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => addVariable(activeVarTab === "secrets")}
                title={
                  activeVarTab === "secrets" ? "Add secret" : "Add variable"
                }
              >
                <Plus className="size-4" />
              </Button>
            ) : null}
          </div>

          <TabsContent value="variables" className="mt-2 space-y-1">
            {normalVariables.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No variables.{canManage ? " Click + to add one." : ""}
              </p>
            ) : (
              normalVariables.map((v) => (
                <VariableRow
                  key={v._localId}
                  variable={v}
                  onChange={updateEditVar}
                  onCopy={handleCopyValue}
                  onRemove={removeEditVar}
                  readOnly={!canManage}
                  masked={false}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="secrets" className="mt-2 space-y-1">
            {secretVariables.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No secrets.{canManage ? " Click + to add one." : ""}
              </p>
            ) : (
              secretVariables.map((v) => (
                <VariableRow
                  key={v._localId}
                  variable={v}
                  onChange={updateEditVar}
                  onCopy={handleCopyValue}
                  onRemove={removeEditVar}
                  readOnly={!canManage}
                  masked={isViewer}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          {canManage ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving || !editLabel.trim()}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" onClick={closeEditor}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={closeEditor}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
