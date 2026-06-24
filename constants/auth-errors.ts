export const AUTH_LOGIN_ERROR_CODES = {
  missingCredentials: "missing_credentials",
  invalidUsername: "invalid_username",
  invalidPassword: "invalid_password",
  passwordMismatch: "password_mismatch",
  invalidCredentials: "invalid_credentials",
  usernameTaken: "username_taken",
} as const;

export const AUTH_LOGIN_ERROR_MESSAGES = {
  [AUTH_LOGIN_ERROR_CODES.missingCredentials]: "请输入用户名和密码。",
  [AUTH_LOGIN_ERROR_CODES.invalidUsername]: "用户名格式不正确（仅支持字母、数字及下划线）",
  [AUTH_LOGIN_ERROR_CODES.invalidPassword]: "密码长度至少需要 6 位，且仅支持字母、数字及下划线",
  [AUTH_LOGIN_ERROR_CODES.passwordMismatch]: "两次输入的密码不一致",
  [AUTH_LOGIN_ERROR_CODES.invalidCredentials]: "用户名或密码不正确，请重新输入",
  [AUTH_LOGIN_ERROR_CODES.usernameTaken]: "用户名已被占用",
} satisfies Record<AuthLoginErrorCode, string>;

export const AUTH_LOGIN_FALLBACK_ERROR_MESSAGE = "登录失败，请稍后再试。";

export type AuthLoginErrorCode =
  (typeof AUTH_LOGIN_ERROR_CODES)[keyof typeof AUTH_LOGIN_ERROR_CODES];
