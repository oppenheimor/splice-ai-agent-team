import { ACCOUNT_AUTH_MODES, type AccountAuthMode } from "@/constants/auth";

export function getAccountAuthMode(value?: string): AccountAuthMode {
  return value === ACCOUNT_AUTH_MODES.register
    ? ACCOUNT_AUTH_MODES.register
    : ACCOUNT_AUTH_MODES.login;
}

export function buildAccountModeSwitchHref(input: {
  mode: AccountAuthMode;
  searchParams?: Record<string, string | undefined>;
}): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input.searchParams ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  params.delete("error");

  if (input.mode === ACCOUNT_AUTH_MODES.register) {
    params.set("mode", ACCOUNT_AUTH_MODES.register);
  } else {
    params.delete("mode");
  }

  const query = params.toString();

  return query ? `/login?${query}` : "/login";
}
