const ORIGIN_HOST = "http://118.196.86.98";
const TARGET_HOST = "https://splice-ai.cn";
const API_URL = "https://splice-ai.cn/html-publish/api/publish";
const MAX_RESPONSE_BYTES = 64 * 1024;

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export async function publishHtmlContent(options: {
  readonly content: string;
  readonly fetchImpl?: FetchLike;
  readonly fileName: string;
  readonly publishPath: string;
}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const form = new FormData();
  form.append("files", new Blob([options.content], { type: "text/html; charset=utf-8" }), options.fileName);
  form.append("filePaths", options.fileName);
  form.append("publishPath", options.publishPath);

  const response = await fetchImpl(API_URL, {
    body: form,
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  const responseText = await readLimitedText(response, MAX_RESPONSE_BYTES);
  if (!response.ok) throw new Error(`发布服务返回 ${response.status}：${responseText.slice(0, 300)}`);
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new Error("发布服务没有返回 JSON。");
  }

  const payload = JSON.parse(responseText) as unknown;
  const urls = extractPublishedUrls(payload, options.fileName, options.publishPath);
  if (urls.length === 0) throw new Error("发布服务未返回成功状态和可访问 URL。");

  let verification: "uploaded_verification_pending" | "verified" = "verified";
  let verificationMessage: string | undefined;
  try {
    const checked = await fetchImpl(urls[0], {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    const contentType = checked.headers.get("content-type")?.toLowerCase() ?? "";
    await checked.body?.cancel();
    if (!checked.ok || !contentType.includes("text/html")) {
      verification = "uploaded_verification_pending";
      verificationMessage = `公网回读尚未就绪：HTTP ${checked.status}`;
    }
  } catch (error) {
    verification = "uploaded_verification_pending";
    verificationMessage = `公网回读暂时失败：${error instanceof Error ? error.message : String(error)}`;
  }

  const summary = toRecord(payload);
  return {
    primaryUrl: urls[0],
    urls,
    verification,
    ...(verificationMessage ? { verificationMessage } : {}),
    message: typeof summary.message === "string" ? summary.message : "",
    status: typeof summary.status === "string" ? summary.status : "published",
  };
}

function extractPublishedUrls(payload: unknown, fileName: string, publishPath: string): string[] {
  const response = toRecord(payload);
  const status = typeof response.status === "string" ? response.status.toLowerCase() : "unknown";
  if (!["published", "success", "ok", "completed"].includes(status)) return [];

  const candidates: string[] = [];
  if (Array.isArray(response.htmlUrls)) {
    for (const item of response.htmlUrls) {
      const url = toRecord(item).url;
      if (typeof url === "string") candidates.push(url.replace(ORIGIN_HOST, TARGET_HOST));
    }
  }
  if (candidates.length === 0 && Array.isArray(response.files)) {
    for (const item of response.files) {
      const key = toRecord(item).targetKey;
      if (typeof key === "string") candidates.push(`${TARGET_HOST}/${key.replace(/^\/+/, "")}`);
    }
  }

  return [...new Set(candidates)].filter((url) => isExpectedUrl(url, fileName, publishPath));
}

function isExpectedUrl(url: string, fileName: string, publishPath: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === TARGET_HOST && parsed.pathname === `/${publishPath}/${fileName}`
      && !parsed.search && !parsed.hash && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

async function readLimitedText(response: Response, limit: number): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > limit) {
      await reader.cancel();
      throw new Error(`发布服务响应超过 ${limit} 字节上限。`);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
