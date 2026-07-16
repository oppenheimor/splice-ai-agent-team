import type { EveMessage, EveMessagePart } from "eve/react";
import {
  isWishCreatorHtmlArtifactMessage,
  parseWishCreatorHtmlArtifactEnvelope,
} from "./html-artifact-stream.ts";
import { normalizeHtmlPublishPath } from "./html-publish-path.ts";
import { createSafeHtmlDraftSnapshot } from "./html-stream-preview.ts";

export type WishCreatorHtmlArtifact = {
  readonly html: string;
  readonly fallbackHtml?: string;
  readonly fallbackStatus?: "draft" | "ready";
  readonly name: string;
  readonly path: string;
  readonly revision: string;
  readonly status: "ready" | "updating";
};

export const MAX_PREVIEW_CHARACTERS = 750_000;

export function createHtmlPublishRequest(filePath: string): string | undefined {
  const artifactPath = normalizeHtmlPublishPath(filePath);
  if (!artifactPath) return undefined;
  return `用户点击了发布，明确要求发布 \`${artifactPath}\`。请加载 html-publish skill，不要调用 ask_question，直接调用 publish_html；该工具会自行请求一次人工审批。`;
}

export function extractHtmlArtifacts(
  messages: readonly EveMessage[],
): readonly WishCreatorHtmlArtifact[] {
  const artifacts = new Map<string, WishCreatorHtmlArtifact>();
  for (const message of messages) {
    for (const [partIndex, part] of message.parts.entries()) {
      const artifact = artifactFromPart(part, `${message.id}:${partIndex}`);
      const validation = validationFromPart(part);
      if (validation?.valid) {
        const current = artifacts.get(validation.artifactPath);
        if (current) {
          artifacts.set(validation.artifactPath, {
            ...current,
            fallbackHtml: undefined,
            fallbackStatus: undefined,
            status: "ready",
          });
        }
      }
      if (!artifact) continue;
      const current = artifacts.get(artifact.path);
      const fallback = artifact.status === "updating"
        ? getArtifactFallback(current)
        : undefined;
      artifacts.delete(artifact.path);
      artifacts.set(artifact.path, {
        ...artifact,
        fallbackHtml: fallback?.html,
        fallbackStatus: fallback?.status,
      });
    }
  }
  return [...artifacts.values()];
}

function getArtifactFallback(
  current: WishCreatorHtmlArtifact | undefined,
): { readonly html: string; readonly status: "draft" | "ready" } | undefined {
  if (!current) return undefined;
  if (current.status === "ready") return { html: current.html, status: "ready" };

  const safeDraft = createSafeHtmlDraftSnapshot(current.html);
  if (safeDraft) return { html: safeDraft, status: "draft" };
  if (!current.fallbackHtml || !current.fallbackStatus) return undefined;
  return { html: current.fallbackHtml, status: current.fallbackStatus };
}

export function extractLatestPublishedUrl(messages: readonly EveMessage[]): string | undefined {
  for (const message of [...messages].reverse()) {
    for (const part of [...message.parts].reverse()) {
      if (part.type !== "dynamic-tool") continue;
      const toolName = part.toolMetadata?.eve?.name ?? part.toolName;
      if (toolName !== "publish_html" || part.state !== "output-available") continue;
      const output = toRecord(part.output);
      if (typeof output.primaryUrl === "string") return output.primaryUrl;
    }
  }
  return undefined;
}

export function preparePreviewDocument(
  source: string,
  options: { readonly interactive?: boolean } = {},
): string {
  const interactive = options.interactive ?? true;
  const previewCsp = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    `script-src ${interactive ? "'unsafe-inline'" : "'none'"}`,
    "img-src data: blob:",
    "font-src data:",
    "media-src data: blob:",
    "connect-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  const previewHead = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="${previewCsp}">`,
    interactive ? "" : "<style>body *{pointer-events:none!important}</style>",
  ].join("");
  // 预览源码不可信：先构造框架自己的 head，避免在脚本字符串里的伪 head 后注入 CSP。
  const body = source.trim().replace(/^\uFEFF?<!doctype\s+html[^>]*>\s*/iu, "");
  return `<!doctype html><html><head>${previewHead}</head>${body}</html>`;
}

export function isWishCreatorHtmlArtifactPart(part: EveMessagePart): boolean {
  return part.type === "text" && isWishCreatorHtmlArtifactMessage(part.text);
}

function artifactFromPart(
  part: EveMessagePart,
  revision: string,
): WishCreatorHtmlArtifact | undefined {
  if (part.type === "text") {
    const artifact = parseWishCreatorHtmlArtifactEnvelope(part.text);
    if (!artifact) return undefined;
    return {
      html: artifact.html,
      name: artifact.artifactPath.split("/").at(-1) ?? artifact.artifactPath,
      path: artifact.artifactPath,
      revision,
      status: "updating",
    };
  }
  if (part.type !== "dynamic-tool") return undefined;
  const toolName = part.toolMetadata?.eve?.name ?? part.toolName;
  if (toolName !== "write_file") return undefined;
  if (["input-streaming", "output-error", "output-denied"].includes(part.state)) return undefined;
  const input = toRecord(part.input);
  if (typeof input.filePath !== "string" || typeof input.content !== "string") return undefined;
  const artifactPath = normalizeHtmlPublishPath(input.filePath);
  if (!artifactPath || !/\.html?$/iu.test(artifactPath)) return undefined;
  return {
    html: input.content,
    name: artifactPath.split("/").filter(Boolean).at(-1) ?? artifactPath,
    path: artifactPath,
    revision: part.toolCallId,
    status: part.state === "output-available" ? "ready" : "updating",
  };
}

function validationFromPart(
  part: EveMessagePart,
): { readonly artifactPath: string; readonly valid: boolean } | undefined {
  if (part.type !== "dynamic-tool" || part.state !== "output-available") return undefined;
  const toolName = part.toolMetadata?.eve?.name ?? part.toolName;
  if (toolName !== "validate_html") return undefined;

  const output = toRecord(part.output);
  const artifactPath = typeof output.artifactPath === "string"
    ? normalizeHtmlPublishPath(output.artifactPath)
    : undefined;
  if (!artifactPath || typeof output.valid !== "boolean") return undefined;
  return { artifactPath, valid: output.valid };
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
