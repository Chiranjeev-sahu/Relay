import { Button } from "@/components/ui/button";
import { type FallbackProps } from "react-error-boundary";
export function GlobalError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred in the application."}
      </p>
      <Button onClick={resetErrorBoundary} className="rounded-md bg-primary">
        Try again
      </Button>
    </div>
  );
}
