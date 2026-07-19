import { getCurrentUser } from "@/lib/auth/session";
import { createWishSummaryDraft } from "@/lib/wish-intake/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "未登录。" }, { status: 401 });

  try {
    const input = await request.json() as { conversationId?: string };
    if (!input.conversationId) {
      return Response.json({ error: "缺少 conversationId。" }, { status: 400 });
    }
    const summary = await createWishSummaryDraft(user.id, input.conversationId);
    return Response.json({ summary });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "整理愿望失败。" },
      { status: 400 },
    );
  }
}
