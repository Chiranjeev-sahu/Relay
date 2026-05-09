import { Navigate, Route, Routes, useSearchParams } from "react-router";
import { HomePageLayout } from "./pages/HomePageLayout";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { WorkspacePage } from "./pages/Workspace";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useWorkspaceStore } from "@/features/workspace/store";
import { DotmSquare12 } from "@/components/ui/dotm-square-12";

function AuthRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/workspace" replace />;
  }

  return <Auth />;
}

function WorkspaceRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get("mode") === "guest";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <DotmSquare12
            size={79}
            dotSize={11}
            speed={1.2}
            pattern="full"
            dotShape="square"
            colorPreset="solid-theme"
            animated
            opacityBase={0.13}
            opacityMid={0.42}
            opacityPeak={1}
          />
          <span>Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuestMode) {
    return <Navigate to="/auth" replace />;
  }

  return <WorkspacePage />;
}

export function App() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      useWorkspaceStore.getState().resetWorkspaceState();
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <Routes>
        <Route path="/">
          <Route element={<HomePageLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="auth" element={<AuthRoute />} />
          <Route path="workspace" element={<WorkspaceRoute />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
