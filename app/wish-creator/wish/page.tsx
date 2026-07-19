import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createId } from "@/lib/agent-team/id";
import { WISH_INTAKE_AGENT_ID } from "@/constants/wish-intake";

export default async function NewWishPage() {
  await requireUser();
  redirect(`/wish-creator/wish/session/${createId(WISH_INTAKE_AGENT_ID)}`);
}
