export type DeepDiagnosisBusinessProcessId =
  | "acquisition"
  | "conversion"
  | "delivery"
  | "retention"
  | "customer_service"
  | "content"
  | "operations"
  | "supply_chain"
  | "finance"
  | "team_collaboration"
  | "data_analysis";

export type DeepDiagnosisAutomationLevel =
  | "fully_automatable"
  | "ai_assisted_human_review"
  | "human_only"
  | "prohibited";

export type DeepDiagnosisBusinessProcess = {
  id: DeepDiagnosisBusinessProcessId;
  label: string;
  diagnosticQuestion: string;
  commonBottlenecks: string[];
  aiInterventionModes: string[];
  baselineSignals: string[];
  automationLevel: DeepDiagnosisAutomationLevel;
};

export const DEEP_DIAGNOSIS_BUSINESS_MAP: DeepDiagnosisBusinessProcess[] = [
  {
    id: "acquisition",
    label: "获客",
    diagnosticQuestion: "用户从哪里知道你，当前新增线索或到店客流是否足够？",
    commonBottlenecks: ["流量不足", "内容曝光低", "渠道分散", "投放 ROI 不清"],
    aiInterventionModes: ["同城内容生成", "渠道素材复用", "投放素材测试", "线索来源分析"],
    baselineSignals: ["新增线索数", "曝光量", "点击率", "到店人数", "获客成本"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "conversion",
    label: "转化",
    diagnosticQuestion: "用户看到、咨询或到店之后，为什么没有下单或成交？",
    commonBottlenecks: ["转化偏弱", "卖点不清", "话术不稳", "报价或套餐不匹配"],
    aiInterventionModes: ["销售话术生成", "套餐结构分析", "页面文案优化", "异议处理脚本"],
    baselineSignals: ["咨询转化率", "到店成交率", "团购核销率", "客单价", "放弃原因"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "delivery",
    label: "交付",
    diagnosticQuestion: "用户付费后，交付是否准时、稳定、可复制？",
    commonBottlenecks: ["交付效率低", "质量不稳定", "人工重复劳动多", "标准化不足"],
    aiInterventionModes: ["交付清单", "质检辅助", "SOP 生成", "客户进度同步"],
    baselineSignals: ["交付周期", "返工率", "投诉率", "准时率", "人均处理量"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "retention",
    label: "复购",
    diagnosticQuestion: "老客户为什么没有再次购买、续费或转介绍？",
    commonBottlenecks: ["复购不足", "客户分层缺失", "触达节奏不稳", "权益设计弱"],
    aiInterventionModes: ["客户分层", "复购提醒", "会员权益文案", "召回活动设计"],
    baselineSignals: ["复购率", "沉睡客户数", "会员数", "触达打开率", "转介绍数"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "customer_service",
    label: "客服",
    diagnosticQuestion: "重复咨询、售后和评价处理是否占用了过多人力？",
    commonBottlenecks: ["重复问题多", "响应慢", "服务口径不一", "差评处理滞后"],
    aiInterventionModes: ["FAQ 助手", "自动回复草稿", "差评预警", "服务知识库"],
    baselineSignals: ["咨询量", "重复问题占比", "首响时间", "差评率", "解决时长"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "content",
    label: "内容",
    diagnosticQuestion: "内容是否能持续产出，并真正支持获客、转化或复购？",
    commonBottlenecks: ["产能过慢", "选题不稳", "内容同质化", "数据复盘缺失"],
    aiInterventionModes: ["选题库", "初稿生成", "多平台改写", "内容日历"],
    baselineSignals: ["发布频次", "内容耗时", "互动率", "引流数", "转化贡献"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "operations",
    label: "运营",
    diagnosticQuestion: "日常运营是否有固定节奏、负责人和数据复盘？",
    commonBottlenecks: ["流程断点", "执行不稳定", "排班或排期混乱", "日报缺失"],
    aiInterventionModes: ["运营日历", "任务拆解", "日报生成", "异常提醒"],
    baselineSignals: ["任务完成率", "排班准确率", "异常次数", "复盘频次", "负责人清晰度"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "supply_chain",
    label: "供应链",
    diagnosticQuestion: "库存、采购、损耗和供应是否影响了利润或交付稳定性？",
    commonBottlenecks: ["库存损耗高", "采购不准", "临期预警弱", "供应不稳定"],
    aiInterventionModes: ["需求预测", "采购清单", "临期预警", "损耗分析"],
    baselineSignals: ["库存周转", "损耗率", "缺货次数", "采购频次", "临期金额"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "finance",
    label: "财务",
    diagnosticQuestion: "收入、成本、利润和现金流是否能被及时看清？",
    commonBottlenecks: ["成本不清", "利润核算滞后", "预算失控", "现金流压力"],
    aiInterventionModes: ["经营看板", "成本分类", "异常分析", "预算提醒"],
    baselineSignals: ["毛利率", "现金流", "成本占比", "应收应付", "预算偏差"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "team_collaboration",
    label: "管理协同",
    diagnosticQuestion: "团队是否知道谁负责什么，协作是否靠口头和临时催促？",
    commonBottlenecks: ["团队协作弱", "职责不清", "交接遗漏", "知识不沉淀"],
    aiInterventionModes: ["会议纪要", "任务派发", "交接清单", "内部知识库"],
    baselineSignals: ["延期任务数", "交接问题", "会议行动项", "重复沟通次数", "知识命中率"],
    automationLevel: "ai_assisted_human_review",
  },
  {
    id: "data_analysis",
    label: "数据分析",
    diagnosticQuestion: "关键决策是否有数据支撑，还是依赖感觉？",
    commonBottlenecks: ["数据缺口", "系统分散", "指标不统一", "复盘不稳定"],
    aiInterventionModes: ["指标字典", "数据看板", "异常解释", "复盘摘要"],
    baselineSignals: ["核心指标完整度", "数据更新时间", "看板使用频次", "异常响应时间", "口径一致性"],
    automationLevel: "ai_assisted_human_review",
  },
];

export function formatBusinessMapForPrompt(): string {
  return DEEP_DIAGNOSIS_BUSINESS_MAP
    .map((process, index) => {
      return `${index + 1}. ${process.label}：${process.diagnosticQuestion} 常见瓶颈：${process.commonBottlenecks.join("、")}。基线信号：${process.baselineSignals.join("、")}。`;
    })
    .join("\n");
}
