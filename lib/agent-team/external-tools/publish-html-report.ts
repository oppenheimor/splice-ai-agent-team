import { jsonSchema, tool } from "ai";

type PublishHtmlReportInput = {
  title: string;
  html: string;
  summary?: string;
};

export const publishHtmlReportTool = tool({
  description: [
    "发布一份完整 AI 落地诊断 HTML 报告，并返回可访问链接和二维码。",
    "仅在用户通过 askUserChoice 明确确认生成完整方案后使用。",
    "当前实现是占位框架：先接收 HTML 报告内容，后续再接入真实发布服务。",
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

    // TODO: 接入真实 HTML 发布服务，写入 HTML 文件并返回公网可访问 URL 与二维码资源。
    return {
      status: "pending_implementation",
      title: report.title,
      summary: report.summary || "完整方案已生成，HTML 发布服务待接入。",
      url: null,
      qrCodeUrl: null,
      htmlBytes: Buffer.byteLength(report.html || "", "utf8"),
      message: "发布工具框架已接通；真实 HTML 文件发布与二维码生成将在后续实现。",
    };
  },
});
