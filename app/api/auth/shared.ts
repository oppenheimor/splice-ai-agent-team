import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  shouldUseSecureAuthCookie,
} from "@/lib/auth/cookies";
import { ACCOUNT_AUTH_MODES, type AccountAuthMode } from "@/constants/auth";
import { type AuthLoginErrorCode } from "@/constants/auth-errors";
import type { LoginSession } from "@/lib/auth/session";
import { APP_BASE_PATH } from "@/utils/routing";

/**
 * 获取请求客户端信息
 * @param request - 请求对象
 * @returns 用户代理和 IP 地址
 */
export function getAuthRequestClientInfo(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent"),
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  };
}

/**
 * 构建登录错误页面 URL
 * @param request - 请求对象
 * @param error - 错误代码
 * @param nextPath - 重定向路径
 * @param accountMode - 认证模式
 * @returns 登录错误页面 URL
 */
export function buildAuthErrorUrl(
  request: NextRequest,
  error: AuthLoginErrorCode,
  nextPath: string,
  accountMode?: AccountAuthMode,
) {
  const url = new URL(`${APP_BASE_PATH}/login`, request.url);
  url.searchParams.set("error", error);
  if (nextPath) {
    url.searchParams.set("redirect_url", nextPath);
  }
  if (accountMode === ACCOUNT_AUTH_MODES.register) {
    url.searchParams.set("mode", ACCOUNT_AUTH_MODES.register);
  }
  return url;
}

/**
 * 重定向到登录错误页面
 * @param request - 请求对象
 * @param error - 错误代码
 * @param nextPath - 重定向路径
 * @param accountMode - 认证模式
 * @returns 重定向响应
 */
export function redirectToAuthError(
  request: NextRequest,
  error: AuthLoginErrorCode,
  nextPath: string,
  accountMode?: AccountAuthMode,
) {
  return NextResponse.redirect(
    buildAuthErrorUrl(request, error, nextPath, accountMode),
  );
}

/**
 * 重定向到登录成功后的页面，并设置认证 cookie
 * @param request - 请求对象
 * @param session - 认证 session
 * @param nextPath - 重定向路径
 * @returns 重定向响应
 */
export function redirectWithAuthSession(
  request: NextRequest,
  session: LoginSession,
  nextPath: string,
) {
  const response = NextResponse.redirect(
    new URL(`${APP_BASE_PATH}${nextPath || "/"}`, request.url),
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: session.sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureAuthCookie(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
