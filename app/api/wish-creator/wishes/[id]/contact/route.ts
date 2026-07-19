import { getCurrentUser } from "@/lib/auth/session";
import { recordWishContactClick } from "@/lib/wish-intake/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "未登录。" }, { status: 401 });
  const { id } = await context.params;
  const recorded = await recordWishContactClick(user.id, id);
  return recorded
    ? Response.json({ ok: true })
    : Response.json({ error: "愿望不存在。" }, { status: 404 });
}
