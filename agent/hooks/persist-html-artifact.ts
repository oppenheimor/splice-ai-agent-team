import { dirname } from "node:path";
import { defineHook } from "eve/hooks";
import { parseWishCreatorHtmlArtifactEnvelope } from "../../lib/wish-creator/html-artifact-stream";
import { htmlArtifactRuntimeState } from "../lib/html-artifact-state";

export default defineHook({
  events: {
    "message.appended"(event) {
      const artifact = parseWishCreatorHtmlArtifactEnvelope(event.data.messageSoFar);
      if (!artifact) return;

      // 保存累计文本，让同一模型响应中的 validate_html 不依赖 completed 事件先发生。
      htmlArtifactRuntimeState.update(() => ({
        artifactPath: artifact.artifactPath,
        html: artifact.html,
        phase: "streaming",
        stepIndex: event.data.stepIndex,
        turnId: event.data.turnId,
      }));
    },
    async "message.completed"(event, context) {
      if (!event.data.message) return;
      const artifact = parseWishCreatorHtmlArtifactEnvelope(event.data.message);
      if (!artifact) return;

      const sandbox = await context.getSandbox();
      const absolutePath = sandbox.resolvePath(artifact.artifactPath);
      const result = await sandbox.run({ command: `mkdir -p ${dirname(absolutePath)}` });
      if (result.exitCode !== 0) {
        throw new Error(`无法创建 HTML artifact 目录：${result.stderr || result.stdout}`);
      }

      await sandbox.writeTextFile({
        content: artifact.html,
        path: artifact.artifactPath,
      });

      htmlArtifactRuntimeState.update(() => ({
        artifactPath: artifact.artifactPath,
        bytes: new TextEncoder().encode(artifact.html).byteLength,
        html: artifact.html,
        phase: "persisted",
        stepIndex: event.data.stepIndex,
        turnId: event.data.turnId,
      }));
    },
  },
});
