// frontend/src/features/response-viewer/components/response-pane.tsx
import { useComposerStore } from "@/features/request-composer/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBytes, formatMs, getStatusColor } from "@/lib/formatters";
import { AlertCircle } from "lucide-react";

export const ResponsePane = () => {
  const { response, status, duration, size, error, resHeaders } =
    useComposerStore();

  if (error) {
    return (
      <div className="flex h-full animate-in flex-col items-center justify-center space-y-4 p-8 text-center duration-300 fade-in zoom-in">
        <div className="rounded-full bg-rose-500/10 p-4 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
          <AlertCircle size={48} />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-rose-500">
            {error.code || "Request Error"}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {error.message}
          </p>
          <div className="pt-4 text-xs text-muted-foreground/60">
            Check your connectivity or the destination URL.
          </div>
        </div>
      </div>
    );
  }

  if (!response && !status) {
    return (
      <div className="flex h-full items-center justify-center p-4 font-light text-muted-foreground/60 italic decoration-dotted">
        No response yet. Configure your request and hit send.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background/50">
      <div className="flex shrink-0 items-center gap-4 border-b bg-muted/30 px-6 py-2.5 text-xs font-semibold backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
            Status
          </span>
          <span className={getStatusColor(status)}>{status}</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
            Time
          </span>
          <span className="font-mono text-indigo-400">
            {formatMs(duration)}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
            Size
          </span>
          <span className="font-mono text-indigo-400">{formatBytes(size)}</span>
        </div>
      </div>

      <Tabs
        defaultValue="body"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="border-b bg-muted/10 px-4">
          <TabsList className="h-10 gap-6 bg-transparent p-0">
            <TabsTrigger
              value="body"
              className="rounded-none border-b-2 border-transparent px-1 py-2 text-xs font-medium transition-all data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Response Body
            </TabsTrigger>
            <TabsTrigger
              value="headers"
              className="rounded-none border-b-2 border-transparent px-1 py-2 text-xs font-medium transition-all data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              Headers ({resHeaders ? Object.keys(resHeaders).length : 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="body"
          className="m-0 flex-1 overflow-auto bg-zinc-950/40 p-0"
        >
          <div className="p-4">
            <pre className="font-mono text-sm leading-relaxed text-emerald-400/90 selection:bg-emerald-500/20">
              <code>{JSON.stringify(response, null, 2)}</code>
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="m-0 flex-1 overflow-auto p-4">
          <div className="divide-y divide-border/50 overflow-hidden rounded-lg border bg-muted/10">
            {resHeaders &&
              Object.entries(resHeaders).map(([key, value]) => (
                <div
                  key={key}
                  className="group flex gap-4 p-3 transition-colors hover:bg-muted/20"
                >
                  <span className="w-48 shrink-0 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground/70">
                    {key}
                  </span>
                  <span className="font-mono text-xs break-all selection:bg-indigo-500/20">
                    {value}
                  </span>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
