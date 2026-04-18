import { type SubmitEvent, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  useAuth,
  useGoogleAuth,
  useLogin,
  useLogout,
  useRegister,
} from "@/features/auth/hooks";

export const Auth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const startGoogleAuth = useGoogleAuth();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleLogin = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginMutation.mutateAsync(loginForm);
    navigate("/workspace", { replace: true });
  };

  const handleRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    await registerMutation.mutateAsync(registerForm);
    navigate("/workspace", { replace: true });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-start justify-center gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          You are signed in
        </h1>
        <p className="text-muted-foreground">
          {user.name ?? user.username ?? user.email}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/workspace")}>
            Go to workspace
          </Button>
          <Button
            variant="secondary"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[70vh] gap-6 px-6 py-16 lg:grid-cols-2">
      <section className="space-y-4">
        <p className="text-sm font-medium tracking-[0.3em] text-muted-foreground uppercase">
          Relay Auth
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          Login, register, or continue with Google.
        </h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          This page is the entry point for both signed-in users and new users.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="button" onClick={startGoogleAuth}>
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/")}
          >
            Back Home
          </Button>
        </div>
      </section>

      <section className="grid gap-6">
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-xl border bg-background p-5 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold">Login</h2>
            <p className="text-sm text-muted-foreground">
              Use your email and password.
            </p>
          </div>
          <input
            className="h-10 w-full rounded-md border bg-background px-3"
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <input
            className="h-10 w-full rounded-md border bg-background px-3"
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />
          {loginMutation.isError ? (
            <p className="text-sm text-destructive">
              Login failed. Check your credentials.
            </p>
          ) : null}
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </form>

        <form
          onSubmit={handleRegister}
          className="space-y-4 rounded-xl border bg-background p-5 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold">Register</h2>
            <p className="text-sm text-muted-foreground">
              Create a new account and workspace.
            </p>
          </div>
          <input
            className="h-10 w-full rounded-md border bg-background px-3"
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <input
            className="h-10 w-full rounded-md border bg-background px-3"
            type="text"
            placeholder="Username"
            value={registerForm.username}
            onChange={(e) =>
              setRegisterForm((prev) => ({ ...prev, username: e.target.value }))
            }
          />
          <input
            className="h-10 w-full rounded-md border bg-background px-3"
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />
          {registerMutation.isError ? (
            <p className="text-sm text-destructive">
              Registration failed. Try a different email or username.
            </p>
          ) : null}
          <Button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Creating account..." : "Register"}
          </Button>
        </form>
      </section>
    </div>
  );
};
