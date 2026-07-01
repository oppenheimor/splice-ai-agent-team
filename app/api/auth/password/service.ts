import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Prisma } from "@prisma/client";
import { createAuthSession } from "@/app/api/auth/session";
import type { LoginSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const scryptAsync = promisify(scrypt);
const PASSWORD_KEY_LENGTH = 64;

type PasswordAuthInput = {
  username: string;
  password: string;
  userAgent?: string | null;
  ipAddress?: string | null;
};

function trimPasswordAuthUsername(username: string): string {
  return username.trim();
}

function isValidPasswordAuthUsername(username: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_]{2,31}$/.test(username);
}

function isValidPasswordAuthPassword(password: string): boolean {
  return /^[A-Za-z0-9_]{6,128}$/.test(password);
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

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError
    && error.code === "P2002";
}

export async function loginWithPassword(input: PasswordAuthInput): Promise<LoginSession> {
  const username = trimPasswordAuthUsername(input.username);

  if (!isValidPasswordAuthUsername(username)) {
    throw new Error("INVALID_USERNAME");
  }

  if (!isValidPasswordAuthPassword(input.password)) {
    throw new Error("INVALID_PASSWORD");
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return createAuthSession({
    user,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
  });
}

export async function registerWithPassword(input: PasswordAuthInput): Promise<LoginSession> {
  const username = trimPasswordAuthUsername(input.username);

  if (!isValidPasswordAuthUsername(username)) {
    throw new Error("INVALID_USERNAME");
  }

  if (!isValidPasswordAuthPassword(input.password)) {
    throw new Error("INVALID_PASSWORD");
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });

  if (existingUser) {
    throw new Error("USERNAME_TAKEN");
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: await hashPassword(input.password),
        name: username,
      },
    });

    return createAuthSession({
      user,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });
  } catch (error) {
    // 并发注册同一用户名时，唯一索引仍然是最终一致性防线。
    if (isUniqueConstraintError(error)) {
      throw new Error("USERNAME_TAKEN");
    }

    throw error;
  }
}
