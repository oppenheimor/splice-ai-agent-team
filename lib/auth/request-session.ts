import { AUTH_COOKIE_NAME } from "./cookies";
import { prisma } from "../db/prisma";
import type { AuthUser } from "./session";

/**
 * 给 Next 之外的可信服务端运行时复用现有登录态校验。
 * Eve 的 AuthFn 只能拿到标准 Request，因此这里不能依赖 next/headers。
 */
export async function getRequestUser(request: Request): Promise<AuthUser | null> {
  const sessionId = readCookie(request.headers.get("cookie"), AUTH_COOKIE_NAME);
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    username: session.user.username,
    displayName: session.user.name ?? session.user.username,
  };
}

function readCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  for (const entry of cookieHeader.split(";")) {
    const separatorIndex = entry.indexOf("=");
    if (separatorIndex < 0) continue;
    if (entry.slice(0, separatorIndex).trim() !== name) continue;

    const value = entry.slice(separatorIndex + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return undefined;
}
