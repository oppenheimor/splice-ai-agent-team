import type { NextRequest } from "next/server";

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

export function getClientIp(request: NextRequest): string | null {
  return firstHeaderValue(request.headers.get("x-forwarded-for")) ??
    firstHeaderValue(request.headers.get("x-real-ip")) ??
    firstHeaderValue(request.headers.get("cf-connecting-ip"));
}
