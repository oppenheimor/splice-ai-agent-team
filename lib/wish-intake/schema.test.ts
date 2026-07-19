import assert from "node:assert/strict";
import test from "node:test";
import { wishSummaryDraftSchema, wishSummarySchema } from "./schema.ts";

const incompleteModelSummary = {
  title: "财务系统",
  goal: "做一个财务系统来管理财务数据",
  usageScenario: "用于管理财务数据",
  currentProblem: "",
  idealResult: "",
  constraints: "",
};

test("AI 摘要草稿允许尚未聊清楚的字段为空", () => {
  assert.deepEqual(wishSummaryDraftSchema.parse(incompleteModelSummary), incompleteModelSummary);
});

test("最终提交仍要求关键愿望信息完整", () => {
  const result = wishSummarySchema.safeParse(incompleteModelSummary);
  assert.equal(result.success, false);
});
