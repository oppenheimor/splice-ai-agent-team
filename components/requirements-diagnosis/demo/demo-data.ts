import type { DiagnosisResult } from "@/lib/requirements-diagnosis/types";

export type DiagnosisDemoStyleId = "demo-consulting" | "demo-instrument" | "demo-boardroom";

export type DiagnosisDemoStyle = {
  id: DiagnosisDemoStyleId;
  label: string;
  thesis: string;
  basePath: string;
  shell: string;
  surface: string;
  raised: string;
  ink: string;
  badge: string;
  outlineBadge: string;
  primaryButton: string;
  secondaryButton: string;
  metric: string;
  muted: string;
  strong: string;
  accent: string;
  accentText: string;
  divider: string;
  font: string;
};

export const demoStyles: Record<DiagnosisDemoStyleId, DiagnosisDemoStyle> = {
  "demo-consulting": {
    id: "demo-consulting",
    label: "Mono Capsule",
    thesis: "黑白灰移动端问卷，靠胶囊控件、厚重选中态和底部 CTA 建立真实触控产品感。",
    basePath: "/requirements-diagnosis/demo-consulting",
    shell: "min-h-screen bg-[#20242c] text-[#f4f4f1] [background-image:radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_22rem),radial-gradient(circle_at_80%_90%,rgba(255,255,255,0.06),transparent_24rem)]",
    surface: "rounded-[28px] border border-[#eeeeea] bg-[#f7f7f3] text-[#222322] shadow-[0_18px_50px_rgba(0,0,0,0.08)]",
    raised: "rounded-[32px] bg-[#ffffff] text-[#222322] shadow-[0_24px_80px_rgba(0,0,0,0.22)]",
    ink: "rounded-[28px] bg-[#2e2f2d] text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),0_12px_30px_rgba(0,0,0,0.2)]",
    badge: "rounded-full bg-[#f0f0ed] px-3 py-1 text-[11px] font-black tracking-[0.04em] text-[#2e2f2d]",
    outlineBadge: "rounded-full border border-[#d8d8d3] px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#6b6c68]",
    primaryButton: "rounded-full bg-[#2e2f2d] !text-white shadow-[0_14px_26px_rgba(46,47,45,0.18)] hover:bg-[#1f201f]",
    secondaryButton: "rounded-full border-0 bg-[#f0f0ed] !text-[#2e2f2d] hover:bg-[#e8e8e4]",
    metric: "rounded-[24px] bg-[#f0f0ed] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_18px_rgba(0,0,0,0.04)]",
    muted: "text-[#8a8a86]",
    strong: "text-[#222322]",
    accent: "#2e2f2d",
    accentText: "text-[#2e2f2d]",
    divider: "h-px w-full bg-[#ecece8]",
    font: "font-black",
  },
  "demo-instrument": {
    id: "demo-instrument",
    label: "Native Finance",
    thesis: "白底金融 App 质感，浅灰模块、蓝色单点强调、底部付款式 CTA，让诊断像专业工具。",
    basePath: "/requirements-diagnosis/demo-instrument",
    shell: "min-h-screen bg-[#050716] text-white [background-image:radial-gradient(circle_at_18%_16%,rgba(47,92,229,0.2),transparent_24rem),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.08),transparent_24rem)]",
    surface: "rounded-[26px] border border-[#edf0f6] bg-white text-[#11131a] shadow-[0_18px_60px_rgba(26,38,80,0.08)]",
    raised: "rounded-[34px] bg-white text-[#11131a] shadow-[0_30px_90px_rgba(0,0,0,0.28)]",
    ink: "rounded-[28px] bg-[#2f5be7] text-white shadow-[0_18px_36px_rgba(47,91,231,0.28)]",
    badge: "rounded-full bg-[#eef3ff] px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#2f5be7]",
    outlineBadge: "rounded-full border border-[#dfe4f0] px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#7b8190]",
    primaryButton: "rounded-full bg-[#2f5be7] !text-white shadow-[0_16px_28px_rgba(47,91,231,0.26)] hover:bg-[#244bd2]",
    secondaryButton: "rounded-full border border-[#edf0f6] bg-white !text-[#11131a] hover:bg-[#f6f7fb]",
    metric: "rounded-[24px] border border-[#edf0f6] bg-[#f7f8fb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
    muted: "text-[#8b8f9c]",
    strong: "text-[#11131a]",
    accent: "#2f5be7",
    accentText: "text-[#2f5be7]",
    divider: "h-px w-full bg-[#edf0f6]",
    font: "font-semibold",
  },
  "demo-boardroom": {
    id: "demo-boardroom",
    label: "Editorial Form",
    thesis: "纸质商业问卷和编辑部排版气质，弱化 App 装饰，让判断过程像一份可填写的诊断页。",
    basePath: "/requirements-diagnosis/demo-boardroom",
    shell: "min-h-screen bg-[#221f1a] text-[#fbf4e7] [background-image:linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),radial-gradient(circle_at_15%_10%,rgba(190,147,91,0.14),transparent_26rem)] [background-size:42px_42px,auto]",
    surface: "rounded-none border border-[#d8cbb4] bg-[#fff8ea] text-[#27231d] shadow-[10px_10px_0_rgba(39,35,29,0.08)]",
    raised: "rounded-[4px] bg-[#fff8ea] text-[#27231d] shadow-[0_28px_90px_rgba(0,0,0,0.26)]",
    ink: "rounded-none bg-[#27231d] text-[#fff8ea] shadow-[8px_8px_0_rgba(190,147,91,0.24)]",
    badge: "rounded-none border border-[#27231d] bg-[#fff8ea] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#27231d]",
    outlineBadge: "rounded-none border border-[#bda982] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7b6644]",
    primaryButton: "rounded-none bg-[#27231d] !text-[#fff8ea] shadow-[5px_5px_0_#bea06e] hover:bg-[#181611]",
    secondaryButton: "rounded-none border border-[#d8cbb4] bg-[#fff8ea] !text-[#27231d] hover:bg-[#f4ead8]",
    metric: "rounded-none border border-[#d8cbb4] bg-[#fff2d9] p-4",
    muted: "text-[#776b58]",
    strong: "text-[#27231d]",
    accent: "#9a6a2f",
    accentText: "text-[#9a6a2f]",
    divider: "h-px w-full bg-[#d8cbb4]",
    font: "font-serif",
  },
};

