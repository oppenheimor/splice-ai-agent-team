import {
  AUTH_LOGIN_ERROR_MESSAGES,
  AUTH_LOGIN_FALLBACK_ERROR_MESSAGE,
  type AuthLoginErrorCode,
} from "@/constants/auth-errors";

function isAuthLoginErrorCode(error: string): error is AuthLoginErrorCode {
  return Object.hasOwn(AUTH_LOGIN_ERROR_MESSAGES, error);
}

export function getAuthLoginErrorMessage(error?: string): string {
  if (!error) return "";

  if (isAuthLoginErrorCode(error)) {
    return AUTH_LOGIN_ERROR_MESSAGES[error];
  }

  return AUTH_LOGIN_FALLBACK_ERROR_MESSAGE;
}
