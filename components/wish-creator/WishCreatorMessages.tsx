"use client";

import type { EveDynamicToolPart, EveMessage, EveMessagePart } from "eve/react";
import { Check, ChevronDown, Circle, FileCode2, LoaderCircle, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  isWishCreatorHtmlArtifactPart,
} from "@/lib/wish-creator/html-preview";
import { parseWishCreatorHtmlArtifactEnvelope } from "@/lib/wish-creator/html-artifact-stream";
import {
  resolveHtmlArtifactProgressStage,
  type HtmlArtifactProgressStage,
} from "@/lib/wish-creator/html-artifact-progress";
import { cn } from "@/lib/utils";

export type WishCreatorInputResponse = {
  readonly optionId?: string;
  readonly requestId: string;
  readonly text?: string;
};

export function WishCreatorMessages({
  allowHtmlArtifact,
  blockedArtifactRevisions,
  busy,
  messages,
  onInputResponses,
}: {
  readonly allowHtmlArtifact: boolean;
  readonly blockedArtifactRevisions: ReadonlySet<string>;
  readonly busy: boolean;
  readonly messages: readonly EveMessage[];
  readonly onInputResponses: (responses: readonly WishCreatorInputResponse[]) => void;
}) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageArticle
          allowHtmlArtifact={allowHtmlArtifact}
          blockedArtifactRevisions={blockedArtifactRevisions}
          busy={busy}
          key={message.id}
          message={message}
          onInputResponses={onInputResponses}
        />
      ))}
    </div>
  );
}

