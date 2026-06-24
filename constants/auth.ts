export const ACCOUNT_AUTH_MODES = {
  login: "login",
  register: "register",
} as const;

export type AccountAuthMode =
  (typeof ACCOUNT_AUTH_MODES)[keyof typeof ACCOUNT_AUTH_MODES];
