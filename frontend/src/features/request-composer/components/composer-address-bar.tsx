import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComposerStore } from "../store";
import { Button } from "@/components/ui/button";
import { useSendRequest } from "../hooks/use-send-request";

export const ComposerBar = () => {
  const { method, url, setMethod, setUrl, headers, body } = useComposerStore();

  const { mutate: sendRequest, isPending } = useSendRequest();
  const handleSend = () => {
    if (!url) return;
    sendRequest({
      method,
      url,
      headers,
      body,
    });
  };

  return (
    <div className="flex w-full items-center gap-2.5 p-6 shadow-sm">
      <Select value={method} onValueChange={setMethod} defaultValue="GET">
        <SelectTrigger className="w-32 rounded-md border-r-0 bg-muted/50 font-semibold focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="GET" className="font-semibold text-green-500">
            GET
          </SelectItem>
          <SelectItem value="POST" className="font-semibold text-yellow-500">
            POST
          </SelectItem>
          <SelectItem value="PUT" className="font-semibold text-blue-500">
            PUT
          </SelectItem>
          <SelectItem value="PATCH" className="font-semibold text-orange-500">
            PATCH
          </SelectItem>
          <SelectItem value="DELETE" className="font-semibold text-red-500">
            DELETE
          </SelectItem>
        </SelectContent>
      </Select>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://jsonplaceholder.typicode.com/todos/1"
        className="h-10 flex-1 border bg-background px-4 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
      />

      <Button
        className="h-10 rounded-l-none bg-primary px-8 hover:bg-primary/70"
        onClick={handleSend}
        disabled={isPending || url.length === 0}
      >
        {isPending ? "Sending..." : "Send"}
      </Button>
    </div>
  );
};
