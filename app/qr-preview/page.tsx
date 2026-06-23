import { PublishHtmlReportTool } from "@/components/agent-chat/tool-renderers/publish-html-report-tool";

export default function QrPreviewPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="mx-auto max-w-2xl">
        <PublishHtmlReportTool
          data={{
            status: "published",
            title: "茶饮单店 AI 获客专项方案",
            summary: "完整方案已生成并发布为可访问 HTML。",
            url: "https://splice-ai.cn/p/codex-smoke-mqpfgq9v/index.html",
            htmlBytes: 48219,
            publishPath: "p/codex-smoke-mqpfgq9v",
          }}
        />
      </div>
    </main>
  );
}
