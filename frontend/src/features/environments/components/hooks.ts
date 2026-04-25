import type { EnvironmentSummary } from "../api";
import {
  useCreateEnvVariable,
  useDeleteEnvVariable,
  useUpdateEnvironment,
  useUpdateEnvVariable,
} from "../hooks";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface EditableVariable {
  _localId: number;
  dbId: number | null;
  key: string;
  value: string;
  secret: boolean;
  description: string;
}

let _nextLocalId = 0;
function nextLocalId() {
  return ++_nextLocalId;
}

export function useEnvironmentEditor(workspaceId: string) {
  const { mutateAsync: updateEnvironment } = useUpdateEnvironment();
  const { mutateAsync: createVariable } = useCreateEnvVariable();
  const { mutateAsync: updateVariable } = useUpdateEnvVariable();
  const { mutateAsync: deleteVariable } = useDeleteEnvVariable();

  const [editingEnv, setEditingEnv] = useState<EnvironmentSummary | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editVars, setEditVars] = useState<EditableVariable[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeVarTab, setActiveVarTab] = useState<"variables" | "secrets">(
    "variables"
  );

  const isOpen = !!editingEnv;
  const normalVariables = editVars.filter((v) => !v.secret);
  const secretVariables = editVars.filter((v) => v.secret);

  const openEditor = useCallback((env: EnvironmentSummary) => {
    setEditingEnv(env);
    setEditLabel(env.name);
    setActiveVarTab("variables");
    setEditVars(
      env.environmentVariables.map((v) => ({
        _localId: nextLocalId(),
        dbId: v.id,
        key: v.key,
        value: v.value,
        secret: v.secret,
        description: v.description ?? "",
      }))
    );
  }, []);

  const closeEditor = useCallback(() => {
    setEditingEnv(null);
    setEditLabel("");
    setEditVars([]);
    setIsSaving(false);
  }, []);

  const addVariable = useCallback((secret: boolean) => {
    setEditVars((prev) => [
      ...prev,
      {
        _localId: nextLocalId(),
        dbId: null,
        key: "",
        value: "",
        secret,
        description: "",
      },
    ]);
  }, []);

  const updateEditVar = useCallback(
    (
      localId: number,
      field: keyof EditableVariable,
      value: string | boolean
    ) => {
      setEditVars((prev) =>
        prev.map((v) => (v._localId === localId ? { ...v, [field]: value } : v))
      );
    },
    []
  );

  const removeEditVar = useCallback((localId: number) => {
    setEditVars((prev) => prev.filter((v) => v._localId !== localId));
  }, []);

  const handleCopyValue = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingEnv) return;
    setIsSaving(true);

    try {
      if (editLabel.trim() && editLabel.trim() !== editingEnv.name) {
        await updateEnvironment({
          workspaceId,
          environmentId: editingEnv.id,
          name: editLabel.trim(),
        });
      }

      const originalIds = new Set(
        editingEnv.environmentVariables.map((v) => v.id)
      );
      const currentDbIds = new Set(
        editVars.filter((v) => v.dbId !== null).map((v) => v.dbId!)
      );

      for (const origId of originalIds) {
        if (!currentDbIds.has(origId)) {
          await deleteVariable({
            workspaceId,
            environmentId: editingEnv.id,
            varId: origId,
          });
        }
      }

      for (const v of editVars) {
        if (!v.key.trim()) continue;

        if (v.dbId === null) {
          await createVariable({
            workspaceId,
            environmentId: editingEnv.id,
            payload: {
              key: v.key.trim(),
              value: v.value,
              secret: v.secret,
              description: v.description || null,
            },
          });
        } else {
          const orig = editingEnv.environmentVariables.find(
            (ov) => ov.id === v.dbId
          );
          if (
            orig &&
            (orig.key !== v.key ||
              orig.value !== v.value ||
              orig.secret !== v.secret ||
              (orig.description ?? "") !== v.description)
          ) {
            await updateVariable({
              workspaceId,
              environmentId: editingEnv.id,
              varId: v.dbId,
              payload: {
                key: v.key.trim(),
                value: v.value,
                secret: v.secret,
                description: v.description || null,
              },
            });
          }
        }
      }

      toast.success("Environment saved");
      closeEditor();
    } catch (err: any) {
      const msg =
        err?.response?.status === 409
          ? "Duplicate variable key — each key must be unique within an environment"
          : "Failed to save environment";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }, [
    editingEnv,
    editLabel,
    editVars,
    workspaceId,
    updateEnvironment,
    createVariable,
    updateVariable,
    deleteVariable,
    closeEditor,
  ]);

  return {
    isOpen,
    editingEnv,
    editLabel,
    setEditLabel,
    editVars,
    isSaving,
    activeVarTab,
    setActiveVarTab,
    normalVariables,
    secretVariables,
    openEditor,
    closeEditor,
    addVariable,
    updateEditVar,
    removeEditVar,
    handleCopyValue,
    handleSave,
  };
}
