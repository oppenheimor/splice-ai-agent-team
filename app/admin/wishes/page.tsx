import { WishAdminDashboard } from "@/components/wish-creator/admin/WishAdminDashboard";
import { requireUser } from "@/lib/auth/session";
import { getWishAdminDashboard, isWishCapabilityGap } from "@/lib/wish-intake/admin";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ query?: string; capabilityGap?: string }>;

export default async function WishAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  let dashboard: Awaited<ReturnType<typeof getWishAdminDashboard>>;

  try {
    dashboard = await getWishAdminDashboard(user, {
      query: params.query,
      capabilityGap: isWishCapabilityGap(params.capabilityGap) ? params.capabilityGap : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return <main className="grid min-h-screen place-items-center bg-[#090d0b] text-white">无权访问愿望后台。</main>;
    }
    throw error;
  }

  return <WishAdminDashboard dashboard={dashboard} filters={params} username={user.username} />;
}
