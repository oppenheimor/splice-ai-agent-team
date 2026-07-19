import { getCurrentUser } from "@/lib/auth/session";
import { submitWish } from "@/lib/wish-intake/service";
import type { WishSummaryInput } from "@/lib/wish-intake/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "未登录。" }, { status: 401 });

  try {
    const input = await request.json() as { conversationId?: string; summary?: WishSummaryInput };
    if (!input.conversationId || !input.summary) {
      return Response.json({ error: "愿望内容不完整。" }, { status: 400 });
    }
    const wish = await submitWish({
      userId: user.id,
      conversationId: input.conversationId,
      summary: input.summary,
    });
    return Response.json({ wish }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "提交愿望失败。" },
      { status: 400 },
    );
  }
}
