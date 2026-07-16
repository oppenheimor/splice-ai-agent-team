import assert from "node:assert/strict";
import test from "node:test";
import type { EveMessage } from "eve/react";
import {
  createWishCreatorHtmlArtifactEnvelope,
  isWishCreatorHtmlArtifactMessage,
  parseWishCreatorHtmlArtifactEnvelope,
} from "./html-artifact-stream.ts";
import { extractHtmlArtifacts, preparePreviewDocument } from "./html-preview.ts";
import { createSafeHtmlDraftSnapshot } from "./html-stream-preview.ts";

const COMPLETE_HTML = "<!doctype html><html><head></head><body><main>完整页面</main></body></html>";

test("artifact envelope 可以在流式 marker 和完整消息之间稳定识别", () => {
  assert.equal(isWishCreatorHtmlArtifactMessage("<!-- wish-creator"), true);

  const message = createWishCreatorHtmlArtifactEnvelope("lab/index.html", COMPLETE_HTML);
  assert.deepEqual(parseWishCreatorHtmlArtifactEnvelope(message), {
    artifactPath: "lab/index.html",
    html: COMPLETE_HTML,
  });

  assert.deepEqual(
    parseWishCreatorHtmlArtifactEnvelope(`现在开始生成。\n${message}`),
    { artifactPath: "lab/index.html", html: COMPLETE_HTML },
  );
});

test("artifact envelope 拒绝实验室以外的路径", () => {
  assert.throws(
    () => createWishCreatorHtmlArtifactEnvelope("../index.html", COMPLETE_HTML),
    /路径无效/u,
  );
});

test("安全快照保留可渲染主体，去掉脚本和未闭合标签", () => {
  assert.equal(
    createSafeHtmlDraftSnapshot("<!doctype html><html><head><style>body{color:red}"),
    undefined,
  );

  const snapshot = createSafeHtmlDraftSnapshot(
    "<!doctype html><html><head></head><body><main>正在出现</main><script>alert(1)</script><sect",
  );
  assert.ok(snapshot?.includes("正在出现"));
  assert.equal(snapshot?.includes("alert(1)"), false);
  assert.equal(snapshot?.includes("<sect"), false);
});

test("新 artifact 生成时保留上一个已校验版本作为回退", () => {
  const firstMessage = createWishCreatorHtmlArtifactEnvelope("lab/index.html", COMPLETE_HTML);
  const nextHtml = "<!doctype html><html><head></head><body><main>新版本";
  const nextMessage = createWishCreatorHtmlArtifactEnvelope("lab/index.html", nextHtml);
  const messages = [
    {
      id: "turn-1",
      role: "assistant",
      parts: [
        { type: "text", state: "done", text: firstMessage },
        {
          type: "dynamic-tool",
          state: "output-available",
          toolCallId: "validate-1",
          toolName: "validate_html",
          input: { artifactPath: "lab/index.html" },
          output: { artifactPath: "lab/index.html", valid: true },
        },
      ],
    },
    {
      id: "turn-2",
      role: "assistant",
      parts: [{ type: "text", state: "streaming", text: nextMessage }],
    },
  ] as unknown as readonly EveMessage[];

  assert.deepEqual(extractHtmlArtifacts(messages), [{
    fallbackHtml: COMPLETE_HTML,
    fallbackStatus: "ready",
    html: nextHtml,
    name: "index.html",
    path: "lab/index.html",
    revision: "turn-2:0",
    status: "updating",
  }]);
});

test("校验工具异常后再次生成时保留上一轮最后安全草稿", () => {
  const firstHtml = `${COMPLETE_HTML}<script>window.started = true</script>`;
  const secondHtml = "<!doctype html><html><head><style>body{background:#000}";
  const messages = [
    {
      id: "turn-1",
      role: "assistant",
      parts: [
        {
          type: "text",
          state: "done",
          text: createWishCreatorHtmlArtifactEnvelope("lab/index.html", firstHtml),
        },
        {
          type: "dynamic-tool",
          state: "output-error",
          toolCallId: "validate-1",
          toolName: "validate_html",
          input: { artifactPath: "lab/index.html" },
          errorText: "校验服务暂时不可用",
        },
      ],
    },
    {
      id: "turn-2",
      role: "assistant",
      parts: [{
        type: "text",
        state: "streaming",
        text: createWishCreatorHtmlArtifactEnvelope("lab/index.html", secondHtml),
      }],
    },
  ] as unknown as readonly EveMessage[];

  const [artifact] = extractHtmlArtifacts(messages);

  assert.equal(artifact?.fallbackHtml, createSafeHtmlDraftSnapshot(firstHtml));
  assert.equal(artifact?.fallbackStatus, "draft");
  assert.equal(artifact?.fallbackHtml?.includes("window.started"), false);
});

test("草稿预览禁用脚本，完整版本允许内联脚本", () => {
  const draft = preparePreviewDocument(COMPLETE_HTML, { interactive: false });
  const ready = preparePreviewDocument(COMPLETE_HTML, { interactive: true });
  assert.match(draft, /script-src 'none'/u);
  assert.match(ready, /script-src 'unsafe-inline'/u);
});
