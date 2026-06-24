import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buildRequestUrl } from "@/lib/http/request-origin";
import { grantCreditsToUsername } from "@/lib/credits/service";
import { csrfErrorResponse, validateCsrfRequest } from "@/lib/security/csrf";

export async function POST(request: NextRequest) {
  const adminUser = await getCurrentUser();

  if (!adminUser) {
    return NextResponse.redirect(
      buildRequestUrl(request, "/agent-team/login?redirect_url=/admin/credits"),
    );
  }

  const formData = await request.formData();
  if (!(await validateCsrfRequest(request, { formData }))) {
    return csrfErrorResponse();
  }

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
  const url = buildRequestUrl(request, "/agent-team/admin/credits");
  url.searchParams.set(key, value);
  return url;
}
