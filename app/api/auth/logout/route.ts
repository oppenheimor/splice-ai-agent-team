import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { revokeSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await revokeSession(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  const loginUrl = new URL("/agent-team/login", request.url);
  const sourcePath = getSafeSourcePath(request);

  if (sourcePath) {
    loginUrl.searchParams.set("redirect_url", sourcePath);
  }

  const response = NextResponse.redirect(loginUrl);

  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}

function getSafeSourcePath(request: NextRequest): string {
  const referer = request.headers.get("referer");

  if (!referer) {
    return "";
  }

  let refererUrl: URL;

  try {
    refererUrl = new URL(referer);
  } catch {
    return "";
  }

  const requestUrl = new URL(request.url);

  if (refererUrl.origin !== requestUrl.origin) {
    return "";
  }

  const sourcePath = `${refererUrl.pathname}${refererUrl.search}`;

  if (sourcePath.startsWith("/agent-team/api") || sourcePath.startsWith("/agent-team/login")) {
    return "";
  }

  return sourcePath;
}
