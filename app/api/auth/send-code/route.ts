import { NextRequest, NextResponse } from "next/server";
import { requestSmsCode } from "@/lib/auth/sms-code";
import { getClientIp } from "@/lib/http/client-ip";
import { csrfErrorResponse, validateCsrfRequest } from "@/lib/security/csrf";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  if (!(await validateCsrfRequest(request, { formData }))) {
    return csrfErrorResponse();
  }

  const phone = String(formData.get("phone") ?? "");

  try {
    await requestSmsCode({
      phone,
      ipAddress: getClientIp(request),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PHONE") {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }

    if (
      error instanceof Error &&
      (error.message === "PHONE_RATE_LIMITED" || error.message === "IP_RATE_LIMITED")
    ) {
      return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}
