import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { APP_BASE_PATH } from "@/utils/routing";

// 要放行的路径
const PUBLIC_APP_PATHS = [
  "/login",
  "/api/auth/password/login",
  "/api/auth/password/register",
];

export const config = {
  // 配置要走 proxy 的路径，排除静态资源
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json)).*)",
  ],
};

function isPublicAppPath(appPath: string): boolean {
  return PUBLIC_APP_PATHS.some((path) => appPath === path || appPath.startsWith(`${path}/`));
}

export function proxy(request: NextRequest) {
  // Next 在 proxy 中暴露的是去掉 basePath 后的 app path。
  const appPath = request.nextUrl.pathname;

  if (isPublicAppPath(appPath)) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (sessionId) {
    return NextResponse.next();
  }

  // 在登录的 url 上带上登录成功后要重定向的源地址
  const loginUrl = new URL(`${APP_BASE_PATH}/login`, request.url);
  loginUrl.searchParams.set("redirect_url", `${appPath}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}
