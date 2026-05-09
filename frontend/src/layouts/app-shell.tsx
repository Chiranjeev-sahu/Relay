import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComposerBar } from "@/features/request-composer/components/composer-address-bar";
import { RequestTabBar } from "@/features/request-composer/components/request-tab-bar";
import { RequestTabs } from "@/features/request-composer/components/request-tabs";
import { ResponsePane } from "@/features/response-viewer/components/response-pane";
import { WorkspacePanel } from "@/features/workspace/components/workspace-panel";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/features/auth/hooks";
import { useTheme } from "@/components/theme-provider";
import { LogOut, Monitor, Moon, Sun, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { useUIstore } from "@/stores/ui-store";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useSearchParams } from "react-router";

function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserProfileMenu() {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full bg-muted"
        >
          <UserIcon className="size-4" />
          <span className="sr-only">User profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {user.name || user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell() {
  const { isLeftOpen, isRightOpen, toggleLeft, toggleRight } = useUIstore();
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get("mode") === "guest";
  const showRightPanel = !isGuestMode && isRightOpen;
  const showLeftPanel = !isGuestMode;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="Relay Logo"
            className="size-6 object-contain"
          />
          <div className="font-bold">Relay</div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {!isGuestMode && <UserProfileMenu />}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {showLeftPanel && (
          <aside
            className={cn(
              "w-12 shrink-0 overflow-x-clip overflow-y-auto border-r bg-muted/30 transition-all duration-300",
              isLeftOpen && "w-64"
            )}
          >
            <WorkspaceSwitcher />
          </aside>
        )}

        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize="80%" minSize="30%">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize="70%" minSize="20%">
                <div className="flex h-full flex-col">
                  <RequestTabBar />
                  <ComposerBar />
                  <RequestTabs />
                </div>
              </ResizablePanel>
              <ResizableHandle className="bg-border transition-colors hover:bg-primary/50 data-resize-handle-active:bg-primary/60" />
              <ResizablePanel defaultSize="30%" minSize="20%">
                <div className="h-full overflow-y-auto border-t bg-muted/10 p-4">
                  <ResponsePane />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {showRightPanel && (
            <>
              <ResizableHandle className="bg-border transition-colors hover:bg-primary/50 data-resize-handle-active:bg-primary/60" />
              <ResizablePanel defaultSize="20%" maxSize="35%" minSize="20%">
                <aside className="h-full overflow-y-auto bg-background">
                  <WorkspacePanel />
                </aside>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>

      <footer className="flex h-8 shrink-0 items-center justify-between border-t bg-muted/50 px-2 text-xs">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleLeft}
                className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={isLeftOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isLeftOpen ? (
                  <PanelLeftClose className="size-4" />
                ) : (
                  <PanelLeftOpen className="size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isLeftOpen ? "Collapse sidebar" : "Expand sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">Ready</div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleRight}
                className="flex items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={
                  isRightOpen ? "Close workspace panel" : "Open workspace panel"
                }
              >
                {isRightOpen ? (
                  <PanelRightClose className="size-4" />
                ) : (
                  <PanelRightOpen className="size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isRightOpen ? "Close workspace panel" : "Open workspace panel"}
            </TooltipContent>
          </Tooltip>
        </div>
      </footer>
    </div>
  );
}
