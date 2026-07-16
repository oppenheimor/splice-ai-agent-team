import assert from "node:assert/strict";
import test from "node:test";
import {
  canRenderHtmlArtifact,
  createRequirementPathClientContext,
  filterBlockedHtmlArtifacts,
  isRequirementImplementationRelease,
  shouldBlockHtmlArtifact,
  shouldGateInitialRequirement,
} from "./requirement-gate.ts";

test("空会话的首条需求必须先进入创建方式选择", () => {
  assert.equal(shouldGateInitialRequirement(0, true), true);
});

test("已有消息的会话不重复进入创建方式选择", () => {
  assert.equal(shouldGateInitialRequirement(1, true), false);
  assert.equal(shouldGateInitialRequirement(8, true), false);
});

test("空会话中的普通问答没有显式创建意图时不进入门禁", () => {
  assert.equal(shouldGateInitialRequirement(0, false), false);
});

test("直接创建路径明确跳过需求访谈", () => {
  const context = createRequirementPathClientContext("direct");

  assert.match(context, /用户选择：直接创建/);
  assert.match(context, /禁止调用 `ask_question`/);
  assert.match(context, /不要加载 `grill-me`/);
  assert.doesNotMatch(context, /必须加载 `grill-me`/);
});

test("需求拆解路径必须进入 grill-me 且不能提前生成", () => {
  const context = createRequirementPathClientContext("clarify");

  assert.match(context, /用户选择：先拆解需求/);
  assert.match(context, /必须加载 `grill-me`/);
  assert.match(context, /本轮禁止生成 HTML artifact/);
  assert.doesNotMatch(context, /不要加载 `grill-me`/);
});

test("需求拆解未确认完成前不渲染 HTML artifact", () => {
  assert.equal(canRenderHtmlArtifact("hydrating"), false);
  assert.equal(canRenderHtmlArtifact("awaiting-choice"), false);
  assert.equal(canRenderHtmlArtifact("grilling"), false);
  assert.equal(canRenderHtmlArtifact("released"), true);
});

test("hydrating 只暂时隐藏预览，不把历史合法 artifact 判为越权", () => {
  assert.equal(shouldBlockHtmlArtifact("hydrating"), false);
  assert.equal(shouldBlockHtmlArtifact("awaiting-choice"), true);
  assert.equal(shouldBlockHtmlArtifact("grilling"), true);
  assert.equal(shouldBlockHtmlArtifact("released"), false);
});

test("只有 grill-me 的最终开始实现选项可以释放生成门禁", () => {
  assert.equal(isRequirementImplementationRelease([
    { optionId: "wish-creator-start-implementation", requestId: "request-1" },
  ]), true);
  assert.equal(isRequirementImplementationRelease([
    { optionId: "wish-creator-continue-clarifying", requestId: "request-1" },
  ]), false);
});

test("释放生成门禁后仍永久过滤此前阻断的 artifact revision", () => {
  const artifacts = [
    { path: "lab/index.html", revision: "blocked-revision" },
    { path: "lab/index.html", revision: "released-revision" },
  ];

  assert.deepEqual(
    filterBlockedHtmlArtifacts(artifacts, new Set(["blocked-revision"])),
    [{ path: "lab/index.html", revision: "released-revision" }],
  );
});
