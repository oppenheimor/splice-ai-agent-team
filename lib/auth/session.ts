import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// TODO: 这个 NAME 之后需要替换
export const AUTH_COOKIE_NAME = "splice_v0_user";

export type DemoUser = {
  id: string;
  identifier: string;
  displayName: string;
};

export function createDemoUser(identifier: string): DemoUser {
  const normalizedIdentifier = identifier.trim();

  return {
    id: `demo_${Buffer.from(normalizedIdentifier).toString("base64url")}`,
    identifier: normalizedIdentifier,
    displayName: normalizedIdentifier,
  };
}

export function encodeDemoUser(user: DemoUser): string {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

export function decodeDemoUser(value: string | undefined): DemoUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<DemoUser>;

    if (
      typeof parsed.id !== "string" ||
      typeof parsed.identifier !== "string" ||
      typeof parsed.displayName !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      identifier: parsed.identifier,
      displayName: parsed.displayName,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  return decodeDemoUser(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function requireUser(): Promise<DemoUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
