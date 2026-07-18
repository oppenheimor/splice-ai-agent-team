export const AUTH_COOKIE_NAME = "splice_session_id";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function shouldUseSecureAuthCookie(): boolean {
  return process.env.NODE_ENV === "production";
}
