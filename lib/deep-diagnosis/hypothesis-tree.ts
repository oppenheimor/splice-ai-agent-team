export type DeepDiagnosisHypothesisNode = {
  id: string;
  label: string;
  diagnosticQuestion: string;
  requiredSignals: string[];
  ifTrueActions: string[];
  ifFalseImplication: string;
};

export type DeepDiagnosisHypothesisTree = {
  id: string;
  problemPattern: string;
  triggerSignals: string[];
  rootQuestion: string;
  nodes: DeepDiagnosisHypothesisNode[];
};

export const DEEP_DIAGNOSIS_HYPOTHESIS_TREES: DeepDiagnosisHypothesisTree[] = [
  {
    id: "acquisition_underperforming",
    problemPattern: "获客不足",
    triggerSignals: ["客流少", "线索少", "曝光少", "新店冷启动", "内容没人看"],
    rootQuestion: "问题到底是没人看到、看了不点、点了不来，还是来了不留？",
    nodes: [
      {
        id: "low_exposure",
        label: "曝光低",
        diagnosticQuestion: "目标用户是否有机会看到你？",
        requiredSignals: ["曝光量", "发布频次", "渠道覆盖", "商圈或地域关键词"],
        ifTrueActions: ["增加同城关键词内容", "优化平台 POI/门店页", "建立最低发布频次"],
        ifFalseImplication: "曝光不是首要问题，应继续检查点击或转化。",
      },
      {
        id: "low_click",
        label: "点击低",
        diagnosticQuestion: "用户看到后是否愿意点进来？",
        requiredSignals: ["点击率", "标题", "主图", "前 3 秒内容"],
        ifTrueActions: ["重写标题", "重拍主图", "做 3 版卖点 A/B 测试"],
        ifFalseImplication: "素材吸引力尚可，应继续检查下单或到店转化。",
      },
      {
        id: "low_arrival",
        label: "到店/留资低",
        diagnosticQuestion: "用户产生兴趣后，是否完成到店、下单或留资？",
        requiredSignals: ["团购下单", "核销率", "表单留资", "私信咨询"],
        ifTrueActions: ["优化套餐结构", "降低首次行动门槛", "增加清晰 CTA"],
        ifFalseImplication: "获客链路前段可用，应继续检查复购和沉淀。",
      },
    ],
  },
  {
    id: "conversion_underperforming",
    problemPattern: "转化偏弱",
    triggerSignals: ["咨询多成交少", "到店不买", "团购效果一般", "报价后流失"],
    rootQuestion: "问题是卖点不清、价格不匹配、信任不足，还是成交动作断掉？",
    nodes: [
      {
        id: "weak_offer",
        label: "供给/套餐不匹配",
        diagnosticQuestion: "用户看到的套餐或报价是否足够有吸引力？",
        requiredSignals: ["客单价", "竞品价格", "套餐点击", "下单率"],
        ifTrueActions: ["拆引流款/利润款/分享款", "重写套餐标题", "补充场景化卖点"],
        ifFalseImplication: "套餐不是主因，应检查信任或成交动作。",
      },
      {
        id: "weak_trust",
        label: "信任不足",
        diagnosticQuestion: "用户是否相信这家店、这个产品或这个服务值得试？",
        requiredSignals: ["评价数", "评分", "案例/买家秀", "差评主题"],
        ifTrueActions: ["补评价素材", "展示真实案例", "优先处理差评高频主题"],
        ifFalseImplication: "信任基础不弱，应检查成交动作是否断裂。",
      },
      {
        id: "broken_close",
        label: "成交动作断裂",
        diagnosticQuestion: "用户准备行动时，是否有人或系统把他推到下一步？",
        requiredSignals: ["话术", "CTA", "核销后引导", "店员执行"],
        ifTrueActions: ["设计一句话成交脚本", "设置明确 CTA", "把转化动作写进 SOP"],
        ifFalseImplication: "成交动作可用，应检查复购和留存。",
      },
    ],
  },
  {
    id: "retention_underperforming",
    problemPattern: "复购不足",
    triggerSignals: ["老客少", "复购低", "私域沉默", "会员不活跃"],
    rootQuestion: "问题是没有沉淀客户、没有分层触达、权益弱，还是触达节奏错误？",
    nodes: [
      {
        id: "no_customer_asset",
        label: "没有客户资产",
        diagnosticQuestion: "用户离开后，你是否还能再次触达他？",
        requiredSignals: ["私域人数", "会员数", "企微好友数", "到店沉淀率"],
        ifTrueActions: ["建立到店沉淀 SOP", "设置低成本钩子", "把沉淀动作放进收银/交付节点"],
        ifFalseImplication: "已有客户资产，应检查分层和触达。",
      },
      {
        id: "weak_segmentation",
        label: "客户没有分层",
        diagnosticQuestion: "不同价值和状态的客户是否收到不同内容？",
        requiredSignals: ["消费频次", "最近消费时间", "客单价", "偏好标签"],
        ifTrueActions: ["建立新客/常客/沉睡客标签", "设计分层权益", "用 AI 生成分层话术"],
        ifFalseImplication: "分层基础存在，应检查权益和触达节奏。",
      },
      {
        id: "weak_reason_to_return",
        label: "缺少回来的理由",
        diagnosticQuestion: "客户为什么要在下一次选择你？",
        requiredSignals: ["优惠券使用率", "活动参与", "新品反馈", "复购周期"],
        ifTrueActions: ["设计复购钩子", "设置周期性召回", "用互动内容替代硬广"],
        ifFalseImplication: "复购理由存在，应检查执行稳定性。",
      },
    ],
  },
  {
    id: "content_capacity_underperforming",
    problemPattern: "内容产能不足",
    triggerSignals: ["没时间写", "内容断更", "不会选题", "素材很多但发不出来"],
    rootQuestion: "问题是选题不足、初稿慢、素材弱，还是发布复盘断掉？",
    nodes: [
      {
        id: "weak_topics",
        label: "选题不足",
        diagnosticQuestion: "是否有稳定的选题来源和选题判断标准？",
        requiredSignals: ["选题库", "目标用户", "高频问题", "竞品内容"],
        ifTrueActions: ["建立选题库", "用用户问题反推选题", "每周批量生成候选题"],
        ifFalseImplication: "选题不是首要瓶颈，应检查初稿和素材。",
      },
      {
        id: "slow_drafting",
        label: "初稿过慢",
        diagnosticQuestion: "从想法到初稿是否耗时过长？",
        requiredSignals: ["单篇耗时", "模板数量", "修改轮次", "发布频次"],
        ifTrueActions: ["建立 3 类内容模板", "用 AI 生成初稿", "人工只负责观点和案例"],
        ifFalseImplication: "初稿效率尚可，应检查素材和发布复盘。",
      },
      {
        id: "no_feedback_loop",
        label: "没有复盘闭环",
        diagnosticQuestion: "内容发布后是否知道什么有效？",
        requiredSignals: ["阅读/播放", "互动", "转化", "复盘节奏"],
        ifTrueActions: ["建立内容数据表", "每周复盘高低表现内容", "用 AI 总结可复用模式"],
        ifFalseImplication: "复盘存在，应检查产能是否能规模化。",
      },
    ],
  },
  {
    id: "delivery_quality_underperforming",
    problemPattern: "交付质量不稳定",
    triggerSignals: ["返工多", "投诉多", "交付慢", "服务质量不稳"],
    rootQuestion: "问题是标准不清、过程不可见、质检缺失，还是人员能力不一致？",
    nodes: [
      {
        id: "unclear_standard",
        label: "标准不清",
        diagnosticQuestion: "什么叫交付合格，团队是否有一致标准？",
        requiredSignals: ["验收标准", "SOP", "示例样本", "常见返工原因"],
        ifTrueActions: ["沉淀验收清单", "建立示例库", "用 AI 辅助生成质检项"],
        ifFalseImplication: "标准存在，应检查过程和质检。",
      },
      {
        id: "invisible_process",
        label: "过程不可见",
        diagnosticQuestion: "交付进度、风险和责任人是否可追踪？",
        requiredSignals: ["任务状态", "负责人", "延期记录", "客户同步"],
        ifTrueActions: ["建立交付看板", "自动生成进度摘要", "设置异常提醒"],
        ifFalseImplication: "过程可见，应检查质检和能力差异。",
      },
      {
        id: "missing_quality_check",
        label: "质检缺失",
        diagnosticQuestion: "交付前是否有稳定的检查动作？",
        requiredSignals: ["质检清单", "抽检比例", "返工率", "客户反馈"],
        ifTrueActions: ["建立 AI 辅助质检清单", "关键节点人审", "把返工原因回流 SOP"],
        ifFalseImplication: "质检存在，应检查训练和分工。",
      },
    ],
  },
];

export function formatHypothesisTreesForPrompt(): string {
  return DEEP_DIAGNOSIS_HYPOTHESIS_TREES
    .map((tree, index) => {
      const nodes = tree.nodes.map((node) => `${node.label}（查：${node.requiredSignals.join("、")}）`).join("；");
      return `${index + 1}. ${tree.problemPattern}：${tree.rootQuestion} 分支：${nodes}。`;
    })
    .join("\n");
}
