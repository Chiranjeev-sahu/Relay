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
  const { user, isAuthenticated } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const startGoogleAuth = useGoogleAuth();

  const [mode, setMode] = useState<"login" | "register">("login");

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

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/20 px-6 py-16">
        <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">
            You are signed in
          </h1>
          <p className="mb-6 text-muted-foreground">
            {user.name ?? user.username ?? user.email}
          </p>
          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => navigate("/workspace")}>
              Go to workspace
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/favicon.png"
            alt="Relay Logo"
            className="mb-4 size-10 object-contain drop-shadow-md"
          />
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Enter your details to sign in to your account"
              : "Enter your details to get started with Relay"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mb-6 w-full font-normal"
          onClick={startGoogleAuth}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                type="email"
                placeholder="email@example.com"
                required
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                type="password"
                required
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
            {loginMutation.isError ? (
              <p className="text-sm text-destructive">
                Login failed. Check your credentials.
              </p>
            ) : null}
            <Button
              className="w-full"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="register-email"
              >
                Email
              </label>
              <input
                id="register-email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                type="email"
                placeholder="email@example.com"
                required
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="register-username"
              >
                Username
              </label>
              <input
                id="register-username"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                type="text"
                required
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="register-password"
              >
                Password
              </label>
              <input
                id="register-password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                type="password"
                required
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
            {registerMutation.isError ? (
              <p className="text-sm text-destructive">
                Registration failed. Try a different email or username.
              </p>
            ) : null}
            <Button
              className="w-full"
              type="submit"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};
