import { dirname } from "node:path";
import { defineTool } from "eve/tools";
import { z } from "zod";
import { normalizeHtmlPublishPath } from "../../lib/wish-creator/html-publish-path";
import { htmlArtifactRuntimeState } from "../lib/html-artifact-state";

export default defineTool({
  description: "Validate one self-contained HTML file in /workspace/lab and report actionable errors.",
  inputSchema: z.object({
    artifactPath: z.string().describe("Workspace-relative path such as lab/index.html."),
  }),
  async execute({ artifactPath }, context) {
    const normalizedPath = normalizeHtmlPublishPath(artifactPath);
    if (!normalizedPath) throw new Error("只能检查 lab/*.html，且路径不能包含空段、. 或 ..。");

    const runtimeArtifact = htmlArtifactRuntimeState.get();
    const sandbox = await context.getSandbox();
    if (
      runtimeArtifact.phase === "streaming"
      && runtimeArtifact.turnId === context.session.turn.id
      && runtimeArtifact.artifactPath === normalizedPath
    ) {
      if (!runtimeArtifact.html) throw new Error("HTML artifact 尚未生成可校验内容。");

      // actions.requested 早于 message.completed；校验工具负责把同一响应的最终累计文本先落盘。
      const absolutePath = sandbox.resolvePath(normalizedPath);
      const result = await sandbox.run({ command: `mkdir -p ${dirname(absolutePath)}` });
      if (result.exitCode !== 0) {
        throw new Error(`无法创建 HTML artifact 目录：${result.stderr || result.stdout}`);
      }
      await sandbox.writeTextFile({ content: runtimeArtifact.html, path: normalizedPath });
      htmlArtifactRuntimeState.update((current) => ({
        ...current,
        bytes: new TextEncoder().encode(runtimeArtifact.html).byteLength,
        phase: "persisted",
      }));
    }

    const source = await sandbox.readTextFile({ path: normalizedPath });
    if (source === null) throw new Error(`HTML 不存在或不可读：${normalizedPath}`);

    const errors: string[] = [];
    const warnings: string[] = [];
    const lower = source.toLowerCase();
    if (!/^\s*<!doctype\s+html/iu.test(source)) errors.push("缺少 <!doctype html>。");
    if (!lower.includes("<html")) errors.push("缺少 <html> 根元素。");
    if (!lower.includes("<head")) errors.push("缺少 <head>。");
    if (!lower.includes("<body")) errors.push("缺少 <body>。");
    if (!/name=["']viewport["']/iu.test(source)) warnings.push("建议添加移动端 viewport meta。");
    if (/<(?:script|link|img|iframe|audio|video|source)[^>]+(?:src|href)=["']https?:/iu.test(source)) {
      errors.push("页面包含远程资源，不符合自包含与禁止联网的边界。");
    }
    if (/<form[^>]+action=["']https?:/iu.test(source)) errors.push("表单不能提交到外部地址。");
    if (new TextEncoder().encode(source).byteLength > 2 * 1024 * 1024) {
      errors.push("HTML 超过 2 MB 发布上限。");
    }

    return {
      artifactPath: normalizedPath,
      bytes: new TextEncoder().encode(source).byteLength,
      errors,
      warnings,
      valid: errors.length === 0,
    };
  },
});
