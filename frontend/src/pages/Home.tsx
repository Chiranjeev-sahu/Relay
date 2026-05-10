import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/workspace", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      {/* <nav className="flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md sticky top-0 z-50 border-b border-border/40">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="Relay Logo" className="size-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          <span className="text-xl font-bold tracking-tight">Relay</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </nav> */}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center overflow-hidden px-6 pt-24 pb-32 text-center md:px-12 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 left-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]"></div>

          <div className="mb-8 inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-muted/80">
            <span className="mr-2 flex size-2 animate-pulse rounded-full bg-primary"></span>
            Relay v1.0 is now live
          </div>

          <h1 className="max-w-4xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl">
            Test APIs. <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Collaborate instantly.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            A beautiful, lightning-fast workspace for your team. Manage
            collections, switch environments instantly, and share requests
            without leaving the browser.
          </p>

          <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
              onClick={() => navigate("/auth")}
            >
              Start for free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 bg-background/50 px-8 text-base backdrop-blur-sm transition-transform hover:-translate-y-0.5"
              onClick={() => navigate("/workspace?mode=guest")}
            >
              Try Guest Mode
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y border-border/40 bg-muted/30 px-6 py-24 md:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Everything you need to build better APIs
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Relay replaces clunky desktop apps with a sleek, web-native
                experience designed for modern development teams.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-2xl border bg-background p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">Team Workspaces</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Invite your team, assign roles, and share your API collections
                  instantly. No more exporting and importing JSON files.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-2xl border bg-background p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">
                  Dynamic Environments
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Switch between Local, Staging, and Production with a single
                  click. Variables automatically interpolate in URLs, headers,
                  and bodies.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-2xl border bg-background p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold">Request History</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Never lose a test. Relay automatically logs your request
                  history, so you can revisit and re-run past API calls anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer CTA */}
      <footer className="border-t px-6 py-12 text-center md:py-16">
        <h2 className="mb-6 text-2xl font-semibold">
          Ready to streamline your API testing?
        </h2>
        <Button
          size="lg"
          className="px-8 shadow-lg shadow-primary/20"
          onClick={() => navigate("/auth")}
        >
          Create your Workspace
        </Button>
        <p className="mt-8 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Relay API Client. Built for
          developers.
        </p>
      </footer>
    </div>
  );
};
