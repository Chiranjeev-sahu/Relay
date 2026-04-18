import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyValueEditor } from "./key-value-editor.tsx";
import { getBodyValidationError, useComposerStore } from "../store";

const editorPanelClass =
  "min-h-44 flex-1 bg-muted/5 text-sm text-muted-foreground";

export const RequestTabs = () => {
  const {
    params,
    headers,
    bodyType,
    body,
    addParam,
    removeParam,
    updateParam,
    addHeader,
    removeHeader,
    updateHeader,
    setBodyType,
    setBody,
  } = useComposerStore();

  const bodyValidationError = getBodyValidationError(bodyType, body);

  const handleBodyKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${body.slice(0, start)}  ${body.slice(end)}`;

    setBody(nextValue);

    window.requestAnimationFrame(() => {
      textarea.selectionStart = start + 2;
      textarea.selectionEnd = start + 2;
    });
  };

  return (
    <Tabs
      defaultValue="params"
      className="flex h-full flex-1 flex-col overflow-hidden"
    >
      <TabsList
        variant="line"
        className="w-full justify-start gap-1 border-b bg-background px-3 pt-2"
      >
        <TabsTrigger value="params" className="px-3 py-2 text-sm">
          Params
        </TabsTrigger>
        <TabsTrigger value="headers" className="px-3 py-2 text-sm">
          Headers
        </TabsTrigger>
        <TabsTrigger value="body" className="px-3 py-2 text-sm">
          Body
        </TabsTrigger>
      </TabsList>

      <TabsContent value="params" className={editorPanelClass}>
        <KeyValueEditor
          title="Query Parameters"
          emptyLabel="Add query parameters for the current request"
          rows={params}
          onAdd={() => addParam()}
          onRemove={removeParam}
          onToggleEnabled={(id: string, enabled: boolean) =>
            updateParam(id, { enabled })
          }
          onChangeKey={(id: string, key: string) => updateParam(id, { key })}
          onChangeValue={(id: string, value: string) =>
            updateParam(id, { value })
          }
        />
      </TabsContent>

      <TabsContent value="headers" className={editorPanelClass}>
        <KeyValueEditor
          title="Request Headers"
          emptyLabel="Add headers for the current request"
          rows={headers}
          onAdd={() => addHeader()}
          onRemove={removeHeader}
          onToggleEnabled={(id: string, enabled: boolean) =>
            updateHeader(id, { enabled })
          }
          onChangeKey={(id: string, key: string) => updateHeader(id, { key })}
          onChangeValue={(id: string, value: string) =>
            updateHeader(id, { value })
          }
        />
      </TabsContent>

      <TabsContent value="body" className={editorPanelClass}>
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 pt-4 pb-3">
            <div>
              <p className="font-medium text-foreground">Request Body</p>
              <p className="text-xs text-muted-foreground">
                Only none or application/json are supported.
              </p>
            </div>

            <Select
              value={bodyType}
              onValueChange={(value) =>
                setBodyType(value as "none" | "application/json")
              }
            >
              <SelectTrigger size="sm" className="w-45 bg-background">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="application/json">
                  application/json
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bodyType === "none" ? (
            <div className="m-4 px-4 py-6 text-sm text-muted-foreground">
              Body is disabled for this request.
            </div>
          ) : (
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={handleBodyKeyDown}
                placeholder='{"hello": "world"}'
                spellCheck={false}
                className={
                  bodyValidationError
                    ? "h-full min-h-56 w-full resize-none border border-destructive bg-background px-4 py-3 font-mono text-sm transition-colors outline-none placeholder:text-muted-foreground"
                    : "h-full min-h-56 w-full resize-none bg-background px-4 py-3 font-mono text-sm transition-colors outline-none placeholder:text-muted-foreground"
                }
              />
              {bodyValidationError ? (
                <p className="px-4 pt-2 text-xs text-destructive">
                  Invalid JSON: {bodyValidationError}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
