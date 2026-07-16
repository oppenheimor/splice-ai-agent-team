import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { normalizeHtmlPublishPath } from "../../lib/wish-creator/html-publish-path";
import { recordWishCreatorPublication } from "../../lib/wish-creator/persistence";
import { publishHtmlContent } from "../lib/html-publish";

const MAX_HTML_BYTES = 2 * 1024 * 1024;

export default defineTool({
  description: "Publish one validated sandbox HTML artifact after explicit human approval.",
  inputSchema: z.object({
    artifactPath: z.string().refine((path) => normalizeHtmlPublishPath(path) === path),
  }),
  approval: always(),
  async execute({ artifactPath }, context) {
    const caller = context.session.auth.current;
    const conversationId = caller?.attributes.conversationId;
    if (caller?.principalType !== "user" || typeof conversationId !== "string") {
      throw new Error("发布需要已登录且绑定许愿池会话的用户。");
    }

    const sandbox = await context.getSandbox();
    const content = await sandbox.readTextFile({ path: artifactPath });
    if (content === null) throw new Error(`待发布 HTML 不存在或不可读：${artifactPath}`);

    const bytes = new TextEncoder().encode(content).byteLength;
    if (bytes === 0) throw new Error("不能发布空 HTML 文件。");
    if (bytes > MAX_HTML_BYTES) throw new Error(`HTML 超过 ${MAX_HTML_BYTES} 字节上限。`);

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    const publishPath = `p/${stamp}-${randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const published = await publishHtmlContent({
      content,
      fileName: posix.basename(artifactPath),
      publishPath,
    });

    await recordWishCreatorPublication({
      userId: caller.principalId,
      conversationId,
      result: {
        artifactPath,
        bytes,
        publishPath,
        primaryUrl: published.primaryUrl,
        status: published.status,
        verification: published.verification,
      },
    });

    return { artifactPath, bytes, publishPath, ...published };
  },
});
