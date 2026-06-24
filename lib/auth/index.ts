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
  createLoginSessionForUser,
  normalizeUsername,
  requireUser,
  revokeSession,
} from "./session";
export {
  loginOrRegisterWithSmsCode,
  requestSmsCode,
} from "./sms-code";
export { isValidPhone, normalizePhone } from "@/utils/phone";
export type { AuthUser, LoginSession } from "./session";
