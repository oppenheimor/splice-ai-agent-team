"use client";

import {
  Check,
  Clipboard,
  ExternalLink,
  FileCode2,
  Monitor,
  RefreshCcw,
  Smartphone,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MAX_PREVIEW_CHARACTERS,
  createHtmlPublishRequest,
  preparePreviewDocument,
  type WishCreatorHtmlArtifact,
} from "@/lib/wish-creator/html-preview";
import { cn } from "@/lib/utils";
import { wishCreatorFocus } from "./styles";
import { useSafeHtmlDraft } from "./useSafeHtmlDraft";

type PreviewViewport = "desktop" | "mobile";

export function WishCreatorPreview({
  artifacts,
  busy,
  disabled,
  latestPublishedUrl,
  onPublish,
  onStreamingPreviewReady,
}: {
  readonly artifacts: readonly WishCreatorHtmlArtifact[];
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly latestPublishedUrl?: string;
  readonly onPublish: (request: string) => void;
  readonly onStreamingPreviewReady: (revision: string) => void;
}) {
  const latest = artifacts.at(-1);
  const [selectedPath, setSelectedPath] = useState<string>();
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const announcedDraftRevisionRef = useRef<string | undefined>(undefined);

  const selected = artifacts.find((artifact) => artifact.path === selectedPath) ?? latest;
  const streaming = selected?.status === "updating";
  const draftSnapshot = useSafeHtmlDraft(
    selected?.html ?? "",
    selected?.revision ?? "",
    streaming,
  );
  const revertedToFallback = streaming && !busy && Boolean(selected?.fallbackHtml);
  const previewSource = selected?.status === "ready"
    ? selected.html
    : revertedToFallback
      ? selected?.fallbackHtml
      : draftSnapshot ?? selected?.fallbackHtml;
  const interactive = !busy && (
    selected?.status === "ready"
    || (revertedToFallback && selected?.fallbackStatus === "ready")
  );
  const tooLarge = (previewSource?.length ?? 0) > MAX_PREVIEW_CHARACTERS;
  const previewDocument = previewSource && !tooLarge
    ? preparePreviewDocument(previewSource, { interactive })
    : undefined;
  const publishRequest = selected ? createHtmlPublishRequest(selected.path) : undefined;

  useEffect(() => {
    if (!streaming || !busy || !draftSnapshot || !selected) return;
    if (announcedDraftRevisionRef.current === selected.revision) return;
    announcedDraftRevisionRef.current = selected.revision;
    onStreamingPreviewReady(selected.revision);
  }, [busy, draftSnapshot, onStreamingPreviewReady, selected, streaming]);

  async function copyLatestUrl() {
    if (!latestPublishedUrl) return;
    await navigator.clipboard.writeText(latestPublishedUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#070b09]" aria-label="页面预览">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#25302a] px-4">
        <FileCode2 className="h-4 w-4 text-[#b8ff22]" />
        {artifacts.length > 1 ? (
          <select className="max-w-44 bg-transparent text-sm text-[#c9d0cc] outline-none" onChange={(event) => setSelectedPath(event.target.value)} value={selected?.path ?? ""}>
            {artifacts.map((artifact) => <option key={artifact.path} value={artifact.path}>{artifact.name}</option>)}
          </select>
        ) : <span className="truncate text-sm text-[#c9d0cc]">{selected?.name ?? "等待页面生成"}</span>}
        <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-[#92a095] sm:flex">
          <i className={cn("h-1.5 w-1.5 rounded-full", selected ? "bg-[#b8ff22] shadow-[0_0_8px_#b8ff22]" : "bg-[#536057]")} />
          {streaming
            ? busy
              ? "生成中"
              : revertedToFallback && selected?.fallbackStatus === "ready"
                ? "已恢复"
                : "未完成"
            : selected
              ? busy ? "创作中" : "LIVE"
              : "STANDBY"}
        </span>
        <div className="flex rounded-md border border-[#2c3731] p-0.5">
          <ToolbarButton active={viewport === "desktop"} label="桌面预览" onClick={() => setViewport("desktop")}><Monitor /></ToolbarButton>
          <ToolbarButton active={viewport === "mobile"} label="手机预览" onClick={() => setViewport("mobile")}><Smartphone /></ToolbarButton>
        </div>
        <ToolbarButton disabled={!selected} label="刷新预览" onClick={() => setRefreshVersion((value) => value + 1)}><RefreshCcw /></ToolbarButton>
        <button
          className={cn(wishCreatorFocus, "flex h-9 items-center gap-2 rounded-md bg-[#b8ff22] px-4 text-sm font-semibold text-[#071007] hover:bg-[#c8ff50] disabled:opacity-35")}
          disabled={disabled || selected?.status !== "ready" || !publishRequest}
          onClick={() => publishRequest && onPublish(publishRequest)}
          type="button"
        >
          <UploadCloud className="h-4 w-4" /> <span className="hidden sm:inline">发布</span>
        </button>
      </header>

      {latestPublishedUrl ? (
        <div className="flex min-h-12 shrink-0 items-center gap-2 border-b border-[#25302a] bg-[#0b110e] px-4 text-xs text-[#9ca69f]">
          <span className="flex min-w-0 items-center gap-2 truncate"><Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />最近发布：<span className="truncate text-[#cfd5d1]">{latestPublishedUrl}</span></span>
          <a className="ml-auto flex shrink-0 items-center gap-1 rounded-md border border-[#303a35] px-2.5 py-1.5 hover:text-white" href={latestPublishedUrl} rel="noreferrer" target="_blank"><ExternalLink className="h-3.5 w-3.5" />打开</a>
          <button className="flex shrink-0 items-center gap-1 rounded-md border border-[#303a35] px-2.5 py-1.5 hover:text-white" onClick={() => void copyLatestUrl()} type="button"><Clipboard className="h-3.5 w-3.5" />{copied ? "已复制" : "复制链接"}</button>
          {/* TODO: 本期不提供历史发布 UI；服务端保留发布记录，为后续作品列表和历史菜单提供数据。 */}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-5">
        {selected && previewDocument ? (
          <div className={cn("relative h-full max-h-full overflow-hidden rounded-xl border border-[#303934] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition-[width] duration-300", viewport === "mobile" ? "w-[390px]" : "w-full")}>
            {/* 产品决策：完成态允许同源以支持 localStorage；生成态仍保持无脚本、不可交互。 */}
            <iframe
              className="h-full w-full border-0"
              key={`${selected.revision}-${refreshVersion}-${interactive ? "interactive" : "draft"}`}
              referrerPolicy="no-referrer"
              sandbox={interactive ? "allow-scripts allow-same-origin" : ""}
              srcDoc={previewDocument}
              title={`预览 ${selected.name}`}
            />
            {!interactive ? (
              <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-center">
                <span className="rounded-full border border-[#b8ff22]/45 bg-[#071007]/85 px-3 py-1.5 text-xs font-medium text-[#dfffa5] shadow-lg backdrop-blur">
                  {busy ? streaming ? "生成中 · 预览暂不可操作" : "正在生成新版本 · 暂时保留当前页面" : "生成未完成 · 仅供预览"}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="max-w-sm text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-[#344039] bg-[#0d1511] text-[#b8ff22]"><FileCode2 className="h-7 w-7" /></div>
            <h2 className="mt-5 text-lg font-semibold text-[#dfe5e1]">{tooLarge ? "页面过大，暂停预览" : "页面会在这里出现"}</h2>
            <p className="mt-2 text-sm leading-6 text-[#758078]">{tooLarge ? "请让 Agent 精简为更小的单文件页面。" : "告诉 Agent 想做什么，它写好 HTML 后会自动刷新预览。"}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ToolbarButton({ active, children, disabled, label, onClick }: { active?: boolean; children: React.ReactElement<{ className?: string }>; disabled?: boolean; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} aria-pressed={active} className={cn(wishCreatorFocus, "grid h-8 w-8 place-items-center rounded text-[#77837c] hover:text-white disabled:opacity-30", active && "bg-[#1b251f] text-[#b8ff22]")} disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  );
}
