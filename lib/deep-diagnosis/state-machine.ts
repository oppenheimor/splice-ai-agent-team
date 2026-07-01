export type DeepDiagnosisState =
  | "entry"
  | "scope_selection"
  | "horizontal_scan"
  | "external_research"
  | "fact_confirmation"
  | "solution_design"
  | "quality_gate"
  | "report_delivery"
  | "taskification";

export type DeepDiagnosisStateGate = {
  state: DeepDiagnosisState;
  label: string;
  mustHaveBeforeExit: string[];
  blockedIfMissing: boolean;
};

export const DEEP_DIAGNOSIS_STATE_GATES: DeepDiagnosisStateGate[] = [
  {
    state: "scope_selection",
    label: "诊断范围等级",
    mustHaveBeforeExit: ["入口范围路由", "报告级别", "诊断范围", "未覆盖区域"],
    blockedIfMissing: true,
  },
  {
    state: "entry",
    label: "业务上下文收集",
    mustHaveBeforeExit: ["业务类型", "用户角色", "当前阶段", "开放文本和选择卡片不能同轮混用"],
    blockedIfMissing: true,
  },
  {
    state: "horizontal_scan",
    label: "横向扫描门禁",
    mustHaveBeforeExit: ["至少 3 个候选业务环节", "可比较评分", "暂不建议方向"],
    blockedIfMissing: true,
  },
  {
    state: "external_research",
    label: "外部证据门禁",
    mustHaveBeforeExit: ["覆盖范围声明", "原始引用链", "反例或不适配证据", "工具失败声明"],
    blockedIfMissing: true,
  },
  {
    state: "fact_confirmation",
    label: "关键事实确认",
    mustHaveBeforeExit: ["已确认事实", "待确认事实", "未覆盖区域", "用户确认或显式跳过"],
    blockedIfMissing: true,
  },
  {
    state: "report_delivery",
    label: "完整报告就绪",
    mustHaveBeforeExit: ["最小事实包", "当前基线", "真实样本或明确缺失", "目标指标", "资源约束", "反选原因已确认"],
    blockedIfMissing: true,
  },
  {
    state: "quality_gate",
    label: "报告质量门禁",
    mustHaveBeforeExit: ["完整性评分", "可信度评分", "行动性评分", "失败分支"],
    blockedIfMissing: true,
  },
  {
    state: "taskification",
    label: "下一步任务化",
    mustHaveBeforeExit: ["本周任务", "负责人", "验收标准"],
    blockedIfMissing: false,
  },
];

export function formatDeepDiagnosisStateGatesForPrompt(): string {
  return DEEP_DIAGNOSIS_STATE_GATES
    .map((gate, index) => {
      const mode = gate.blockedIfMissing ? "阻塞门禁" : "非阻塞补强";
      return `${index + 1}. ${gate.label}（${mode}）：离开前必须具备：${gate.mustHaveBeforeExit.join("、")}。`;
    })
    .join("\n");
}
