import { randomBytes } from "node:crypto";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/cookies";
import type { LoginSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function createSessionId(): string {
  return randomBytes(32).toString("base64url");
}

function getSessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export async function createAuthSession(input: {
  user: { id: string; username: string; name: string | null };
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<LoginSession> {
  const session = await prisma.session.create({
    data: {
      id: createSessionId(),
      userId: input.user.id,
      expiresAt: getSessionExpiresAt(),
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    },
  });

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: input.user.id,
      username: input.user.username,
      displayName: input.user.name ?? input.user.username,
    },
  };
}
