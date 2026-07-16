const SCRIPT_BLOCK_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script\s*>/giu;
const OPEN_SCRIPT_PATTERN = /<script\b[^>]*>[\s\S]*$/iu;

export function createSafeHtmlDraftSnapshot(source: string): string | undefined {
  const stableSource = truncateUnstableHtmlTail(source.trimStart())
    .replace(SCRIPT_BLOCK_PATTERN, "")
    .replace(OPEN_SCRIPT_PATTERN, "");
  if (!hasRenderableBody(stableSource)) return undefined;

  return closeOpenRawTextElement(stableSource, "style");
}

function truncateUnstableHtmlTail(source: string): string {
  const openComment = source.lastIndexOf("<!--");
  const closedComment = source.lastIndexOf("-->");
  if (openComment > closedComment) return source.slice(0, openComment);

  const openTag = source.lastIndexOf("<");
  const closedTag = source.lastIndexOf(">");
  return openTag > closedTag ? source.slice(0, openTag) : source;
}

function closeOpenRawTextElement(source: string, tagName: string): string {
  const openingTags = source.match(new RegExp(`<${tagName}\\b[^>]*>`, "giu"))?.length ?? 0;
  const closingTags = source.match(new RegExp(`</${tagName}\\s*>`, "giu"))?.length ?? 0;
  return openingTags > closingTags ? `${source}</${tagName}>` : source;
}

function hasRenderableBody(source: string): boolean {
  const body = source.match(/<body\b[^>]*>([\s\S]*)$/iu)?.[1];
  if (!body) return false;

  const withoutRawText = body
    .replace(/<style\b[^>]*>[\s\S]*/giu, "")
    .replace(/<!--[^]*?(?:-->|$)/gu, "")
    .trim();
  return /[\p{L}\p{N}]/u.test(withoutRawText)
    || /<(?:canvas|div|footer|form|header|img|input|main|nav|section|svg)\b[^>]*>/iu.test(withoutRawText);
}
