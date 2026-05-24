import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createDemoUser, encodeDemoUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  console.log(formData);
  const identifier = String(formData.get("identifier") ?? "").trim();

  console.log(identifier);

  if (!identifier) {
    return NextResponse.redirect(
      new URL("/agent-team/login?error=missing_identifier", request.url),
    );
  }

  const user = createDemoUser(identifier);

  // TODO: 这里重定向写死了需求诊断
  const response = NextResponse.redirect(
    new URL("/agent-team/requirements-diagnosis", request.url),
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: encodeDemoUser(user),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
