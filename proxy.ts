import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { buildRequestUrl } from "@/lib/http/request-origin";
import {
  CSRF_REQUEST_HEADER_NAME,
  getOrCreateCsrfSecret,
  setCsrfCookies,
} from "@/lib/security/csrf";

const AUTH_RETURN_PATH_HEADER = "x-agent-team-auth-return-path";

const protectedPathPrefixes = [
  "/agent-team/admin",
  "/agent-team/credits",
  "/agent-team/deep-diagnosis",
  "/agent-team/requirements-diagnosis",
  "/agent-team/settings",
  "/agent-team/treasure/hunt",
  "/agent-team/video-expert-analyzer",
  "/credits",
  "/deep-diagnosis",
  "/requirements-diagnosis",
  "/settings",
  "/treasure/hunt",
  "/video-expert-analyzer",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const returnPath = `${pathname}${request.nextUrl.search}`;
  const csrfSecret = getOrCreateCsrfSecret(request);
  const isRequirementsDemoPath = pathname.startsWith("/requirements-diagnosis/demo-") ||
    pathname.startsWith("/agent-team/requirements-diagnosis/demo-");
  const isRequirementsAssetPath = pathname.startsWith("/requirements-diagnosis/avatars/") ||
    pathname.startsWith("/agent-team/requirements-diagnosis/avatars/");
  const isDeepDiagnosisDemoPath = pathname.startsWith("/deep-diagnosis/agui-demo") ||
    pathname.startsWith("/agent-team/deep-diagnosis/agui-demo");

  // 样品墙是静态设计预览，不读用户数据；跳过登录保护，避免污染正式功能验收。
  if (isRequirementsDemoPath || isRequirementsAssetPath || isDeepDiagnosisDemoPath) {
    return nextWithCsrf(request, csrfSecret);
  }

  const isProtectedPath = protectedPathPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtectedPath) {
    return nextWithCsrf(request, csrfSecret);
  }

  const sessionId = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (sessionId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(AUTH_RETURN_PATH_HEADER, returnPath);
    requestHeaders.set(CSRF_REQUEST_HEADER_NAME, csrfSecret);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    await setCsrfCookies(response, csrfSecret);

    return response;
  }

  const loginUrl = buildRequestUrl(request, "/agent-team/login");
  loginUrl.searchParams.set("redirect_url", returnPath);

  const response = NextResponse.redirect(loginUrl);
  await setCsrfCookies(response, csrfSecret);

  return response;
}

async function nextWithCsrf(request: NextRequest, csrfSecret: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CSRF_REQUEST_HEADER_NAME, csrfSecret);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  await setCsrfCookies(response, csrfSecret);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/agent-team/admin/:path*",
    "/agent-team/credits/:path*",
    "/agent-team/deep-diagnosis/:path*",
    "/agent-team/requirements-diagnosis/:path*",
    "/agent-team/settings/:path*",
    "/agent-team/treasure/hunt/:path*",
    "/agent-team/video-expert-analyzer/:path*",
    "/credits/:path*",
    "/deep-diagnosis/:path*",
    "/requirements-diagnosis/:path*",
    "/settings/:path*",
    "/treasure/hunt/:path*",
    "/video-expert-analyzer/:path*",
  ],
};
