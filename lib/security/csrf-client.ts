"use client";

import {
  CSRF_FORM_FIELD_NAME,
  CSRF_HEADER_NAME,
  CSRF_TOKEN_COOKIE_NAME,
} from "@/lib/security/csrf-constants";

export function getBrowserCsrfToken(): string {
  if (typeof document === "undefined") {
    return "";
  }

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${CSRF_TOKEN_COOKIE_NAME}=`));

  return cookie ? decodeURIComponent(cookie.slice(CSRF_TOKEN_COOKIE_NAME.length + 1)) : "";
}

export function appendCsrfToken(formData: FormData): FormData {
  const token = getBrowserCsrfToken();

  if (token) {
    formData.set(CSRF_FORM_FIELD_NAME, token);
  }

  return formData;
}

export function createJsonBodyWithCsrf(payload: Record<string, unknown>): string {
  return JSON.stringify({
    ...payload,
    [CSRF_FORM_FIELD_NAME]: getBrowserCsrfToken(),
  });
}

export function csrfFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getBrowserCsrfToken();

  if (token) {
    headers.set(CSRF_HEADER_NAME, token);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