export const demoResult: DiagnosisResult = {
  answers: {
    q1: "A",
    q2: "C",
    q3: "B",
    q4: "C",
    q13: "C",
    q5: "A",
    q6: "B",
    q7: "C",
    q8: "B",
    q9: "C",
    q10: ["A", "B", "C"],
    q11: ["A", "C", "D", "F"],
    q12: "C",
    q14: "B",
    q15: "C",
    q16: "D",
    q17: "C",
    q18: "B",
    q19: "C",
    q20: "B",
    q21: "D",
    q22: "D",
    q23: "C",
    q24: "A",
  },
  dimensionScores: {
    V: {
      code: "V",
      label: "商业视野",
      leftLabel: "深耕",
      rightLabel: "拓展",
      leftLetter: "D",
      rightLetter: "E",
      left: 64,
      right: 36,
      dominantLetter: "D",
      dominantLabel: "深耕",
      diff: 28,
      stars: 2,
    },
    D: {
      code: "D",
      label: "判断方式",
      leftLabel: "经验判断",
      rightLabel: "数据验证",
      leftLetter: "G",
      rightLetter: "P",
      left: 38,
      right: 62,
      dominantLetter: "P",
      dominantLabel: "数据验证",
      diff: 24,
      stars: 2,
    },
    E: {
      code: "E",
      label: "组织落地",
      leftLabel: "系统重构",
      rightLabel: "快速试水",
      leftLetter: "R",
      rightLetter: "A",
      left: 46,
      right: 54,
      dominantLetter: "A",
      dominantLabel: "平衡",
      diff: 8,
      stars: 4,
    },
    A: {
      code: "A",
      label: "投入心智",
      leftLabel: "成本优先",
      rightLabel: "长期投入",
      leftLetter: "C",
      rightLetter: "L",
      left: 58,
      right: 42,
      dominantLetter: "C",
      dominantLabel: "平衡",
      diff: 16,
      stars: 3,
    },
    B: {
      code: "B",
      label: "风险策略",
      leftLabel: "风险防守",
      rightLabel: "创新进攻",
      leftLetter: "S",
      rightLetter: "I",
      left: 55,
      right: 45,
      dominantLetter: "S",
      dominantLabel: "平衡",
      diff: 10,
      stars: 4,
    },
  },
  featureCode: "DP",
  operatorCode: "DP-EP",
  operatorTypeName: "数据验证型",
  operatorTypeDefinition: "重视拆解、数据和可复制性，适合从流程指标和自动化看板切入。你的辅助倾向是「深耕」，适合把主优势和第二优势组合成一个可落地的小切口。",
  operatorType: {
    code: "P",
    name: "数据验证型",
    definition: "重视拆解、数据和可复制性，适合从流程指标和自动化看板切入。你的辅助倾向是「深耕」，适合把主优势和第二优势组合成一个可落地的小切口。",
    primaryTrait: "数据验证",
    secondaryTrait: "深耕",
  },
  aiAdoptionStage: "L4",
  aiAdoptionStageLabel: "工具瓶颈层",
  aiReadiness: {
    total: 72,
    level: "L4",
    label: "工具瓶颈层",
    summary: "你有丰富的工具经验，但工作流整合还有提升空间——这是从「会用」到「用好」的关键节点。",
    axes: {
      attitude: { code: "attitude", label: "AI 态度", score: 75, level: "高", insight: "认可 AI 价值，准备系统化落地。深度诊断可以直接规划工作流。" },
      usage: { code: "usage", label: "使用强度", score: 65, level: "高", insight: "每天 2-4 小时，AI 已经进入工作流的重要部分。" },
      workflow: { code: "workflow", label: "工作流融合", score: 75, level: "高", insight: "多个场景已经有固定用法，下一步是形成系统闭环。" },
      tooling: { code: "tooling", label: "工具成熟度", score: 70, level: "高", insight: "已使用聊天工具、低代码搭建工具、代码类 AI 工具，工具覆盖度较广，可考虑整合成系统工作流。" },
    },
  },
  aiConcern: { code: "B", label: "商业落地关注", description: "你更关注 AI 能带来哪些可量化的业务结果，适合在深度诊断中直接聚焦场景 ROI 和交付方案。" },
  aiLandingPreference: { code: "C", label: "小流程验证", description: "你更倾向先跑通一个小场景，深度诊断适合直接定位第一个可落地的自动化流程。" },
  aiBlocker: { code: "A", label: "场景不清晰", description: "不知道从哪个业务场景开始——深度诊断会帮你定位 3 个最值得试点的优先场景。" },
  landingPriority: {
    code: "C",
    label: "客户转化与服务",
    description: "客服、销售和私域运营是人力密集型场景，AI 能显著提升响应速度和覆盖密度。",
    firstStep: "梳理一条客户跟进流程，把重复性回复和阶段推进动作提取出来交给 AI 辅助。",
  },
  userType: "EP",
  userTypeLabel: "企业家实用派",
  cognitiveWidth: "拓展认知",
  blindSpots: ["让 AI 做市场调研、竞品分析和数据整理，减少拍脑袋决策", "让 AI 管理订单、库存和排期，把零散流程接成系统"],
  justNeed: "C",
  justNeedLabel: "客户转化与服务",
  crowdType: "有基础遇瓶颈企业主",
  recommendation: {
    title: "从一个高频流程切入企业 AI 闭环",
    description: "不要先做全公司 AI 化。先选一个高频、可计量、能复盘的流程，完成从数据、工具、人员到指标的最小闭环。",
    hook: "推荐优先做一条 30 天可验收的 AI 业务流程样板线。",
  },
  narrative: {
    actionInsights: [
      "你的优势不是懂很多工具，而是能判断哪个工具值得进入业务流程。",
      "最需要防范的是试点成功后没有制度化沉淀，导致每次都重新开始。",
      "你适合把 AI 改造拆成流程、指标、责任人、复盘节奏四个部分。",
      "投入心智偏短期，初期选场景要清晰量化，让每次试点都能给出明确结论。",
      "风险策略比较平衡，适合先做低风险试点，用结果说服内部再扩大范围。",
    ],
    actionPlan: {
      week: "选一个高频重复流程，列出输入、输出、负责人、耗时和质量标准。",
      month: "完成一个 AI 辅助流程试点，并用至少 3 个指标评估节省时间、错误率和交付稳定性。",
      ongoing: "把有效提示词、工具组合、审批规则和复盘记录沉淀成组织资产。",
    },
    closing: {
      technology: "AI 不是替代你判断的机器，而是放大你经营结构感的杠杆。",
      philosophy: "先让一个流程变稳，再让一组流程变快。",
      quote: "真正的转型不是装上工具，而是让组织多一种可靠的工作方式。",
    },
  },
};

export const demoHistory = [
  {
    id: "demo-record-1",
    createdAt: "2026-05-28T09:30:00.000Z",
    result: demoResult,
    chatStatus: "active",
    messageCount: 8,
  },
  {
    id: "demo-record-2",
    createdAt: "2026-05-21T15:12:00.000Z",
    result: {
      ...demoResult,
      operatorCode: "S-EP",
      operatorTypeName: "风险防守型",
      operatorTypeDefinition: "关注稳定和边界，适合低风险场景、权限清晰、可控试点。",
      operatorType: {
        code: "S",
        name: "风险防守型",
        definition: "关注稳定和边界，适合低风险场景、权限清晰、可控试点。",
        primaryTrait: "风险防守",
        secondaryTrait: null,
      },
      aiAdoptionStage: "L3",
      aiAdoptionStageLabel: "单点应用层",
    },
    chatStatus: "archived",
    messageCount: 4,
  },
];

export function getDemoStyle(styleId: string): DiagnosisDemoStyle | null {
  if (styleId in demoStyles) return demoStyles[styleId as DiagnosisDemoStyleId];
  return null;
}
