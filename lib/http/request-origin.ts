import type { NextRequest } from "next/server";

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

export function getRequestOrigin(request: NextRequest): string {
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = firstHeaderValue(request.headers.get("host"));
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(/:$/, "");
  const hostname = forwardedHost ?? host ?? request.nextUrl.host;

  return `${protocol}://${hostname}`;
}

export function buildRequestUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname, getRequestOrigin(request));
}
