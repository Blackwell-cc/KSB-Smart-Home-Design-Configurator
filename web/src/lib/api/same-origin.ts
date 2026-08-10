function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",", 1)[0]?.trim();
  return first || null;
}

function originFor(protocol: string, host: string): string | null {
  if (!/^[A-Za-z0-9.:[\]-]+$/.test(host)) return null;
  try {
    const parsed = new URL(`${protocol}//${host}`);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.origin : null;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const rawOrigin = request.headers.get("origin");
  if (!rawOrigin) return false;

  let suppliedOrigin: string;
  try {
    const parsed = new URL(rawOrigin);
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.origin !== rawOrigin) return false;
    suppliedOrigin = parsed.origin;
  } catch {
    return false;
  }

  const requestUrl = new URL(request.url);
  const forwardedProtocol = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https" ? `${forwardedProtocol}:` : requestUrl.protocol;
  const candidateHosts = [
    firstHeaderValue(request.headers.get("x-forwarded-host")),
    firstHeaderValue(request.headers.get("host")),
    requestUrl.host,
  ];

  return candidateHosts.some((host) => host !== null && originFor(protocol, host) === suppliedOrigin);
}
