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
    // 经营画像 q1-q10（4 选项 A-D）
    q1: "A",  // 商业视野：守稳 → 深耕
    q2: "B",  // 商业视野：稳后拓展 → 偏深耕
    q3: "C",  // 判断方式：拆解原因 → 偏数据验证
    q4: "D",  // 判断方式：建验证框架 → 强数据验证
    q5: "B",  // 组织落地：主框架后完善 → 偏系统重构
    q6: "C",  // 组织落地：小团队深化 → 偏快速试水
    q7: "B",  // 投入心智：3 月量化 → 偏成本优先
    q8: "B",  // 投入心智：缩小范围 → 偏成本优先
    q9: "B",  // 风险策略：先建评估清单 → 偏风险防守
    q10: "B", // 风险策略：方向对就调整 → 偏风险防守
    // AI 落地画像 q11-q24
    q11: "C", // AI 态度：已尝试，找更深场景
    q12: "B", // 关注偏好：商业落地
    q13: "C", // 使用时长：2-4 小时
    q14: ["A", "B", "C"], // 工具：聊天+低代码+代码类
    q15: "C", // 工作流：固定场景（workflowLevel=2 → L4）
    q16: "C", // AI 边界：销售/情感判断难
    q17: "C", // AI 参照系：见过，知道怎么做
    q18: "C", // 人机协作：信任主体
    q19: ["A", "C", "D"], // 认知宽度：干活+分析+服务 → 3项=拓展认知
    q20: "C", // 刚需：客户转化与服务
    q21: "D", // 预期价值：差异化竞争优势
    q22: "C", // 落地偏好：小流程验证
    q23: "A", // 主要阻力：场景不清晰
    q24: "B", // 深度诊断意愿：1V1 深聊
  },
  dimensionScores: {
    V: {
      code: "V",
      label: "商业视野",
      leftLabel: "深耕",
      rightLabel: "拓展",
      leftLetter: "D",
      rightLetter: "E",
      left: 84,
      right: 17,
      dominantLetter: "D",
      dominantLabel: "深耕",
      diff: 67,
      stars: 1,
    },
    D: {
      code: "D",
      label: "判断方式",
      leftLabel: "经验判断",
      rightLabel: "数据验证",
      leftLetter: "G",
      rightLetter: "P",
      left: 17,
      right: 84,
      dominantLetter: "P",
      dominantLabel: "数据验证",
      diff: 67,
      stars: 1,
    },
    E: {
      code: "E",
      label: "组织落地",
      leftLabel: "系统重构",
      rightLabel: "快速试水",
      leftLetter: "R",
      rightLetter: "A",
      left: 50,
      right: 50,
      dominantLetter: "B",
      dominantLabel: "平衡",
      diff: 0,
      stars: 4,
    },
    A: {
      code: "A",
      label: "投入心智",
      leftLabel: "成本优先",
      rightLabel: "长期投入",
      leftLetter: "C",
      rightLetter: "L",
      left: 67,
      right: 33,
      dominantLetter: "C",
      dominantLabel: "成本优先",
      diff: 34,
      stars: 2,
    },
    B: {
      code: "B",
      label: "风险策略",
      leftLabel: "风险防守",
      rightLabel: "创新进攻",
      leftLetter: "S",
      rightLetter: "I",
      left: 67,
      right: 33,
      dominantLetter: "S",
      dominantLabel: "风险防守",
      diff: 34,
      stars: 2,
    },
  },
  featureCode: "PD",
  operatorCode: "PD-EP",
  operatorTypeName: "数据验证型",
  operatorTypeDefinition: "重视拆解、数据和可复制性，适合从流程指标和自动化看板切入。 你的辅助倾向是「深耕」，适合把主优势和第二优势组合成一个可落地的小切口。",
  operatorType: {
    code: "P",
    name: "数据验证型",
    definition: "重视拆解、数据和可复制性，适合从流程指标和自动化看板切入。 你的辅助倾向是「深耕」，适合把主优势和第二优势组合成一个可落地的小切口。",
    primaryTrait: "数据验证",
    secondaryTrait: "深耕",
  },
  aiAdoptionStage: "L4",
  aiAdoptionStageLabel: "工具瓶颈层",
  aiReadiness: {
    total: 70,
    level: "L4",
    label: "工具瓶颈层",
    summary: "你有丰富的工具经验，但工作流整合还有提升空间——这是从「会用」到「用好」的关键节点。",
    axes: {
      attitude: { code: "attitude", label: "AI 态度", score: 65, level: "高", insight: "已有初步体验，正在寻找更值得深入的场景。" },
      usage: { code: "usage", label: "使用强度", score: 65, level: "高", insight: "每天 2-4 小时，AI 已经进入工作流的重要部分。" },
      workflow: { code: "workflow", label: "工作流融合", score: 60, level: "高", insight: "已有一个固定使用场景，这是很好的起点。" },
      tooling: { code: "tooling", label: "工具成熟度", score: 90, level: "高", insight: "已使用聊天工具、低代码搭建工具、代码类 AI 工具，工具覆盖度较广，可考虑整合成系统工作流。" },
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
    toolRecommendations: ["Coze / 扣子 — 搭建客服与销售 Agent", "企微 + AI 私信模板 — 私域运营自动化"],
  },
  userType: "EP",
  userTypeLabel: "企业家实用派",
  cognitiveWidth: "拓展认知",
  blindSpots: ["让 AI 承担内容创作和宣传素材，把灵感变成稳定产能", "让 AI 管理订单、库存和排期，把零散流程接成系统", "让 AI 辅助商业方向、产品选择和定价策略，补上决策推演层"],
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
