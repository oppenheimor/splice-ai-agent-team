import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { prisma } from "@/lib/db/prisma";

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
};

export type LoginSession = {
  sessionId: string;
  expiresAt: Date;
  user: AuthUser;
};

function toAuthUser(user: { id: string; username: string; name: string | null }): AuthUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.name ?? user.username,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }

  return toAuthUser(session.user);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
