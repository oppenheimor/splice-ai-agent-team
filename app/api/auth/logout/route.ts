import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { prisma } from "@/lib/db/prisma";

/**
 * 注销认证 session
 * @param sessionId - 认证 session ID
 */
async function revokeSession(sessionId: string | undefined): Promise<void> {
  if (!sessionId) {
    return;
  }

  await prisma.session
    .update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    })
    .catch(() => undefined);
}

export async function POST(request: NextRequest) {
  await revokeSession(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  const response = NextResponse.redirect(
    new URL("/agent-team/login", request.url),
  );

  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
