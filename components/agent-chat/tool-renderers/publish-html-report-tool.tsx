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
    <Card className="border-[#eaeaea] bg-white p-4 shadow-[0_2px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#eaeaea] bg-[#fafafa] text-[#171717]">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <strong className="block text-sm font-semibold text-[#171717]">{output.title || "完整方案 HTML"}</strong>
              <p className="mt-1 text-sm leading-6 text-[#666666]">
                {output.summary || output.message || "方案已整理为 HTML 报告。"}
              </p>
            </div>
            <span className="rounded-full border border-[#eaeaea] bg-[#fafafa] px-2.5 py-1 text-xs font-semibold text-[#666666]">
              {isReady ? "已发布" : "待接入发布"}
            </span>
          </div>

          {output.htmlBytes ? (
            <p className="mt-3 text-xs text-[#8f8f8f]">
              HTML 大小：{formatBytes(output.htmlBytes)}
            </p>
          ) : null}

          {output.qrCodeUrl ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={output.qrCodeUrl}
                alt="完整方案二维码"
                className="h-28 w-28 rounded-lg border border-[#eaeaea] bg-white p-2"
              />
              <PublishActions url={output.url} qrCodeUrl={output.qrCodeUrl} />
            </div>
          ) : (
            <div className="mt-4">
              <PublishActions url={output.url} qrCodeUrl={output.qrCodeUrl} />
            </div>
          )}

          {!isReady ? (
            <p className="mt-3 text-xs leading-5 text-[#666666]">
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
        <Button asChild size="sm" className="rounded-md border border-[#171717] bg-[#171717] text-white shadow-none hover:bg-black focus-visible:ring-[#006bff]">
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            立即打开
          </a>
        </Button>
      ) : (
        <Button disabled size="sm" className="rounded-md border border-[#eaeaea] bg-[#f2f2f2] text-[#8f8f8f] shadow-none">
          <ExternalLink className="h-4 w-4" />
          立即打开
        </Button>
      )}
      {qrCodeUrl ? (
        <Button asChild size="sm" variant="outline" className="rounded-md border-[#eaeaea] bg-white text-[#171717] shadow-none hover:border-[#c9c9c9] hover:bg-[#f2f2f2] focus-visible:ring-[#006bff]">
          <a href={qrCodeUrl} download="deep-diagnosis-report-qr.png">
            <Download className="h-4 w-4" />
            保存二维码
          </a>
        </Button>
      ) : (
        <Button disabled size="sm" variant="outline" className="rounded-md border-[#eaeaea] bg-[#f2f2f2] text-[#8f8f8f] shadow-none">
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
