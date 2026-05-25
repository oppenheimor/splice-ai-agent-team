import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { revokeSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await revokeSession(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  const response = NextResponse.redirect(new URL("/agent-team", request.url));

  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
