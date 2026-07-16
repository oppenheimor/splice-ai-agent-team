import { WishCreatorLanding } from "@/components/wish-creator/WishCreatorLanding";
import { requireUser } from "@/lib/auth/session";

export default async function WishCreatorPage() {
  await requireUser();
  return <WishCreatorLanding />;
}
