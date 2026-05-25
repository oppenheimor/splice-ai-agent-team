import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getTreasureAnalyticsSummary } from "@/lib/analytics/treasure-hunt";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  return NextResponse.json(await getTreasureAnalyticsSummary());
}
