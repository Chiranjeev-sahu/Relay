import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ErrorBoundary } from "react-error-boundary"
import { Toaster } from "sonner"
import { ThemeProvider, useTheme } from "@/components/theme-provider"
import { queryClient } from "./query-client"
import { GlobalError } from "@/components/global-error"
import { useNavigate } from "react-router"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <ErrorBoundary
      FallbackComponent={GlobalError}
      onReset={() => navigate("/")}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <IntegratedToaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
function IntegratedToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      theme={theme === "light" ? "light" : "dark"}
      position="top-right"
      closeButton
    />
  )
}
