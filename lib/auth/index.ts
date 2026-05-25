export {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  shouldUseSecureAuthCookie,
} from "./cookies";
export {
  getCurrentUser,
  isValidPassword,
  isValidUsername,
  loginOrRegisterWithPassword,
  normalizeUsername,
  requireUser,
  revokeSession,
} from "./session";
export type { AuthUser, LoginSession } from "./session";
