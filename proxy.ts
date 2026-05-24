import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, decodeDemoUser } from "@/lib/auth/session";

const protectedPathPrefixes = [
  "/agent-team/requirements-diagnosis",
  "/requirements-diagnosis",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPathPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const user = decodeDemoUser(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (user) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/agent-team/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/agent-team/requirements-diagnosis/:path*",
    "/requirements-diagnosis/:path*",
  ],
};
