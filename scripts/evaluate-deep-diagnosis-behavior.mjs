import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const outDir = mkdtempSync(join(tmpdir(), "deep-diagnosis-behavior-"));

try {
  execFileSync("pnpm", [
    "exec",
    "tsc",
    "--ignoreConfig",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--target",
    "ES2023",
    "--lib",
    "ES2023",
    "--jsx",
    "react-jsx",
    "--esModuleInterop",
    "--skipLibCheck",
    "--strict",
    "false",
    "--outDir",
    outDir,
    "lib/deep-diagnosis/runtime-state.ts",
    "lib/deep-diagnosis/runtime-events.ts",
    "lib/deep-diagnosis/decision/policy.ts",
    "lib/deep-diagnosis/decision/state.ts",
    "lib/deep-diagnosis/decision/types.ts",
    "lib/deep-diagnosis/deliverable-readiness.ts",
    "lib/deep-diagnosis/report-readiness.ts",
    "lib/deep-diagnosis/fact-card.ts",
    "lib/deep-diagnosis/evidence-view.ts",
    "lib/deep-diagnosis/runtime-quality-gate.ts",
    "lib/deep-diagnosis/report-quality.ts",
    "lib/deep-diagnosis/state-machine.ts",
    "lib/deep-diagnosis/protocol-data.ts",
  ], { stdio: "ignore" });

  const { buildDeepDiagnosisRuntimeState } = await import(pathToFileURL(join(outDir, "runtime-state.js")));
  const { decideNextDeepDiagnosisAction } = await import(pathToFileURL(join(outDir, "decision/policy.js")));

  const checks = [
    assertCase("入口选项不等于用户已选择", [
      user("我想诊断"),
      tool("askUserChoice", {
        question: "选范围",
        mode: "single",
        options: [
          { id: "overview_scan", label: "先全局盘点" },
          { id: "focused_deep_dive", label: "聚焦一个问题" },
        ],
      }, {}),
    ], ({ state, decision }) => (
      !state.entryRoute.hasScopeRoute
      && decision.nextAction === "ask_scope_route"
    )),
    assertCase("否定完整报告不触发生成意图", [
      user("不要现在给我完整诊断书，先问问题。"),
    ], ({ state, decision }) => (
      !state.progress.hasGenerateReportIntent
      && decision.nextAction === "ask_scope_route"
    )),
    assertCase("计划做横向扫描不算已完成横扫", [
      user("我想知道先做哪个"),
      assistant("我需要先做横向扫描，至少 3 个候选业务环节，并用可比较评分。"),
    ], ({ state }) => !state.progress.hasHorizontalScan),
    assertCase("空 counterEvidence 不算有反例", [
      user("帮我查行业案例"),
      tool("webSearch", { query: "茶饮 AI 客服 案例" }, {
        results: [{ title: "某茶饮 AI 客服案例", url: "https://example.com/case", content: "这是一个比较长的案例摘要，介绍 AI 客服如何提升响应效率。" }],
        compiledEvidence: {
          coverage: { searchedQuestions: ["茶饮 AI 客服 案例"], coveredSourceTypes: ["案例文章"], uncoveredSourceTypes: ["用户后台数据"] },
          evidence: [{ sourceTitle: "某茶饮 AI 客服案例", sourceUrl: "https://example.com/case", rawExcerpt: "摘要", evidenceLevel: "B", caution: "未发现明显不适配条件" }],
          counterEvidence: [],
          unverifiedGaps: ["缺少用户一手经营数据时，外部资料只能作为对照，不能替代现场事实。"],
        },
      }),
    ], ({ state }) => !state.evidenceView.hasCounterEvidence && !state.progress.hasEvidenceCoverage),
    assertCase("用户否定外部资料不触发外部证据门禁", [
      user("不要查行业趋势，也不要外部资料，先看我的现场。"),
    ], ({ state, decision }) => (
      !state.progress.externalResearchRequired
      && !decision.hardBlocks.some((block) => block.includes("外部资料"))
    )),
    assertCase("待确认事实存在时事实准确不算 confirmed", [
      user("我是做教培的老板，做了 3 年，每周 20 个咨询，目标提升转化，预算 0 元，最近一次真实样本是家长嫌回复慢，深挖方向是获客。"),
      assistant("已确认事实：教培老板。待确认事实：预算。未覆盖区域：复购。"),
      user("事实准确"),
    ], ({ state }) => (
      state.factCard.confirmationState !== "confirmed"
      && state.reportReadiness.hasBlockingPendingFacts
    )),
    assertCase("认可当前简报只触发发布确认，不直接发布", [
      user("我选择聚焦一个问题深挖。餐饮 深圳区负责人 做了 10 年。排班与人力调配，10 家店，每家 20 人，全职，通班，每周排班 3 小时，目标是统一排班标准。"),
      assistant("排班优化假设简报。诊断范围：单问题诊断，未覆盖库存和获客。当前基线：10 家门店，每家约 20 人，每周排班 30 小时。第一瓶颈：执行不稳 + 工具错配。根因：没有统一排班规则。落地路径：第一步 7 天内定编、定休、定时、定岗。可用资产：排班规则标准化清单。效果验证：验证指标为每周排班总耗时，成功阈值降到每周 5 小时以内，失败阈值超过 15 小时。"),
      user("听你的"),
    ], ({ state, decision }) => (
      state.deliverableReadiness.canOfferPublish
      && !state.deliverableReadiness.confirmedToPublish
      && decision.nextAction === "offer_current_deliverable_publish"
      && decision.inputMode === "single_choice"
    )),
    assertCase("用户确认发布当前简报后才允许发布 HTML", [
      user("我选择聚焦一个问题深挖。餐饮 深圳区负责人 做了 10 年。排班与人力调配，10 家店，每家 20 人，全职，通班，每周排班 3 小时，目标是统一排班标准。"),
      assistant("排班优化假设简报。诊断范围：单问题诊断，未覆盖库存和获客。当前基线：10 家门店，每家约 20 人，每周排班 30 小时。第一瓶颈：执行不稳 + 工具错配。根因：没有统一排班规则。落地路径：第一步 7 天内定编、定休、定时、定岗。可用资产：排班规则标准化清单。效果验证：验证指标为每周排班总耗时，成功阈值降到每周 5 小时以内，失败阈值超过 15 小时。"),
      user("听你的"),
      tool("askUserChoice", { question: "是否发布当前简报？" }, {
        selectedIds: ["publish_current_deliverable"],
        selectedLabels: ["发布当前简报为 HTML"],
      }),
    ], ({ state, decision }) => (
      state.deliverableReadiness.confirmedToPublish
      && decision.nextAction === "publish_current_deliverable"
      && decision.inputMode === "none"
      && decision.forbiddenPhrases.includes("完整诊断书")
    )),
  ];

  for (const check of checks) {
    if (check.passed) {
      console.log(`✓ ${check.name}`);
    } else {
      console.error(`✗ ${check.name}`);
      process.exitCode = 1;
    }
  }

  function assertCase(name, messages, predicate) {
    const state = buildDeepDiagnosisRuntimeState(messages);
    const decision = decideNextDeepDiagnosisAction(messages);
    return { name, passed: Boolean(predicate({ state, decision })) };
  }
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

function user(text) {
  return { role: "user", parts: [{ type: "text", text }] };
}

function assistant(text) {
  return { role: "assistant", parts: [{ type: "text", text }] };
}

function tool(name, input, output) {
  return { role: "assistant", parts: [{ type: `tool-${name}`, input, output }] };
}
