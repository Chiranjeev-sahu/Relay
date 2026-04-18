import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/workspace", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-start justify-center gap-6 px-6 py-16">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-medium tracking-[0.3em] text-muted-foreground uppercase">
          Relay
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          A workspace for testing APIs with roles, collections, and
          environments.
        </h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          Signed-in users can jump into their workspace. Guests can try the
          request builder in a limited mode.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/auth")}>Get Started</Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/workspace?mode=guest")}
        >
          Try Now
        </Button>
      </div>

      {isError ? (
        <p className="text-sm text-muted-foreground">
          Session check failed. You can still continue as a guest.
        </p>
      ) : null}
    </div>
  );
};
