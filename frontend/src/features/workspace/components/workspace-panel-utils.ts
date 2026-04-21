import type { HeaderRow } from "@/features/request-composer/store";

export function createHeaderRows(headers: unknown): HeaderRow[] {
  if (!headers) return [];

  if (Array.isArray(headers)) {
    return headers
      .filter(
        (header): header is HeaderRow =>
          !!header &&
          typeof header === "object" &&
          "key" in header &&
          "value" in header
      )
      .map((header) => ({
        id:
          header.id ??
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now()}-${Math.random()}`,
        key: String((header as { key?: unknown }).key ?? ""),
        value: String((header as { value?: unknown }).value ?? ""),
        enabled: (header as { enabled?: boolean }).enabled ?? true,
      }));
  }

  if (typeof headers === "object") {
    return Object.entries(headers as Record<string, unknown>).map(
      ([key, value]) => ({
        id:
          globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        key,
        value: String(value ?? ""),
        enabled: true,
      })
    );
  }

  return [];
}

export function serializeBody(body: unknown): string {
  if (body === null || body === undefined) return "";
  if (typeof body === "string") return body;

  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
}
