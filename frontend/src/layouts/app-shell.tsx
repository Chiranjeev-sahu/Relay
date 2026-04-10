// src/Pages/Workspace.tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher"
import { cn } from "@/lib/utils"
import { useUIstore } from "@/stores/ui-store"

export function AppShell() {
  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useUIstore()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="font-bold">Relay</div>
        <div>User Profile / Theme</div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "w-64 shrink-0 overflow-y-auto border-r bg-muted/30",
            isLeftOpen && "w-16"
          )}
        >
          <WorkspaceSwitcher />
        </aside>

        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize="80%" minSize="30%">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize="50%" minSize="20%">
                <div className="h-full overflow-y-auto bg-background p-4">
                  Request Composer (URL Bar, Headers, Body)
                </div>
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel defaultSize="50%" minSize="20%">
                <div className="h-full overflow-y-auto border-t bg-muted/10 p-4">
                  Response JSON Viewer
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {isRightOpen && (
            <>
              <ResizableHandle className="hover" />
              <ResizablePanel defaultSize="25%" maxSize="35%" minSize="25%">
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
  )
}
