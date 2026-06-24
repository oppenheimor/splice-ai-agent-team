import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { grantCreditsToUsername } from "@/lib/credits/service";

export async function POST(request: NextRequest) {
  const adminUser = await getCurrentUser();

  if (!adminUser) {
    return NextResponse.redirect(
      new URL("/agent-team/login?redirect_url=/admin/credits", request.url),
    );
  }

  const formData = await request.formData();
  const targetUsername = String(formData.get("targetUsername") || "");
  const credits = Number(String(formData.get("credits") || "").trim());
  const reason = String(formData.get("reason") || "");

  try {
    const result = await grantCreditsToUsername({
      targetUsername,
      credits,
      reason,
      adminUser,
    });

    return NextResponse.redirect(
      buildAdminCreditsUrl(
        request,
        "success",
        `已给 ${result.user.username} 增加 ${credits} 积分`,
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.redirect(buildAdminCreditsUrl(request, "error", message));
  }
}

function buildAdminCreditsUrl(request: NextRequest, key: "success" | "error", value: string) {
  const url = new URL("/agent-team/admin/credits", request.url);
  url.searchParams.set(key, value);
  return url;
}