function MessageArticle({
  allowHtmlArtifact,
  blockedArtifactRevisions,
  busy,
  message,
  onInputResponses,
}: {
  readonly allowHtmlArtifact: boolean;
  readonly blockedArtifactRevisions: ReadonlySet<string>;
  readonly busy: boolean;
  readonly message: EveMessage;
  readonly onInputResponses: (responses: readonly WishCreatorInputResponse[]) => void;
}) {
  const artifactProgress = allowHtmlArtifact
    ? deriveHtmlArtifactProgress(message, busy, blockedArtifactRevisions)
    : undefined;

  return (
    <article className="rounded-xl border border-[#28322d] bg-[#0d1411]/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
      <header className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#dfe5e1]">
        <span
          aria-hidden="true"
          className={cn("grid h-7 w-7 place-items-center rounded-full", message.role === "user" ? "bg-[#29302c]" : "bg-[#b8ff22] text-[#071007]")}
        >
          {message.role === "user" ? <UserRound className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </span>
        <span>{message.role === "user" ? "你" : "许愿池 Agent"}</span>
      </header>
      <div className="space-y-3">
        {message.parts.map((part, index) => shouldHideArtifactPart(part, artifactProgress) ? null : (
          <MessagePart
            busy={busy}
            key={part.type === "dynamic-tool" ? part.toolCallId : `${part.type}-${index}`}
            onInputResponses={onInputResponses}
            part={part}
          />
        ))}
        {artifactProgress ? <HtmlArtifactProgressCard progress={artifactProgress} /> : null}
      </div>
    </article>
  );
}

function MessagePart({
  busy,
  onInputResponses,
  part,
}: {
  busy: boolean;
  onInputResponses: (responses: readonly WishCreatorInputResponse[]) => void;
  part: EveMessagePart;
}) {
  if (part.type === "step-start" || part.type === "authorization" || part.type === "file") return null;
  if (part.type === "text") {
    if (isWishCreatorHtmlArtifactPart(part)) return null;
    return (
      <div className="prose prose-invert max-w-none text-sm leading-7 text-[#c7cfca] prose-p:my-2 prose-pre:overflow-auto prose-pre:rounded-lg prose-pre:bg-black/40 prose-code:text-[#c8ff63]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
      </div>
    );
  }
  if (part.type === "reasoning") {
    return (
      <details className="rounded-lg border border-[#26302b] bg-black/20 px-3 py-2 text-xs text-[#78847d]">
        <summary className="cursor-pointer">思考过程</summary>
        <p className="mt-2 whitespace-pre-wrap leading-6">{part.text}</p>
      </details>
    );
  }
  return <ToolPart busy={busy} onInputResponses={onInputResponses} part={part} />;
}

type HtmlArtifactProgress = {
  readonly bytes: number;
  readonly html: string;
  readonly stage: HtmlArtifactProgressStage;
};

function HtmlArtifactProgressCard({ progress }: { readonly progress: HtmlArtifactProgress }) {
  const active = progress.stage === "generating"
    || progress.stage === "checking"
    || progress.stage === "retrying";
  const startedAtRef = useRef<number | undefined>(undefined);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    startedAtRef.current ??= Date.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [active]);

  const failed = progress.stage === "needs-correction" || progress.stage === "incomplete";
  const validationProblem = progress.stage === "retrying"
    || progress.stage === "validation-error";
  const complete = progress.stage === "completed";
  const stageLabel = progress.stage === "generating"
    ? progress.bytes > 0 ? "正在生成" : "准备中"
    : progress.stage === "checking"
      ? "正在检查"
      : progress.stage === "completed"
        ? "已完成"
        : progress.stage === "needs-correction"
          ? "需要修正"
          : progress.stage === "retrying"
            ? "校验重试中"
            : progress.stage === "validation-error"
              ? "校验暂时失败"
              : "生成未完成";
  const elapsedLabel = active ? ` · 已用时 ${elapsedSeconds} 秒` : "";
  const progressDescription = progress.stage === "generating"
    ? progress.bytes > 0
      ? `页面正在一点点成形${elapsedLabel}`
      : `正在准备页面内容${elapsedLabel}`
    : progress.stage === "checking"
      ? `页面已生成，正在做最后检查${elapsedLabel}`
      : progress.stage === "completed"
        ? "页面已准备好，可以查看和继续调整"
        : progress.stage === "needs-correction"
          ? "页面还需要调整"
          : progress.stage === "retrying"
            ? `检查服务有点忙，正在重试${elapsedLabel}`
            : progress.stage === "validation-error"
              ? "暂时无法完成检查，你仍可查看当前预览"
              : "本次生成没有完成";

  return (
    <div className={cn(
      "rounded-lg border p-3",
      failed
        ? "border-red-500/30 bg-red-500/5"
        : validationProblem
          ? "border-amber-400/30 bg-amber-400/5"
          : "border-[#28322d] bg-black/20",
    )}>
      <div className="flex items-center gap-2 text-sm text-[#c6cec9]">
        {complete
          ? <Check className="h-4 w-4 text-emerald-400" />
          : failed
            ? <Circle className="h-4 w-4 text-red-400" />
            : progress.stage === "validation-error"
              ? <Circle className="h-4 w-4 text-amber-300" />
              : <LoaderCircle className={cn("h-4 w-4 animate-spin", validationProblem ? "text-amber-300" : "text-[#b8ff22]")} />}
        <FileCode2 className="h-4 w-4 text-[#7f8a83]" />
        <span className="font-medium">创建页面</span>
        <span className="ml-auto text-xs text-[#738078]">{stageLabel}</span>
      </div>
      <p className="mt-2 text-xs text-[#718078]">
        {progressDescription}
      </p>
      <details className="mt-2 text-xs text-[#6f7b74]" onToggle={(event) => setDetailsOpen(event.currentTarget.open)}>
        <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-[#9da7a1]">
          <ChevronDown className="h-3 w-3" /> 查看生成详情
        </summary>
        {detailsOpen ? <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap rounded-md bg-black/35 p-2">{progress.html}</pre> : null}
      </details>
    </div>
  );
}

function deriveHtmlArtifactProgress(
  message: EveMessage,
  busy: boolean,
  blockedArtifactRevisions: ReadonlySet<string>,
): HtmlArtifactProgress | undefined {
  let artifactIndex = -1;
  let artifactPart: Extract<EveMessagePart, { type: "text" }> | undefined;
  for (const [index, part] of message.parts.entries()) {
    if (part.type !== "text" || !isWishCreatorHtmlArtifactPart(part)) continue;
    artifactIndex = index;
    artifactPart = part;
  }
  if (!artifactPart) return undefined;
  if (blockedArtifactRevisions.has(`${message.id}:${artifactIndex}`)) return undefined;

  const artifact = parseWishCreatorHtmlArtifactEnvelope(artifactPart.text);
  let validation: EveDynamicToolPart | undefined;
  for (const part of message.parts.slice(artifactIndex + 1)) {
    if (part.type !== "dynamic-tool") continue;
    const toolName = part.toolMetadata?.eve?.name ?? part.toolName;
    if (toolName === "validate_html") validation = part;
  }

  const validationOutput = validation?.state === "output-available"
    ? toRecord(validation.output)
    : undefined;
  const stage = resolveHtmlArtifactProgressStage({
    artifactStreaming: artifactPart.state === "streaming",
    busy,
    validationState: validation?.state,
    validationValid: typeof validationOutput?.valid === "boolean"
      ? validationOutput.valid
      : undefined,
  });

  const html = artifact?.html ?? "";
  return {
    bytes: new TextEncoder().encode(html).byteLength,
    html,
    stage,
  };
}

function shouldHideArtifactPart(
  part: EveMessagePart,
  progress: HtmlArtifactProgress | undefined,
): boolean {
  if (isWishCreatorHtmlArtifactPart(part)) return true;
  if (!progress || part.type !== "dynamic-tool") return false;
  return (part.toolMetadata?.eve?.name ?? part.toolName) === "validate_html";
}

function ToolPart({
  busy,
  onInputResponses,
  part,
}: {
  busy: boolean;
  onInputResponses: (responses: readonly WishCreatorInputResponse[]) => void;
  part: EveDynamicToolPart;
}) {
  const [freeform, setFreeform] = useState("");
  const request = part.toolMetadata?.eve?.inputRequest;
  const response = part.toolMetadata?.eve?.inputResponse;
  const toolName = part.toolMetadata?.eve?.name ?? part.toolName;
  const complete = part.state === "output-available";
  const failed = part.state === "output-error" || part.state === "output-denied";
  const title = toolTitle(toolName);

  return (
    <div className={cn("rounded-lg border p-3", request && !response ? "border-[#86b926] bg-[#10190e]" : "border-[#28322d] bg-black/20")}>
      <div className="flex items-center gap-2 text-sm text-[#c6cec9]">
        {complete ? <Check className="h-4 w-4 text-emerald-400" /> : failed ? <Circle className="h-4 w-4 text-red-400" /> : <LoaderCircle className="h-4 w-4 animate-spin text-[#b8ff22]" />}
        <FileCode2 className="h-4 w-4 text-[#7f8a83]" />
        <span className="font-medium">{title}</span>
        <span className="ml-auto text-xs text-[#738078]">{complete ? "已完成" : failed ? "未完成" : request && !response ? "等待确认" : "进行中"}</span>
      </div>

      {request ? (
        <div className="mt-3 border-t border-[#28322d] pt-3">
          <p className="text-sm leading-6 text-[#aeb7b1]">
            {toolName === "publish_html" ? "页面已经准备好。确认后会生成一个新的公开访问地址。" : request.prompt}
          </p>
          {response ? (
            <p className="mt-2 text-xs text-emerald-400">已确认</p>
          ) : (
            <div className="mt-3 space-y-2">
              {(request.options?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {request.options?.map((option) => (
                    <button
                      className={cn("rounded-md px-4 py-2 text-sm font-semibold", option.style === "danger" ? "bg-red-500 text-white" : "bg-[#b8ff22] text-[#071007]")}
                      disabled={busy}
                      key={option.id}
                      onClick={() => onInputResponses([{ optionId: option.id, requestId: request.requestId }])}
                      type="button"
                    >
                      {approvalOptionLabel(toolName, option.label)}
                    </button>
                  ))}
                </div>
              ) : null}
              {request.allowFreeform === true || request.display === "text" || !request.options?.length ? (
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const text = freeform.trim();
                    if (!text) return;
                    onInputResponses([{ requestId: request.requestId, text }]);
                    setFreeform("");
                  }}
                >
                  <input className="min-w-0 flex-1 rounded-md border border-[#344039] bg-[#080d0b] px-3 py-2 text-sm outline-none focus:border-[#b8ff22]" onChange={(event) => setFreeform(event.target.value)} value={freeform} />
                  <button className="rounded-md bg-[#b8ff22] px-3 text-sm font-semibold text-[#071007]" type="submit">提交</button>
                </form>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <details className="mt-2 text-xs text-[#6f7b74]">
        <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-[#9da7a1]">
          <ChevronDown className="h-3 w-3" /> 查看运行细节
        </summary>
        <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap rounded-md bg-black/35 p-2">{JSON.stringify({ input: part.input, output: part.output, error: part.errorText }, null, 2)}</pre>
      </details>
    </div>
  );
}

function toolTitle(name: string) {
  const titles: Record<string, string> = {
    load_skill: "规划页面结构",
    todo: "拆解创作步骤",
    glob: "检查工作区",
    read_file: "读取页面",
    write_file: "生成 HTML",
    validate_html: "检查页面",
    publish_html: "发布页面",
  };
  return titles[name] ?? name.replaceAll("_", " ");
}

function approvalOptionLabel(toolName: string, label: string) {
  if (toolName !== "publish_html") return label;
  if (["yes", "approve", "allow"].includes(label.toLowerCase())) return "确认发布";
  if (["no", "deny", "reject"].includes(label.toLowerCase())) return "取消";
  return label;
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
