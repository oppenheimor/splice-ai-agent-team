import { jsonSchema, tool } from "ai";
import { randomBytes } from "node:crypto";

type PublishHtmlReportInput = {
  title: string;
  html: string;
  summary?: string;
};

type PublishHtmlReportOutput = {
  status: "published" | "failed";
  title: string;
  summary: string;
  url: string | null;
  qrCodeUrl: null;
  htmlBytes: number;
  publishPath?: string;
  message: string;
};

const HTML_PUBLISH_API_URL = "https://splice-ai.cn/html-publish/api/publish";
const HTML_PUBLISH_ORIGIN_HOST = "http://118.196.86.98";
const HTML_PUBLISH_TARGET_HOST = "https://splice-ai.cn";

export const publishHtmlReportTool = tool({
  description: [
    "发布一份 AI 落地诊断 HTML 交付物，并返回可访问链接和二维码。",
    "仅在用户通过 askUserChoice 明确确认生成或发布当前交付物后使用。",
    "交付物可以是完整诊断报告、本轮专项方案或假设简报，但标题和正文必须如实标注当前级别。",
    "调用前必须先在对话中给出同一份文本 fallback，避免发布失败时用户拿不到交付物。",
  ].join(" "),
  inputSchema: jsonSchema({
    type: "object",
    additionalProperties: false,
    properties: {
      title: {
        type: "string",
        description: "报告标题，使用中文短标题。",
      },
      summary: {
        type: "string",
        description: "报告摘要，用于发布卡片展示。",
      },
      html: {
        type: "string",
        description: "完整自包含 HTML。必须包含 doctype、html、head、body，且不要引用未验证的远程脚本。",
      },
    },
    required: ["title", "html"],
  }),
  execute: async (input) => {
    const report = input as PublishHtmlReportInput;
    const html = normalizeHtml(report.html);
    const htmlBytes = Buffer.byteLength(html, "utf8");

    try {
      const publishPath = generatePublishPath();
      const url = await publishHtml({ html, publishPath });

      return {
        status: "published",
        title: report.title,
        summary: report.summary || "完整方案已生成并发布为可访问 HTML。",
        url,
        qrCodeUrl: null,
        htmlBytes,
        publishPath,
        message: "完整方案 HTML 已发布。",
      } satisfies PublishHtmlReportOutput;
    } catch (error) {
      return {
        status: "failed",
        title: report.title,
        summary: report.summary || "完整方案已生成，但 HTML 发布失败。",
        url: null,
        qrCodeUrl: null,
        htmlBytes,
        message: error instanceof Error ? error.message : "HTML 发布失败，请稍后重试。",
      } satisfies PublishHtmlReportOutput;
    }
  },
});

function normalizeHtml(html: string): string {
  const normalized = String(html || "").trim();

  if (!normalized) {
    throw new Error("HTML 内容为空，无法发布。");
  }

  if (!/<!doctype\s+html/i.test(normalized) || !/<html[\s>]/i.test(normalized) || !/<body[\s>]/i.test(normalized)) {
    throw new Error("HTML 必须是包含 doctype、html 和 body 的完整文档。");
  }

  return normalized;
}

function generatePublishPath(): string {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    padDatePart(now.getMonth() + 1),
    padDatePart(now.getDate()),
    "-",
    padDatePart(now.getHours()),
    padDatePart(now.getMinutes()),
    padDatePart(now.getSeconds()),
  ].join("");
  return `p/${timestamp}-${randomBytes(4).toString("hex")}`;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

async function publishHtml(input: { html: string; publishPath: string }): Promise<string> {
  const fileName = "index.html";
  const formData = new FormData();
  formData.append("files", new Blob([input.html], { type: "text/html;charset=utf-8" }), fileName);
  formData.append("filePaths", fileName);
  formData.append("publishPath", input.publishPath);

  const response = await fetch(HTML_PUBLISH_API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`HTML 发布接口失败：${response.status}${errorText ? ` ${errorText.slice(0, 200)}` : ""}`);
  }

  const result = await response.json();
  const url = extractPublishedUrl(result);

  if (!url) {
    throw new Error("HTML 发布接口未返回可访问链接。");
  }

  return fixPublishedUrl(url);
}

function extractPublishedUrl(result: unknown): string | null {
  if (!isRecord(result)) return null;

  if (Array.isArray(result.htmlUrls)) {
    for (const item of result.htmlUrls) {
      if (isRecord(item) && typeof item.url === "string") {
        return item.url;
      }
    }
  }

  if (Array.isArray(result.files)) {
    for (const file of result.files) {
      if (isRecord(file) && typeof file.targetKey === "string" && file.targetKey) {
        return `${HTML_PUBLISH_TARGET_HOST}/${file.targetKey}`;
      }
    }
  }

  return null;
}

function fixPublishedUrl(url: string): string {
  return url.replace(HTML_PUBLISH_ORIGIN_HOST, HTML_PUBLISH_TARGET_HOST);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
