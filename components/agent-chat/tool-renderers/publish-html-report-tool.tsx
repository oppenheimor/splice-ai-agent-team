"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  QrCode,
} from "lucide-react";
import { AguiNotice, AguiStatusBadge } from "./agui-ui";
import { Button } from "@/components/ui/button";

type PublishHtmlReportOutput = {
  status?: string;
  title?: string;
  summary?: string;
  url?: string | null;
  qrCodeUrl?: string | null;
  htmlBytes?: number;
  publishPath?: string;
  message?: string;
};

export function PublishHtmlReportTool({ data }: { data: unknown }) {
  const output = normalizePublishOutput(data);
  const isReady = Boolean(output.url);
  const qrCodeUrl = useGeneratedQrCode(output.url);

  return (
    <section className="overflow-hidden rounded-xl border border-[#171717] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_16px_24px_-18px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#171717] px-3 py-3 text-white sm:px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <strong className="text-sm font-semibold">完整方案交付</strong>
        </div>
        <AguiStatusBadge status={isReady ? "success" : "error"}>
          {isReady ? "已发布" : "发布失败"}
        </AguiStatusBadge>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#eaeaea] bg-[#fafafa] text-[#171717]">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <strong className="block text-sm font-semibold text-[#171717]">
                  {output.title || "完整方案 HTML"}
                </strong>
                <p className="mt-1 text-sm leading-6 text-[#666666]">
                  {output.summary ||
                    output.message ||
                    "方案已整理为 HTML 报告。"}
                </p>
              </div>
            </div>

            {isReady ? (
              <PublishedSharePanel
                url={output.url}
                qrCodeUrl={qrCodeUrl || output.qrCodeUrl}
              />
            ) : (
              <div className="mt-4">
                <PublishActions url={output.url} qrCodeUrl={null} />
              </div>
            )}

            {!isReady ? (
              <div className="mt-3">
                <AguiNotice tone="error">
                  HTML
                  内容已生成，但线上发布没有成功。你仍然可以直接使用对话里的完整方案，或稍后重试发布。
                </AguiNotice>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function PublishedSharePanel({
  url,
  qrCodeUrl,
}: {
  url?: string | null;
  qrCodeUrl?: string | null;
}) {
  return (
    <div className="mt-4 grid gap-3 rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3 sm:grid-cols-[136px_minmax(0,1fr)]">
      <div className="justify-self-center rounded-md border border-[#e1e1e1] bg-white p-2 sm:justify-self-start">
        {qrCodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCodeUrl} alt="完整方案二维码" className="h-28 w-28" />
        ) : (
          <div className="grid h-28 w-28 place-items-center rounded-sm bg-[#f2f2f2] text-[#8f8f8f]">
            <QrCode className="h-7 w-7" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-[#8f8f8f]">
            扫码查看完整方案
          </p>
          <p className="mt-1 break-all rounded-md border border-[#e1e1e1] bg-white px-2.5 py-2 text-xs leading-5 text-[#666666] sm:truncate sm:leading-normal">
            {url}
          </p>
        </div>
        <PublishActions url={url} qrCodeUrl={qrCodeUrl} />
      </div>
    </div>
  );
}

function PublishActions({
  url,
  qrCodeUrl,
}: {
  url?: string | null;
  qrCodeUrl?: string | null;
}) {
  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap">
      {url ? (
        <Button
          asChild
          size="sm"
          className="w-full rounded-md border border-[#171717] bg-[#171717] !text-white shadow-none hover:bg-black focus-visible:ring-[#006bff] sm:w-auto"
        >
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            立即打开
          </a>
        </Button>
      ) : (
        <Button
          disabled
          size="sm"
          className="w-full rounded-md border border-[#eaeaea] bg-[#f2f2f2] text-[#8f8f8f] shadow-none sm:w-auto"
        >
          <ExternalLink className="h-4 w-4" />
          立即打开
        </Button>
      )}
      <CopyLinkButton url={url} />
      {qrCodeUrl ? (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="w-full rounded-md border-[#eaeaea] bg-white text-[#171717] shadow-none hover:border-[#c9c9c9] hover:bg-[#f2f2f2] focus-visible:ring-[#006bff] sm:w-auto"
        >
          <a href={qrCodeUrl} download="deep-diagnosis-report-qr.png">
            <Download className="h-4 w-4" />
            保存二维码
          </a>
        </Button>
      ) : (
        <Button
          disabled
          size="sm"
          variant="outline"
          className="w-full rounded-md border-[#eaeaea] bg-[#f2f2f2] text-[#8f8f8f] shadow-none sm:w-auto"
        >
          <Download className="h-4 w-4" />
          保存二维码
        </Button>
      )}
    </div>
  );
}

function CopyLinkButton({ url }: { url?: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    if (!url) return;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button
      disabled={!url}
      size="sm"
      variant="outline"
      className="w-full rounded-md border-[#eaeaea] bg-white text-[#171717] shadow-none hover:border-[#c9c9c9] hover:bg-[#f2f2f2] focus-visible:ring-[#006bff] sm:w-auto"
      onClick={copyUrl}
      type="button"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "已复制" : "复制链接"}
    </Button>
  );
}

function normalizePublishOutput(data: unknown): PublishHtmlReportOutput {
  if (!data || typeof data !== "object") return {};
  return data as PublishHtmlReportOutput;
}

function useGeneratedQrCode(url?: string | null): string | null {
  const [generatedQrCode, setGeneratedQrCode] = useState<{
    url: string;
    dataUrl: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!url) {
      return;
    }

    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 6,
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (!cancelled) setGeneratedQrCode({ url, dataUrl });
      })
      .catch(() => {
        if (!cancelled) setGeneratedQrCode({ url, dataUrl: null });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url || !generatedQrCode || generatedQrCode.url !== url) {
    return null;
  }

  return generatedQrCode.dataUrl;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
