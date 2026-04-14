import { Route, Routes } from "react-router";
import { HomePageLayout } from "./pages/HomePageLayout";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { WorkspacePage } from "./pages/Workspace";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/">
          <Route element={<HomePageLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="auth" element={<Auth />} />
          <Route path="workspace" element={<WorkspacePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
