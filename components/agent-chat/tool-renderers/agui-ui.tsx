"use client";

import { AlertTriangle, CheckCircle2, CircleDashed, Clock3, Info, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AguiToolStatus = "input" | "loading" | "partial" | "success" | "warning" | "error" | "empty" | "stale";

type AguiToolCardProps = {
  title: string;
  description?: string;
  label: string;
  status?: AguiToolStatus;
  statusText?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
};

const statusMeta: Record<AguiToolStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  input: { label: "待确认", className: "border-[#d6e7ff] bg-[#f0f7ff] text-[#0059ec]", Icon: CircleDashed },
  loading: { label: "生成中", className: "border-[#eaeaea] bg-[#fafafa] text-[#666666]", Icon: Clock3 },
  partial: { label: "部分结果", className: "border-[#d6e7ff] bg-[#f0f7ff] text-[#0059ec]", Icon: Info },
  success: { label: "已生成", className: "border-[#b9f5bc] bg-[#ecfdec] text-[#107d32]", Icon: CheckCircle2 },
  warning: { label: "需复核", className: "border-[#fff1c1] bg-[#fff6de] text-[#8a5a00]", Icon: AlertTriangle },
  error: { label: "未完成", className: "border-[#ffd7d6] bg-[#ffeeef] text-[#d8001b]", Icon: ShieldAlert },
  empty: { label: "暂无数据", className: "border-[#eaeaea] bg-[#fafafa] text-[#666666]", Icon: CircleDashed },
  stale: { label: "可能过期", className: "border-[#fff1c1] bg-[#fff6de] text-[#8a5a00]", Icon: RotateCcw },
};

export function AguiToolCard({
  title,
  description,
  label,
  status = "success",
  statusText,
  actionLabel,
  actionDisabled,
  onAction,
  children,
  className,
  bodyClassName,
}: AguiToolCardProps) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-[#e1e1e1] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02)]", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eaeaea] bg-white px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#eaeaea] bg-white px-2.5 py-1 text-xs font-medium text-[#666666]">{label}</span>
            <AguiStatusBadge status={status}>{statusText}</AguiStatusBadge>
          </div>
          <strong className="mt-2 block text-sm font-semibold leading-5 text-[#171717]">{title}</strong>
          {description ? <p className="mt-1 text-sm leading-6 text-[#666666]">{description}</p> : null}
        </div>
        {actionLabel ? (
          <Button
            className="h-8 rounded-md border border-[#eaeaea] bg-white px-3 text-xs font-medium text-[#171717] shadow-none hover:border-[#c9c9c9] hover:bg-[#f2f2f2] focus-visible:ring-[#006bff]"
            disabled={actionDisabled}
            onClick={onAction}
            type="button"
            variant="outline"
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
      <div className={cn("p-3 sm:p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function AguiStatusBadge({ status, children }: { status: AguiToolStatus; children?: React.ReactNode }) {
  const meta = statusMeta[status];
  const Icon = meta.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", meta.className)}>
      <Icon className="h-3.5 w-3.5" />
      {children || meta.label}
    </span>
  );
}

export function AguiEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d9d9d9] bg-[#fafafa] px-4 py-5 text-center">
      <strong className="block text-sm font-semibold text-[#171717]">{title}</strong>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#666666]">{description}</p> : null}
    </div>
  );
}

export function AguiNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
}) {
  const className = {
    info: "border-[#d6e7ff] bg-[#f0f7ff] text-[#003f9e]",
    warning: "border-[#fff1c1] bg-[#fff6de] text-[#5f3d00]",
    error: "border-[#ffd7d6] bg-[#ffeeef] text-[#47000c]",
    success: "border-[#b9f5bc] bg-[#ecfdec] text-[#0d5726]",
  }[tone];
  const Icon = tone === "error" ? ShieldAlert : tone === "warning" ? AlertTriangle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div className={cn("flex gap-2 rounded-lg border p-3 text-sm leading-6", className)}>
      <Icon className="mt-1 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function MetricToneBadge({ tone, children }: { tone?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
        tone === "good" && "border-[#b9f5bc] bg-[#ecfdec] text-[#107d32]",
        tone === "warn" && "border-[#fff1c1] bg-[#fff6de] text-[#8a5a00]",
        tone === "danger" && "border-[#ffd7d6] bg-[#ffeeef] text-[#d8001b]",
        (!tone || tone === "neutral") && "border-[#eaeaea] bg-[#fafafa] text-[#666666]",
      )}
    >
      {children}
    </span>
  );
}

export function ReadOnlyAction({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[#eaeaea] bg-[#fafafa] px-2.5 py-1.5 text-xs font-medium text-[#4d4d4d]">
      {children}
    </span>
  );
}
