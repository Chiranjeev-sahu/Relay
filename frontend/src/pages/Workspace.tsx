import { AppShell } from "@/layouts/app-shell";
import { useEffect } from "react";

import { useComposerStore } from "@/features/request-composer/store";
import { useResponseStore } from "@/features/response-viewer/store";
import { useWorkspaceStore } from "@/features/workspace/store";

export const WorkspacePage = () => {
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId
  );
  const resetDraft = useComposerStore((state) => state.resetDraft);
  const clearResponse = useResponseStore((state) => state.clear);

  useEffect(() => {
    resetDraft();
    clearResponse();
  }, [activeWorkspaceId, resetDraft, clearResponse]);

  return (
    <div className="h-screen w-full">
      <AppShell />
    </div>
  );
};
