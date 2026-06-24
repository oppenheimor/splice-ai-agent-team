import { cookies, headers } from "next/headers";
import {
  CSRF_REQUEST_HEADER_NAME,
  CSRF_SECRET_COOKIE_NAME,
} from "@/lib/security/csrf-constants";
import { createCsrfToken } from "@/lib/security/csrf";

export async function getCsrfToken(): Promise<string> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const secret = headerStore.get(CSRF_REQUEST_HEADER_NAME) ||
    cookieStore.get(CSRF_SECRET_COOKIE_NAME)?.value ||
    "";

  return secret ? createCsrfToken(secret) : "";
}
