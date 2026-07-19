import type { Prisma } from "@prisma/client";
import type { AuthUser } from "@/lib/auth/session";
import { WISH_ADMIN_USERNAMES_ENV, WISH_CAPABILITY_GAP_IDS } from "@/constants/wish-intake";
import { prisma } from "@/lib/db/prisma";
import { normalizeUsername } from "@/lib/users/username";
import type { WishCapabilityGapId } from "@/types/wish-intake";

export type WishAdminFilters = {
  query?: string;
  capabilityGap?: WishCapabilityGapId;
};

export function assertWishAdmin(user: AuthUser) {
  const configured = (process.env[WISH_ADMIN_USERNAMES_ENV] || process.env.CREDIT_ADMIN_USERNAMES || "")
    .split(",")
    .map(normalizeUsername)
    .filter(Boolean);

  if (configured.length > 0) {
    if (configured.includes(normalizeUsername(user.username))) return;
    throw new Error("FORBIDDEN");
  }

  if (process.env.NODE_ENV !== "production") return;
  throw new Error("FORBIDDEN");
}
export async function getWishAdminDashboard(adminUser: AuthUser, filters: WishAdminFilters = {}) {
  assertWishAdmin(adminUser);
  const query = filters.query?.trim().slice(0, 100);
  const where: Prisma.WishCreatorWishWhereInput = query
    ? {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { goal: { contains: query, mode: "insensitive" } },
        { usageScenario: { contains: query, mode: "insensitive" } },
        { currentProblem: { contains: query, mode: "insensitive" } },
        { user: { username: { contains: query, mode: "insensitive" } } },
      ],
    }
    : {};

  const [allWishes, filteredWishes] = await Promise.all([
    prisma.wishCreatorWish.findMany({
      orderBy: { submittedAt: "desc" },
      select: {
        userId: true,
        submittedAt: true,
        contactClickCount: true,
      },
    }),
    prisma.wishCreatorWish.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 200,
      include: { user: { select: { username: true, name: true } } },
    }),
  ]);

  const wishes = filters.capabilityGap
    ? filteredWishes.filter((wish) => getCapabilityGaps(wish.capabilityGaps).includes(filters.capabilityGap!))
    : filteredWishes;

  return {
    metrics: {
      totalWishes: allWishes.length,
      uniqueUsers: new Set(allWishes.map((wish) => wish.userId)).size,
      contactClicks: allWishes.reduce((total, wish) => total + wish.contactClickCount, 0),
    },
    trend: buildDailyTrend(allWishes.map((wish) => wish.submittedAt)),
    wishes: wishes.map((wish) => ({
      id: wish.id,
      title: wish.title,
      goal: wish.goal,
      capabilityGaps: getCapabilityGaps(wish.capabilityGaps),
      contactClickCount: wish.contactClickCount,
      submittedAt: wish.submittedAt,
      user: wish.user,
    })),
  };
}

export async function getWishAdminDetail(adminUser: AuthUser, wishId: string) {
  assertWishAdmin(adminUser);
  const wish = await prisma.wishCreatorWish.findUnique({
    where: { id: wishId },
    include: {
      user: { select: { username: true, name: true } },
      conversation: {
        include: {
          messages: {
            orderBy: [{ messageIndex: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!wish) return null;
  return {
    ...wish,
    capabilityGaps: getCapabilityGaps(wish.capabilityGaps),
  };
}

export function isWishCapabilityGap(value: string | undefined): value is WishCapabilityGapId {
  return Boolean(value && WISH_CAPABILITY_GAP_IDS.includes(value as WishCapabilityGapId));
}

function getCapabilityGaps(value: Prisma.JsonValue): WishCapabilityGapId[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is WishCapabilityGapId => typeof item === "string" && WISH_CAPABILITY_GAP_IDS.includes(item as WishCapabilityGapId),
  );
}

function buildDailyTrend(dates: Date[]) {
  const counts = new Map<string, number>();
  for (const date of dates) {
    const day = date.toISOString().slice(0, 10);
    counts.set(day, (counts.get(day) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));
}
