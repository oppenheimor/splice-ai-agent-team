import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fixturesDir = fileURLToPath(new URL("./fixtures/deep-diagnosis/conversations", import.meta.url));
const files = readdirSync(fixturesDir)
  .filter((file) => file.endsWith(".bad.md"))
  .sort();

const requiredByFile = {
  "open-context-choice-mismatch.bad.md": [
    "nextAction: ask_open_context",
    "inputMode: text",
    "forbiddenPhrases: 请选择、多选 2-5 个、出完整方案",
  ],
  "pending-facts-complete-report.bad.md": [
    "nextAction: ask_missing_facts",
    "maxReportLevel: hypothesis_brief",
    "forbiddenPhrases: 出完整方案、完整诊断书",
  ],
  "customization-overtrigger.bad.md": [
    "canMentionCustomization: true",
    "canRecommendCustomization: false",
    "forbiddenPhrases: 建议定制、建议做系统 / Agent 定制",
  ],
};

const results = files.map((file) => {
  const source = readFileSync(join(fixturesDir, file), "utf8");
  const required = requiredByFile[file] || ["应被策略层拦截"];
  const missing = required.filter((item) => !source.includes(item));
  return { file, passed: missing.length === 0, missing };
});

for (const result of results) {
  if (result.passed) {
    console.log(`✓ ${result.file}`);
  } else {
    console.error(`✗ ${result.file}：缺少 ${result.missing.join("、")}`);
  }
}

if (results.some((result) => !result.passed)) {
  process.exitCode = 1;
}
