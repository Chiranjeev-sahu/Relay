import { type HttpMethod } from "@/features/request-composer/store";

export const methodStyles: Record<HttpMethod, string> = {
  GET: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  POST: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  PUT: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  PATCH: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  DELETE: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  OPTIONS: "border-violet-500/20 bg-violet-500/10 text-violet-400",
};
