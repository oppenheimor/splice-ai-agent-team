import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateCreditAccount } from "@/lib/credits/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "未登录。" }, { status: 401 });
  }

  const account = await getOrCreateCreditAccount(user.id);

  return NextResponse.json({
    balance: account.balance,
    totalGranted: account.totalGranted,
    totalConsumed: account.totalConsumed,
    updatedAt: account.updatedAt.toISOString(),
  });
}
