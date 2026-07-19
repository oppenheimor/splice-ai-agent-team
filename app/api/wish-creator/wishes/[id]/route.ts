import { getCurrentUser } from "@/lib/auth/session";
import { removeWishFromUserView } from "@/lib/wish-intake/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "未登录。" }, { status: 401 });
  const { id } = await context.params;
  const removed = await removeWishFromUserView(user.id, id);
  return removed
    ? Response.json({ ok: true })
    : Response.json({ error: "愿望不存在。" }, { status: 404 });
}
