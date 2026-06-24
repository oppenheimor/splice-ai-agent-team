import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  shouldUseSecureAuthCookie,
} from "@/lib/auth/cookies";
import { loginOrRegisterWithSmsCode } from "@/lib/auth/sms-code";
import { getClientIp } from "@/lib/http/client-ip";
import { buildRequestUrl } from "@/lib/http/request-origin";
import { setCsrfCookies, getOrCreateCsrfSecret, validateCsrfRequest } from "@/lib/security/csrf";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const phone = String(formData.get("phone") ?? "");

  if (!(await validateCsrfRequest(request, { formData }))) {
    return NextResponse.redirect(buildLoginUrl(request, "csrf_token_invalid", "", phone), 303);
  }

  const code = String(formData.get("code") ?? "");
  const nextPath = sanitizeNextPath(
    String(formData.get("redirect_url") ?? formData.get("next") ?? ""),
  );

  let session;

  try {
    session = await loginOrRegisterWithSmsCode({
      phone,
      code,
      userAgent: request.headers.get("user-agent"),
      ipAddress: getClientIp(request),
    });
  } catch (error) {
    if (error instanceof Error) {
      const errorCode = mapSmsLoginError(error.message);

      if (errorCode) {
        return NextResponse.redirect(
          buildLoginUrl(request, errorCode, nextPath, phone),
          303,
        );
      }
    }

    throw error;
  }

  const response = NextResponse.redirect(
    toBasePathUrl(request, nextPath || "/treasure/hunt"),
    303,
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
  await setCsrfCookies(response, getOrCreateCsrfSecret(request));

  return response;
}

function mapSmsLoginError(errorMessage: string): string {
  const messages: Record<string, string> = {
    INVALID_PHONE: "invalid_phone",
    INVALID_CODE: "invalid_code",
    CODE_EXPIRED: "code_expired",
    TOO_MANY_CODE_ATTEMPTS: "too_many_code_attempts",
  };

  return messages[errorMessage] ?? "";
}

function buildLoginUrl(request: NextRequest, error: string, nextPath: string, phone: string) {
  const url = buildRequestUrl(request, "/agent-team/login");
  url.searchParams.set("mode", "sms");
  url.searchParams.set("error", error);
  if (nextPath) {
    url.searchParams.set("redirect_url", nextPath);
  }
  if (phone) {
    url.searchParams.set("phone", phone);
  }
  return url;
}

function sanitizeNextPath(value: string): string {
  if (!value.startsWith("/")) {
    return "";
  }

  if (value.startsWith("//") || value.includes("://")) {
    return "";
  }

  if (value === "/agent-team") {
    return "/";
  }

  if (value.startsWith("/agent-team/")) {
    return value.slice("/agent-team".length);
  }

  return value;
}

function toBasePathUrl(request: NextRequest, pathname: string): URL {
  return buildRequestUrl(
    request,
    pathname.startsWith("/agent-team") ? pathname : `/agent-team${pathname}`,
  );
}
