import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { prisma } from "@/lib/db/prisma";

const scryptAsync = promisify(scrypt);
const PASSWORD_KEY_LENGTH = 64;

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

function createSessionId(): string {
  return randomBytes(32).toString("base64url");
}

function getSessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{2,31}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${key.toString("base64url")}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function loginOrRegisterWithPassword(input: {
  username: string;
  password: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<LoginSession> {
  const username = normalizeUsername(input.username);

  if (!isValidUsername(username)) {
    throw new Error("INVALID_USERNAME");
  }

  if (!isValidPassword(input.password)) {
    throw new Error("INVALID_PASSWORD");
  }

  let user = await prisma.user.findUnique({ where: { username } });

  if (user) {
    const passwordMatches = await verifyPassword(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new Error("INVALID_CREDENTIALS");
    }
  } else {
    user = await prisma.user.create({
      data: {
        username,
        passwordHash: await hashPassword(input.password),
        name: username,
      },
    });
  }

  const session = await prisma.session.create({
    data: {
      id: createSessionId(),
      userId: user.id,
      expiresAt: getSessionExpiresAt(),
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    },
  });

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    user: toAuthUser(user),
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

export async function revokeSession(sessionId: string | undefined): Promise<void> {
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
