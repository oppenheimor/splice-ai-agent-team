import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  shouldUseSecureAuthCookie,
} from "@/lib/auth/cookies";
import { loginOrRegisterWithPassword } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? ""));

  if (!username || !password) {
    return NextResponse.redirect(
      buildLoginUrl(request, "missing_credentials", nextPath),
    );
  }

  let session;

  try {
    session = await loginOrRegisterWithPassword({
      username,
      password,
      userAgent: request.headers.get("user-agent"),
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_USERNAME") {
      return NextResponse.redirect(
        buildLoginUrl(request, "invalid_username", nextPath),
      );
    }

    if (error instanceof Error && error.message === "INVALID_PASSWORD") {
      return NextResponse.redirect(
        buildLoginUrl(request, "invalid_password", nextPath),
      );
    }

    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return NextResponse.redirect(
        buildLoginUrl(request, "invalid_credentials", nextPath),
      );
    }

    throw error;
  }

  const response = NextResponse.redirect(toBasePathUrl(nextPath || "/treasure/hunt"));

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

function buildLoginUrl(_request: NextRequest, error: string, nextPath: string) {
  const url = new URL("/agent-team/login", "http://localhost");
  url.searchParams.set("error", error);
  if (nextPath) {
    url.searchParams.set("next", nextPath);
  }
  return `${url.pathname}${url.search}`;
}

function sanitizeNextPath(value: string): string {
  if (!value.startsWith("/")) {
    return "";
  }

  if (value.startsWith("//") || value.includes("://")) {
    return "";
  }

  return value;
}

function toBasePathUrl(pathname: string): string {
  return pathname.startsWith("/agent-team") ? pathname : `/agent-team${pathname}`;
}
