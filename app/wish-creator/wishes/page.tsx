import { WishListView } from "@/components/wish-creator/wish/WishListView";
import { requireUser } from "@/lib/auth/session";
import { listWishItems } from "@/lib/wish-intake/service";

export const dynamic = "force-dynamic";

export default async function MyWishesPage() {
  const user = await requireUser();
  const items = await listWishItems(user.id);
  return <WishListView items={items} />;
}
