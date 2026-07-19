import { notFound } from "next/navigation";
import { WishDetailView } from "@/components/wish-creator/wish/WishDetailView";
import { requireUser } from "@/lib/auth/session";
import { getVisibleWish } from "@/lib/wish-intake/service";

export const dynamic = "force-dynamic";

export default async function WishDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const wish = await getVisibleWish(user.id, id);
  if (!wish) notFound();
  return <WishDetailView wish={wish} />;
}
