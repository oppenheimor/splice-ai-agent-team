"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertCircle, Coins, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UseCreditBalanceResult } from "@/lib/credits/useCreditBalance";
import { buildCreditsHref } from "@/utils/routing";

type CreditBalancePillProps = {
  credit: UseCreditBalanceResult;
  className?: string;
  compact?: boolean;
};

export function CreditBalancePill({
  credit,
  className,
  compact = false,
}: CreditBalancePillProps) {
  const creditsHref = useCreditsHref();
  const balance = credit.balance?.balance;
  const label = credit.isLoading
    ? "余额读取中"
    : typeof balance === "number"
      ? "积分"
      : "查看积分";

  return (
    <Link
      href={creditsHref}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 text-sm font-semibold text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition hover:border-[#cfcfcf] hover:bg-[#f7f7f7]",
        className,
      )}
      title="查看积分余额和流水"
    >
      <Coins className="h-4 w-4" aria-hidden="true" />
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
        {typeof balance === "number" ? (
          <>
            <span className={getCreditBalanceTextClass(balance)}>{balance.toLocaleString("zh-CN")}</span>
            {" "}
            {label}
          </>
        ) : (
          label
        )}
      </span>
    </Link>
  );
}

export function CreditSettingsButton({ className }: { className?: string }) {
  return (
    <Button asChild variant="outline" className={cn("rounded-full", className)}>
      <Link href="/settings">
        <Settings className="h-4 w-4" />
        设置
      </Link>
    </Button>
  );
}

export function CreditSettingsIconLink({ className }: { className?: string }) {
  return (
    <Link
      href="/settings"
      className={cn(
        "inline-grid h-9 w-9 place-items-center rounded-full border border-[#e5e5e5] bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition hover:border-[#cfcfcf] hover:bg-[#f7f7f7]",
        className,
      )}
      title="设置"
      aria-label="设置"
    >
      <Settings className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function CreditErrorNotice({
  error,
  className,
}: {
  error?: Error;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div
      className={cn(
        "flex max-w-2xl items-start gap-2 rounded-lg border border-[#ffd7d6] bg-[#fff5f5] px-4 py-3 text-sm text-[#8a1f11] shadow-[0_1px_1px_rgba(0,0,0,0.02)]",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 leading-6">{normalizeCreditErrorMessage(error.message)}</span>
    </div>
  );
}

function normalizeCreditErrorMessage(message: string) {
  const trimmed = message.trim();

  if (!trimmed) {
    return "请求失败，请稍后再试。";
  }

  if (trimmed.startsWith("{")) {
    try {
      const payload = JSON.parse(trimmed) as { error?: unknown };
      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function getCreditBalanceTextClass(balance: number) {
  if (balance >= 800) return "text-[#14924b]";
  if (balance >= 20) return "text-[#b77900]";
  return "text-[#c92a2a]";
}

export function useCreditsHref() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  return buildCreditsHref(`${pathname}${queryString ? `?${queryString}` : ""}`);
}
