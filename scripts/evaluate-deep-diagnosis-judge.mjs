import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const outDir = mkdtempSync(join(tmpdir(), "deep-diagnosis-judge-"));

execFileSync(
  "pnpm",
  [
    "exec",
    "tsc",
    "lib/deep-diagnosis/report-quality.ts",
    "--ignoreConfig",
    "--target",
    "ES2022",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--outDir",
    outDir,
    "--skipLibCheck",
    "--noEmitOnError",
  ],
  { stdio: "pipe" },
);

const { judgeDeepDiagnosisReportText } = await import(pathToFileURL(join(outDir, "report-quality.js")));
const goodReport = readFileSync(new URL("./fixtures/deep-diagnosis/content-creation.good.md", import.meta.url), "utf8");
const hollowReport = readFileSync(
  new URL("./fixtures/deep-diagnosis/keyword-stuffed-hollow-report.bad.md", import.meta.url),
  "utf8",
);

const goodJudge = judgeDeepDiagnosisReportText(goodReport);
const hollowJudge = judgeDeepDiagnosisReportText(hollowReport);
const checks = [
  {
    name: "golden report 可以通过 Judge",
    passed: goodJudge.verdict === "pass" && goodJudge.canCallCompleteReport && goodJudge.score >= 90,
    detail: JSON.stringify({ score: goodJudge.score, verdict: goodJudge.verdict, blockers: goodJudge.blockerLabels }),
  },
  {
    name: "关键词堆砌空洞报告不能通过 Judge",
    passed: hollowJudge.verdict !== "pass" && !hollowJudge.canCallCompleteReport && hollowJudge.blockerLabels.length > 0,
    detail: JSON.stringify({ score: hollowJudge.score, verdict: hollowJudge.verdict, blockers: hollowJudge.blockerLabels }),
  },
  {
    name: "空洞报告必须命中反模式修订建议",
    passed: hollowJudge.revisionHints.some((hint) => /空洞|越权|建议加强|形成闭环|根据实际情况/.test(hint)),
    detail: hollowJudge.revisionHints.slice(0, 3).join("；"),
  },
];

for (const check of checks) {
  if (check.passed) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ ${check.name}：${check.detail}`);
  }
}

if (checks.some((check) => !check.passed)) {
  process.exitCode = 1;
}
