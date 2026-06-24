import { NextResponse, type NextRequest } from "next/server";
import { shouldUseSecureAuthCookie } from "@/lib/auth/cookies";
import {
  CSRF_FORM_FIELD_NAME,
  CSRF_HEADER_NAME,
  CSRF_SECRET_COOKIE_NAME,
  CSRF_TOKEN_COOKIE_NAME,
} from "@/lib/security/csrf-constants";
export {
  CSRF_FORM_FIELD_NAME,
  CSRF_HEADER_NAME,
  CSRF_REQUEST_HEADER_NAME,
  CSRF_SECRET_COOKIE_NAME,
  CSRF_TOKEN_COOKIE_NAME,
} from "@/lib/security/csrf-constants";

const CSRF_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const CSRF_SIGNATURE_SECRET = process.env.CSRF_SECRET || process.env.AUTH_SECRET || "splice-ai-agent-team-dev-csrf-secret";

type CookieWriter = {
  cookies: Pick<NextResponse["cookies"], "set">;
};

function createSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function signSecret(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(CSRF_SIGNATURE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(secret));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createCsrfToken(secret: string): Promise<string> {
  return `${secret}.${await signSecret(secret)}`;
}

function getCookieOptions(httpOnly: boolean) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure: shouldUseSecureAuthCookie(),
    path: "/",
    maxAge: CSRF_TOKEN_MAX_AGE_SECONDS,
  };
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const [tokenSecret, signature, extra] = token.split(".");

  if (!tokenSecret || !signature || extra || tokenSecret !== secret) {
    return false;
  }

  return safeEqual(signature, await signSecret(secret));
}

export function getOrCreateCsrfSecret(request: NextRequest): string {
  return request.cookies.get(CSRF_SECRET_COOKIE_NAME)?.value || createSecret();
}

export async function setCsrfCookies(response: CookieWriter, secret: string): Promise<void> {
  response.cookies.set({
    name: CSRF_SECRET_COOKIE_NAME,
    value: secret,
    ...getCookieOptions(true),
  });

  response.cookies.set({
    name: CSRF_TOKEN_COOKIE_NAME,
    value: await createCsrfToken(secret),
    ...getCookieOptions(false),
  });
}

export async function validateCsrfRequest(
  request: NextRequest,
  input?: { formData?: FormData; jsonBody?: unknown },
): Promise<boolean> {
  const secret = request.cookies.get(CSRF_SECRET_COOKIE_NAME)?.value;

  if (!secret) {
    return false;
  }

  const token = request.headers.get(CSRF_HEADER_NAME) ||
    getFormToken(input?.formData) ||
    getJsonToken(input?.jsonBody);

  if (!token) {
    return false;
  }

  return verifyToken(token, secret);
}

function getFormToken(formData: FormData | undefined): string {
  const token = formData?.get(CSRF_FORM_FIELD_NAME);
  return typeof token === "string" ? token : "";
}

function getJsonToken(jsonBody: unknown): string {
  if (!jsonBody || typeof jsonBody !== "object" || Array.isArray(jsonBody)) {
    return "";
  }

  const token = (jsonBody as Record<string, unknown>)[CSRF_FORM_FIELD_NAME];
  return typeof token === "string" ? token : "";
}

export function csrfErrorResponse() {
  return NextResponse.json({ error: "csrf_token_invalid" }, { status: 403 });
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
