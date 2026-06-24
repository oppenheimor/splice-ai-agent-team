import { createHash, randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import {
  SMS_CODE_IP_HOURLY_LIMIT,
  SMS_CODE_LENGTH,
  SMS_CODE_MAX_ATTEMPTS,
  SMS_CODE_RESEND_COOLDOWN_SECONDS,
  SMS_CODE_TTL_SECONDS,
} from "@/constants/auth";
import { prisma } from "@/lib/db/prisma";
import { createLoginSessionForUser, type LoginSession } from "@/lib/auth/session";
import { sendSmsCode } from "@/lib/auth/sms-provider";
import { isValidPhone, normalizePhone } from "@/utils/phone";

const scryptAsync = promisify(scrypt);
const CODE_HASH_KEY_LENGTH = 32;

type VerificationCodeRecord = {
  id: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
};

function createNumericCode(): string {
  const max = 10 ** SMS_CODE_LENGTH;
  return randomInt(0, max).toString().padStart(SMS_CODE_LENGTH, "0");
}

async function hashCode(phone: string, code: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = (await scryptAsync(`${phone}:${code}`, salt, CODE_HASH_KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${key.toString("base64url")}`;
}

async function verifyCode(phone: string, code: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = (await scryptAsync(`${phone}:${code}`, salt, expected.length)) as Buffer;

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createSmsUsername(phone: string): string {
  const phoneDigest = createHash("sha256").update(phone).digest("hex").slice(0, 20);
  return `sms_${phoneDigest}`;
}

function toCount(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseInt(value, 10);
  return 0;
}

export async function requestSmsCode(input: {
  phone: string;
  ipAddress?: string | null;
}): Promise<void> {
  const phone = normalizePhone(input.phone);

  if (!isValidPhone(phone)) {
    throw new Error("INVALID_PHONE");
  }

  const now = new Date();
  const code = createNumericCode();
  const codeHash = await hashCode(phone, code);
  const ipAddress = input.ipAddress?.trim() || null;

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`DELETE FROM "verification_codes" WHERE "expires_at" < ${now}`;
    await tx.$executeRaw`
      DELETE FROM "sms_send_logs"
      WHERE "created_at" < ${new Date(now.getTime() - 60 * 60 * 1000)}
    `;

    // 用事务级 advisory lock 串行化同一手机号的发送检查，避免并发请求同时绕过 60 秒限制。
    await tx.$queryRaw`SELECT 1 AS "locked" FROM pg_advisory_xact_lock(hashtext(${`sms-phone:${phone}`}))`;

    const recentPhoneCodeRows = await tx.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM "sms_send_logs"
        WHERE "phone" = ${phone}
          AND "created_at" > ${new Date(now.getTime() - SMS_CODE_RESEND_COOLDOWN_SECONDS * 1000)}
      ) AS "exists"
    `;

    if (recentPhoneCodeRows[0]?.exists) {
      throw new Error("PHONE_RATE_LIMITED");
    }

    if (ipAddress) {
      const ipCodeCountRows = await tx.$queryRaw<Array<{ count: unknown }>>`
        SELECT COUNT(*) AS "count"
        FROM "sms_send_logs"
        WHERE "ip_address" = ${ipAddress}
          AND "created_at" > ${new Date(now.getTime() - 60 * 60 * 1000)}
      `;

      if (toCount(ipCodeCountRows[0]?.count) >= SMS_CODE_IP_HOURLY_LIMIT) {
        throw new Error("IP_RATE_LIMITED");
      }
    }

    await tx.$executeRaw`
      UPDATE "verification_codes"
      SET "consumed_at" = ${now}, "updated_at" = ${now}
      WHERE "phone" = ${phone}
        AND "consumed_at" IS NULL
    `;

    await tx.$executeRaw`
      INSERT INTO "verification_codes"
        ("id", "phone", "code", "ip_address", "expires_at", "created_at", "updated_at")
      VALUES
        (${randomUUID()}, ${phone}, ${codeHash}, ${ipAddress}, ${new Date(now.getTime() + SMS_CODE_TTL_SECONDS * 1000)}, ${now}, ${now})
    `;

    await tx.$executeRaw`
      INSERT INTO "sms_send_logs" ("id", "phone", "ip_address", "created_at")
      VALUES (${randomUUID()}, ${phone}, ${ipAddress}, ${now})
    `;
  });

  await sendSmsCode(phone, code);
}

export async function loginOrRegisterWithSmsCode(input: {
  phone: string;
  code: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<LoginSession> {
  const phone = normalizePhone(input.phone);
  const code = input.code.trim();

  if (!isValidPhone(phone)) {
    throw new Error("INVALID_PHONE");
  }

  if (!new RegExp(`^\\d{${SMS_CODE_LENGTH}}$`).test(code)) {
    throw new Error("INVALID_CODE");
  }

  const now = new Date();
  const verificationCodeRows = await prisma.$queryRaw<VerificationCodeRecord[]>`
    SELECT
      "id",
      "code" AS "codeHash",
      "attempts",
      "expires_at" AS "expiresAt"
    FROM "verification_codes"
    WHERE "phone" = ${phone}
      AND "consumed_at" IS NULL
    ORDER BY "created_at" DESC
    LIMIT 1
  `;
  const verificationCode = verificationCodeRows[0];

  if (!verificationCode) {
    throw new Error("INVALID_CODE");
  }

  if (verificationCode.expiresAt <= now) {
    await prisma.$executeRaw`DELETE FROM "verification_codes" WHERE "id" = ${verificationCode.id}`;
    throw new Error("CODE_EXPIRED");
  }

  if (verificationCode.attempts >= SMS_CODE_MAX_ATTEMPTS) {
    throw new Error("TOO_MANY_CODE_ATTEMPTS");
  }

  const isCodeValid = await verifyCode(phone, code, verificationCode.codeHash);

  if (!isCodeValid) {
    await prisma.$executeRaw`
      UPDATE "verification_codes"
      SET "attempts" = "attempts" + 1, "updated_at" = ${now}
      WHERE "id" = ${verificationCode.id}
    `;
    throw new Error("INVALID_CODE");
  }

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "verification_codes"
      SET "consumed_at" = ${now}, "updated_at" = ${now}
      WHERE "id" = ${verificationCode.id}
    `;

    const user = await tx.user.upsert({
      where: {
        phone,
      },
      update: {},
      create: {
        phone,
        username: createSmsUsername(phone),
        passwordHash: "sms-login-disabled",
        name: phone,
      },
    });

    return createLoginSessionForUser(user, {
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      tx,
    });
  });
}
