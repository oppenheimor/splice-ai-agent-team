import { normalizeHtmlPublishPath } from "./html-publish-path.ts";

export const WISH_CREATOR_HTML_ARTIFACT_MARKER_START =
  "<!-- wish-creator-html-artifact:v1";

const ARTIFACT_MARKER_PATTERN =
  /<!-- wish-creator-html-artifact:v1 path="([^"]+)" -->\r?\n?/u;

export type WishCreatorHtmlArtifactEnvelope = {
  readonly artifactPath: string;
  readonly html: string;
};

export function createWishCreatorHtmlArtifactEnvelope(
  artifactPath: string,
  html: string,
): string {
  const normalizedPath = normalizeHtmlPublishPath(artifactPath);
  if (!normalizedPath) throw new Error("许愿池 HTML artifact 路径无效。");
  return `${WISH_CREATOR_HTML_ARTIFACT_MARKER_START} path="${normalizedPath}" -->\n${html}`;
}

export function parseWishCreatorHtmlArtifactEnvelope(
  message: string,
): WishCreatorHtmlArtifactEnvelope | undefined {
  const normalizedMessage = message.trimStart();
  const marker = normalizedMessage.match(ARTIFACT_MARKER_PATTERN);
  if (!marker) return undefined;

  const artifactPath = normalizeHtmlPublishPath(marker[1] ?? "");
  if (!artifactPath) return undefined;

  return {
    artifactPath,
    html: normalizedMessage.slice((marker.index ?? 0) + marker[0].length),
  };
}

export function isWishCreatorHtmlArtifactMessage(message: string): boolean {
  const normalizedMessage = message.trimStart();
  if (!normalizedMessage) return false;

  // 首个模型 delta 可能只包含 marker 的前半段，也要立即隐藏原始源码。
  return WISH_CREATOR_HTML_ARTIFACT_MARKER_START.startsWith(normalizedMessage)
    || normalizedMessage.includes(WISH_CREATOR_HTML_ARTIFACT_MARKER_START)
    || normalizedMessage.includes("<!-- wish-creator-html-artifact");
}
