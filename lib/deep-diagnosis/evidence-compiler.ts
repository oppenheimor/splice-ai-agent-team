export type DeepDiagnosisEvidenceLevel = "A" | "B" | "C" | "D";

export type DeepDiagnosisCompiledEvidence = {
  id: string;
  finding: string;
  sourceTitle: string;
  sourceUrl?: string;
  rawExcerpt: string;
  evidenceLevel: DeepDiagnosisEvidenceLevel;
  appliesBecause: string;
  caution: string;
  diagnosticImpact: string;
};

export type DeepDiagnosisEvidenceCoverage = {
  searchedQuestions: string[];
  coveredSourceTypes: string[];
  uncoveredSourceTypes: string[];
  toolFailure?: string;
};

export type DeepDiagnosisEvidenceCompilation = {
  coverage: DeepDiagnosisEvidenceCoverage;
  evidence: DeepDiagnosisCompiledEvidence[];
  counterEvidence: DeepDiagnosisCompiledEvidence[];
  unverifiedGaps: string[];
};

type WebSearchResultLike = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type WebSearchOutputLike = {
  answer?: string | null;
  warning?: string;
  results?: WebSearchResultLike[];
};

export function compileWebSearchEvidence(input: {
  searchedQuestions: string[];
  output: WebSearchOutputLike;
  uncoveredSourceTypes?: string[];
}): DeepDiagnosisEvidenceCompilation {
  const results = Array.isArray(input.output.results) ? input.output.results : [];
  const evidence = results.slice(0, 6).map((result, index) => compileResult(result, index));
  const counterEvidence = evidence.filter((item) => item.caution !== "未发现明显不适配条件").slice(0, 2);

  return {
    coverage: {
      searchedQuestions: input.searchedQuestions,
      coveredSourceTypes: inferCoveredSourceTypes(results),
      uncoveredSourceTypes: input.uncoveredSourceTypes || ["用户后台数据", "本地真实竞品数据", "用户一手经营数据"],
      toolFailure: input.output.warning,
    },
    evidence,
    counterEvidence,
    unverifiedGaps: buildUnverifiedGaps(input.output.warning, evidence.length),
  };
}

export function formatEvidenceCompilerForPrompt(): string {
  return [
    "外部资料必须先编译成证据块，再进入诊断结论。",
    "证据块固定字段：发现、来源标题、URL、原始摘要、证据等级、适用于用户的原因、不适用或需谨慎的地方、对诊断结论的影响。",
    "coverage 固定字段：搜索问题、已覆盖来源类型、未覆盖来源类型、工具失败状态。",
    "证据等级规则：A=官方/一手/权威报告；B=可信行业报告或可核验案例；C=普通网页或多来源弱交叉；D=来源弱、过期、广告软文或工具失败。",
    "没有完整证据块的外部结论，最多只能作为 C 级推断。",
  ].join("\n");
}

function compileResult(result: WebSearchResultLike, index: number): DeepDiagnosisCompiledEvidence {
  const rawExcerpt = normalizeExcerpt(result.content || "");
  return {
    id: `ev-${index + 1}`,
    finding: rawExcerpt || result.title || "外部资料未提供足够摘要",
    sourceTitle: result.title || "未命名来源",
    sourceUrl: result.url,
    rawExcerpt,
    evidenceLevel: inferEvidenceLevel(result),
    appliesBecause: "需要结合用户现场事实复核，不能直接当作用户业务事实。",
    caution: inferCaution(result),
    diagnosticImpact: "只能用于加强、削弱或触发追问，不得单独决定最终优先级。",
  };
}

function inferEvidenceLevel(result: WebSearchResultLike): DeepDiagnosisEvidenceLevel {
  const url = result.url || "";
  const title = result.title || "";
  if (/(gov|edu|org|mckinsey|gartner|forrester|官方|白皮书|报告)/i.test(url + title)) return "A";
  if (/(case|案例|研究|数据|report|insight|trend|趋势)/i.test(url + title)) return "B";
  if (result.score && result.score < 0.35) return "D";
  return "C";
}

function inferCoveredSourceTypes(results: WebSearchResultLike[]): string[] {
  const sourceTypes = new Set<string>();
  for (const result of results) {
    const text = `${result.title || ""} ${result.url || ""}`;
    if (/官方|gov|edu/i.test(text)) sourceTypes.add("官方 / 权威来源");
    if (/报告|数据|insight|trend|趋势/i.test(text)) sourceTypes.add("行业报告 / 数据文章");
    if (/案例|case/i.test(text)) sourceTypes.add("案例文章");
    if (/blog|博客|articles?/i.test(text)) sourceTypes.add("普通网页 / 博客");
    if (/youzan|larksuite|canva|openai|anthropic/i.test(text)) sourceTypes.add("工具或 SaaS 厂商内容");
  }

  return sourceTypes.size ? Array.from(sourceTypes) : ["普通网页"];
}

function inferCaution(result: WebSearchResultLike): string {
  const text = `${result.title || ""} ${result.url || ""} ${result.content || ""}`;
  if (/广告|推广|营销|销售|获取免费咨询|联系我们|价格方案/i.test(text)) {
    return "可能包含厂商营销倾向，需要降权使用。";
  }
  if (!result.url) return "缺少 URL，不能作为强证据。";
  if (!result.content || result.content.length < 80) return "摘要过短，需要继续补证。";
  return "未发现明显不适配条件";
}

function buildUnverifiedGaps(warning: string | undefined, evidenceCount: number): string[] {
  const gaps = [];
  if (warning) gaps.push(`工具失败或警告：${warning}`);
  if (evidenceCount === 0) gaps.push("没有可用外部来源，不能声称已完成外部验证。");
  gaps.push("缺少用户一手经营数据时，外部资料只能作为对照，不能替代现场事实。");
  return gaps;
}

function normalizeExcerpt(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 360);
}
