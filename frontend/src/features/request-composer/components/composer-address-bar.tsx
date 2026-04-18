import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSendRequest } from "../hooks/use-send-request";
import {
  getBodyValidationError,
  useComposerStore,
  type HttpMethod,
} from "../store";
import { cn } from "@/lib/utils";

export const ComposerBar = () => {
  const { method, url, setMethod, setUrl, headers, bodyType, body } =
    useComposerStore();

  const bodyValidationError = getBodyValidationError(bodyType, body);

  const { mutate: sendRequest, isPending } = useSendRequest();

  const handleSend = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) return;

    sendRequest({
      method,
      url: trimmedUrl,
      headers,
      bodyType,
      body,
    });
  };
  const methodStyles: Record<HttpMethod, string> = {
    GET: "text-green-500",
    POST: "text-yellow-500",
    PUT: "text-blue-500",
    PATCH: "text-orange-500",
    DELETE: "text-red-500",
    OPTIONS: "text-purple-500",
  };

  return (
    <div className="flex w-full items-center gap-3 border-b bg-background px-4 py-3">
      <Select value={method} onValueChange={setMethod}>
        <SelectTrigger
          className={cn(
            "w-24 shrink-0 rounded-md border bg-muted font-semibold focus:ring-0 focus:ring-offset-0",
            methodStyles[method]
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="min-w-24 p-1.5">
          <SelectItem
            value="GET"
            className="px-3 py-2 font-semibold text-green-500 data-highlighted:bg-green-500/10! data-highlighted:text-green-500! data-[state=checked]:bg-green-500/10! data-[state=checked]:text-green-500!"
          >
            GET
          </SelectItem>
          <SelectItem
            value="POST"
            className="px-3 py-2 font-semibold text-yellow-500 data-highlighted:bg-yellow-500/10! data-highlighted:text-yellow-500! data-[state=checked]:bg-yellow-500/10! data-[state=checked]:text-yellow-500!"
          >
            POST
          </SelectItem>
          <SelectItem
            value="PUT"
            className="px-3 py-2 font-semibold text-blue-500 data-highlighted:bg-blue-500/10! data-highlighted:text-blue-500! data-[state=checked]:bg-blue-500/10! data-[state=checked]:text-blue-500!"
          >
            PUT
          </SelectItem>
          <SelectItem
            value="PATCH"
            className="px-3 py-2 font-semibold text-orange-500 data-highlighted:bg-orange-500/10! data-highlighted:text-orange-500! data-[state=checked]:bg-orange-500/10! data-[state=checked]:text-orange-500!"
          >
            PATCH
          </SelectItem>
          <SelectItem
            value="DELETE"
            className="px-3 py-2 font-semibold text-red-500 data-highlighted:bg-red-500/10! data-highlighted:text-red-500! data-[state=checked]:bg-red-500/10! data-[state=checked]:text-red-500!"
          >
            DELETE
          </SelectItem>
          <SelectItem
            value="OPTIONS"
            className="px-3 py-2 font-semibold text-purple-500 data-highlighted:bg-purple-500/10! data-highlighted:text-purple-500! data-[state=checked]:bg-purple-500/10! data-[state=checked]:text-purple-500!"
          >
            OPTIONS
          </SelectItem>
        </SelectContent>
      </Select>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter request URL"
        spellCheck={false}
        autoComplete="off"
        className="h-10 min-w-0 flex-1 rounded-md border bg-background px-4 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      />

      <Button
        type="button"
        className="h-10 shrink-0 px-8"
        onClick={handleSend}
        disabled={isPending || !url.trim() || !!bodyValidationError}
      >
        {isPending ? "Sending..." : "Send"}
      </Button>
    </div>
  );
};
