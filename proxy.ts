import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { buildRequestUrl } from "@/lib/http/request-origin";

const protectedPathPrefixes = [
  "/agent-team/admin",
  "/agent-team/credits",
  "/agent-team/deep-diagnosis",
  "/agent-team/requirements-diagnosis",
  "/agent-team/settings",
  "/agent-team/treasure/hunt",
  "/credits",
  "/deep-diagnosis",
  "/requirements-diagnosis",
  "/settings",
  "/treasure/hunt",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isRequirementsDemoPath = pathname.startsWith("/requirements-diagnosis/demo-") ||
    pathname.startsWith("/agent-team/requirements-diagnosis/demo-");
  const isRequirementsAssetPath = pathname.startsWith("/requirements-diagnosis/avatars/") ||
    pathname.startsWith("/agent-team/requirements-diagnosis/avatars/");
  const isDeepDiagnosisDemoPath = pathname.startsWith("/deep-diagnosis/agui-demo") ||
    pathname.startsWith("/agent-team/deep-diagnosis/agui-demo");

  // 样品墙是静态设计预览，不读用户数据；跳过登录保护，避免污染正式功能验收。
  if (isRequirementsDemoPath || isRequirementsAssetPath || isDeepDiagnosisDemoPath) {
    return NextResponse.next();
  }

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

  const loginUrl = buildRequestUrl(request, "/agent-team/login");
  loginUrl.searchParams.set("redirect_url", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/agent-team/admin/:path*",
    "/agent-team/credits/:path*",
    "/agent-team/deep-diagnosis/:path*",
    "/agent-team/requirements-diagnosis/:path*",
    "/agent-team/settings/:path*",
    "/agent-team/treasure/hunt/:path*",
    "/credits/:path*",
    "/deep-diagnosis/:path*",
    "/requirements-diagnosis/:path*",
    "/settings/:path*",
    "/treasure/hunt/:path*",
  ],
};
