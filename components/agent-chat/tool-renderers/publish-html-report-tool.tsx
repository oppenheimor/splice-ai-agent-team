"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PublishHtmlReportOutput = {
  status?: string;
  title?: string;
  summary?: string;
  url?: string | null;
  qrCodeUrl?: string | null;
  htmlBytes?: number;
  message?: string;
};

export function PublishHtmlReportTool({ data }: { data: unknown }) {
  const output = normalizePublishOutput(data);
  const isReady = Boolean(output.url);

  return (
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <strong className="block text-sm font-semibold">{output.title || "完整方案 HTML"}</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {output.summary || output.message || "方案已整理为 HTML 报告。"}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {isReady ? "已发布" : "待接入发布"}
            </span>
          </div>

          {output.htmlBytes ? (
            <p className="mt-3 text-xs text-muted-foreground">
              HTML 大小：{formatBytes(output.htmlBytes)}
            </p>
          ) : null}

          {output.qrCodeUrl ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={output.qrCodeUrl}
                alt="完整方案二维码"
                className="h-28 w-28 rounded-lg border border-border bg-white p-2"
              />
              <PublishActions url={output.url} qrCodeUrl={output.qrCodeUrl} />
            </div>
          ) : (
            <div className="mt-4">
              <PublishActions url={output.url} qrCodeUrl={output.qrCodeUrl} />
            </div>
          )}

          {!isReady ? (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              当前只完成工具调用框架；真实 HTML 托管、公开链接和二维码生成会在发布服务接入后启用。
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function PublishActions({ url, qrCodeUrl }: { url?: string | null; qrCodeUrl?: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {url ? (
        <Button asChild size="sm">
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            立即打开
          </a>
        </Button>
      ) : (
        <Button disabled size="sm">
          <ExternalLink className="h-4 w-4" />
          立即打开
        </Button>
      )}
      {qrCodeUrl ? (
        <Button asChild size="sm" variant="outline">
          <a href={qrCodeUrl} download="deep-diagnosis-report-qr.png">
            <Download className="h-4 w-4" />
            保存二维码
          </a>
        </Button>
      ) : (
        <Button disabled size="sm" variant="outline">
          <Download className="h-4 w-4" />
          保存二维码
        </Button>
      )}
    </div>
  );
}

function normalizePublishOutput(data: unknown): PublishHtmlReportOutput {
  if (!data || typeof data !== "object") return {};
  return data as PublishHtmlReportOutput;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
