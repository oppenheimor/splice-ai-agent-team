import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";

const protectedPathPrefixes = [
  "/agent-team/admin",
  "/agent-team/requirements-diagnosis",
  "/agent-team/treasure/hunt",
  "/requirements-diagnosis",
  "/treasure/hunt",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPathPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (sessionId) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/agent-team/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/agent-team/admin/:path*",
    "/agent-team/requirements-diagnosis/:path*",
    "/agent-team/treasure/hunt/:path*",
    "/requirements-diagnosis/:path*",
    "/treasure/hunt/:path*",
  ],
};
