import type { BodyType, HeaderRow, HttpMethod } from "../store";

function shellEscape(value: string): string {
  if (/^[a-zA-Z0-9._\-/:=@]+$/.test(value)) return value;
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function buildCurl({
  method,
  url,
  headers,
  bodyType,
  body,
}: {
  method: HttpMethod;
  url: string;
  headers: HeaderRow[];
  bodyType: BodyType;
  body: string;
}): string {
  const parts: string[] = ["curl"];

  if (method !== "GET") {
    parts.push("-X", method);
  }

  const enabledHeaders = headers.filter(
    (h) => h.enabled && h.key.trim() && h.value.trim()
  );

  for (const header of enabledHeaders) {
    parts.push("-H", shellEscape(`${header.key}: ${header.value}`));
  }

  if (bodyType !== "none" && body.trim()) {
    const hasContentType = enabledHeaders.some(
      (h) => h.key.toLowerCase() === "content-type"
    );

    if (!hasContentType) {
      parts.push("-H", shellEscape(`Content-Type: ${bodyType}`));
    }

    parts.push("-d", shellEscape(body.trim()));
  }

  parts.push(shellEscape(url));

  return parts.join(" ");
}
