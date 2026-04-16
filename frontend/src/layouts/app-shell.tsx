// src/Pages/Workspace.tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ComposerBar } from "@/features/request-composer/components/composer-address-bar";
import { ResponsePane } from "@/features/response-viewer/components/response-pane";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { cn } from "@/lib/utils";
import { useUIstore } from "@/stores/ui-store";
import { useSearchParams } from "react-router";

export function AppShell() {
  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useUIstore();
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get("mode") === "guest";
  const showRightPanel = !isGuestMode && isRightOpen;
  const showLeftPanel = !isGuestMode && isLeftOpen;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="font-bold">Relay</div>
        <div>User Profile / Theme</div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {showLeftPanel && <aside
          className={cn(
            "w-64 shrink-0 overflow-y-auto border-r bg-muted/30",
            isLeftOpen && "w-16"
          )}
        >
          <WorkspaceSwitcher />
        </aside>}

        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize="80%" minSize="30%">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize="70%" minSize="20%">
                <ComposerBar />
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize="30%" minSize="20%">
                <div className="h-full overflow-y-auto border-t bg-muted/10 p-4">
                  <ResponsePane />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

           
          {showRightPanel && (
            <>
              <ResizableHandle className="hover" />
              <ResizablePanel defaultSize="20%" maxSize="35%" minSize="20%">
                <aside className="h-full overflow-y-auto bg-muted/30 p-2">
                  <div className="p-4">Collections / Env / History</div>
                </aside>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>

      <footer className="flex h-8 shrink-0 items-center justify-between border-t bg-muted/50 px-2 text-xs">
        <div className="flex items-center gap-2">
          <button onClick={toggleLeft} className="rounded p-1 hover:bg-accent">
            Sidebar Toggle
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div>Status: Ready</div>
          <button onClick={toggleRight} className="rounded p-1 hover:bg-accent">
            Right Toggle
          </button>
        </div>
      </footer>
    </div>
  );
}
