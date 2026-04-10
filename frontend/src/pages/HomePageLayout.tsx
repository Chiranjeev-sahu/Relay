import { Outlet } from "react-router" 
export const HomePageLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="h-16 border-b">
        <nav></nav>
      </header>

      <main className="container mx-auto flex-1 p-4">
        <Outlet />
      </main>

      <footer className="h-12 border-t pt-2 text-center">© 2026 Relay</footer>
    </div>
  )
}
