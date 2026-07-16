import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { saveWishCreatorSnapshot } from "@/lib/wish-creator/persistence";
import type { WishCreatorSnapshot } from "@/types/wish-creator";

export const runtime = "nodejs";

const MAX_SNAPSHOT_CHARACTERS = 6_000_000;

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录。" }, { status: 401 });

  const rawBody = await request.text();
  if (rawBody.length > MAX_SNAPSHOT_CHARACTERS) {
    return NextResponse.json({ error: "会话快照过大。" }, { status: 413 });
  }

  let input: WishCreatorSnapshot;
  try {
    input = JSON.parse(rawBody) as WishCreatorSnapshot;
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  if (!Array.isArray(input.events) || !Array.isArray(input.messages) || !input.session) {
    return NextResponse.json({ error: "会话快照缺少必要字段。" }, { status: 400 });
  }

  const { id } = await context.params;
  try {
    await saveWishCreatorSnapshot({
      userId: user.id,
      conversationId: id,
      events: input.events,
      messages: input.messages,
      session: input.session,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存失败。" },
      { status: 403 },
    );
  }
}
