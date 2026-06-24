import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { prisma } from "@/lib/db/prisma";

const scryptAsync = promisify(scrypt);
const PASSWORD_KEY_LENGTH = 64;
const AUTH_RETURN_PATH_HEADER = "x-agent-team-auth-return-path";
type SessionUser = { id: string; username: string; name: string | null };
type SessionWriteClient = Pick<typeof prisma, "session">;

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

function toAuthUser(user: SessionUser): AuthUser {
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

export async function createLoginSessionForUser(
  user: SessionUser,
  input: {
    userAgent?: string | null;
    ipAddress?: string | null;
    tx?: SessionWriteClient;
  },
): Promise<LoginSession> {
  const db = input.tx ?? prisma;
  const now = new Date();

  await db.session.deleteMany({
    where: {
      userId: user.id,
      expiresAt: {
        lte: now,
      },
    },
  });

  const session = await db.session.create({
    data: {
      id: createSessionId(),
      userId: user.id,
      expiresAt: new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000),
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

/**
 * 密码加密
 * @param password 原始密码
 * @returns 哈希后的密码
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${key.toString("base64url")}`;
}

/**
 * 密码校验  scrypt 算法、动态加盐、防止时序攻击
 * @param password 用户输入的密码
 * @param storedHash 数据库中存储的哈希后的密码
 * @returns
 */
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

  return createLoginSessionForUser(user, {
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  });
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

export async function requireUser(returnPath?: string): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(await buildLoginRedirectPath(returnPath));
  }

  return user;
}

async function buildLoginRedirectPath(explicitReturnPath?: string): Promise<string> {
  const explicitSafeReturnPath = sanitizeReturnPath(explicitReturnPath);

  if (explicitSafeReturnPath) {
    return `/login?redirect_url=${encodeURIComponent(explicitSafeReturnPath)}`;
  }

  const headerStore = await headers();
  const returnPath = sanitizeReturnPath(headerStore.get(AUTH_RETURN_PATH_HEADER));

  if (!returnPath) {
    return "/login";
  }

  return `/login?redirect_url=${encodeURIComponent(returnPath)}`;
}

function sanitizeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "";
  }

  // 登录页自身不能作为登录后的回跳目标，避免形成重定向循环。
  if (value === "/agent-team/login" || value.startsWith("/agent-team/login?") || value === "/login" || value.startsWith("/login?")) {
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
