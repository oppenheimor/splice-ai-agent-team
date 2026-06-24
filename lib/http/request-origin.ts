import type { NextRequest } from "next/server";

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function getForwardedDirective(value: string | null, directive: string): string | null {
  const forwardedValue = firstHeaderValue(value);

  if (!forwardedValue) {
    return null;
  }

  const matchedDirective = forwardedValue
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith(`${directive.toLowerCase()}=`));

  return matchedDirective?.split("=").slice(1).join("=").replace(/^"|"$/g, "") || null;
}

function normalizeProtocol(value: string | null): "http" | "https" | null {
  const protocol = value?.replace(/:$/, "").toLowerCase();

  if (protocol === "http" || protocol === "https") {
    return protocol;
  }

  return null;
}

function getHttpsMarkerProtocol(request: NextRequest): "https" | null {
  const forwardedSsl = request.headers.get("x-forwarded-ssl")?.toLowerCase();
  const frontEndHttps = request.headers.get("front-end-https")?.toLowerCase();
  const forwardedHttps = request.headers.get("x-forwarded-https")?.toLowerCase();

  if (forwardedSsl === "on" || frontEndHttps === "on" || forwardedHttps === "on") {
    return "https";
  }

  return null;
}

function getSameHostBrowserProtocol(request: NextRequest, hostname: string): "http" | "https" | null {
  const headerValue = firstHeaderValue(request.headers.get("origin")) ??
    firstHeaderValue(request.headers.get("referer"));

  if (!headerValue) {
    return null;
  }

  try {
    const url = new URL(headerValue);

    if (url.host !== hostname) {
      return null;
    }

    return normalizeProtocol(url.protocol);
  } catch {
    return null;
  }
}

export function getRequestOrigin(request: NextRequest): string {
  const forwardedProto = normalizeProtocol(firstHeaderValue(request.headers.get("x-forwarded-proto")));
  const standardForwardedProto = normalizeProtocol(
    getForwardedDirective(request.headers.get("forwarded"), "proto"),
  );
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const standardForwardedHost = getForwardedDirective(request.headers.get("forwarded"), "host");
  const host = firstHeaderValue(request.headers.get("host"));
  const hostname = forwardedHost ?? standardForwardedHost ?? host ?? request.nextUrl.host;
  const protocol = forwardedProto ??
    standardForwardedProto ??
    getHttpsMarkerProtocol(request) ??
    getSameHostBrowserProtocol(request, hostname) ??
    normalizeProtocol(request.nextUrl.protocol) ??
    "http";

  return `${protocol}://${hostname}`;
}

export function buildRequestUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname, getRequestOrigin(request));
}
