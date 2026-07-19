import { notFound } from "next/navigation";
import { WishAdminDetail } from "@/components/wish-creator/admin/WishAdminDetail";
import { requireUser } from "@/lib/auth/session";
import { getWishAdminDetail } from "@/lib/wish-intake/admin";

export const dynamic = "force-dynamic";

export default async function WishAdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  let wish: Awaited<ReturnType<typeof getWishAdminDetail>>;

  try {
    wish = await getWishAdminDetail(user, id);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return <main className="grid min-h-screen place-items-center bg-[#090d0b] text-white">无权访问愿望后台。</main>;
    }
    throw error;
  }

  if (!wish) notFound();
  return <WishAdminDetail wish={wish} />;
}
