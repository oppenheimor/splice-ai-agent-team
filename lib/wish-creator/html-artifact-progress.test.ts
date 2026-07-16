import assert from "node:assert/strict";
import test from "node:test";
import { resolveHtmlArtifactProgressStage } from "./html-artifact-progress.ts";

test("校验工具异常显示为重试而不是内容需要修正", () => {
  assert.equal(resolveHtmlArtifactProgressStage({
    artifactStreaming: false,
    busy: true,
    validationState: "output-error",
  }), "retrying");
  assert.equal(resolveHtmlArtifactProgressStage({
    artifactStreaming: false,
    busy: false,
    validationState: "output-error",
  }), "validation-error");
});

test("只有明确的 invalid 结果显示内容需要修正", () => {
  assert.equal(resolveHtmlArtifactProgressStage({
    artifactStreaming: false,
    busy: true,
    validationState: "output-available",
    validationValid: false,
  }), "needs-correction");
  assert.equal(resolveHtmlArtifactProgressStage({
    artifactStreaming: false,
    busy: false,
    validationState: "output-available",
    validationValid: true,
  }), "completed");
  assert.equal(resolveHtmlArtifactProgressStage({
    artifactStreaming: false,
    busy: false,
    validationState: "output-available",
  }), "incomplete");
});
