import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { getCurrentUser } from "@/lib/auth/session";
import { recordTreasureAnalyticsEvent } from "@/lib/analytics/treasure-hunt";
import { csrfErrorResponse, validateCsrfRequest } from "@/lib/security/csrf";

export const runtime = "nodejs";

type AnalyticsRequestBody = {
  type?: "page_view" | "click";
  pagePath?: string;
  target?: string;
  visitorId?: string;
  conversationId?: string;
  payload?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  let input: AnalyticsRequestBody;

  try {
    input = (await request.json()) as AnalyticsRequestBody;
  } catch {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  if (!(await validateCsrfRequest(request, { jsonBody: input }))) {
    return csrfErrorResponse();
  }

  if (!input.type || !["page_view", "click"].includes(input.type) || !input.pagePath) {
    return NextResponse.json({ error: "埋点参数不完整。" }, { status: 400 });
  }

  await recordTreasureAnalyticsEvent({
    userId: user.id,
    sessionId: request.cookies.get(AUTH_COOKIE_NAME)?.value,
    visitorId: input.visitorId,
    conversationId: input.conversationId,
    type: input.type,
    pagePath: input.pagePath,
    target: input.target,
    payload: input.payload ? JSON.parse(JSON.stringify(input.payload)) : undefined,
    userAgent: request.headers.get("user-agent"),
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true });
}
