// TODO: 这是临时 AGUI 样板墙 Mock 数据，确认样式后可连同 demo 路由整体删除。
export type AguiDemoToolId =
  | "askUserChoice"
  | "showCards"
  | "showChart"
  | "showComparison"
  | "showChecklist"
  | "showTimeline"
  | "showScorecard"
  | "showDataTable"
  | "showFramework"
  | "webSearch"
  | "publishHtmlReport";

export type AguiDemoCase = {
  id: string;
  title: string;
  description: string;
  config?: string;
  data: unknown;
  state?: "input-available" | "output-available";
};

export type AguiDemoSection = {
  id: AguiDemoToolId;
  name: string;
  description: string;
  cases: AguiDemoCase[];
};

const opportunityCards = [
  {
    title: "客户跟进自动化",
    subtitle: "首选试点",
    description: "把线索进入、客户分层、报价草稿、跟进提醒做成一条轻量闭环。",
    badge: "优先",
    price: "14 天 · 1 名业务负责人 + 1 名实施同学",
    owner: "销售运营",
    due: "D14",
    recommendation: "收益路径最短，能用真实线索在两周内验证响应速度与转化改善。",
    risk: "报价承诺类内容必须保留人工复核，否则会引入合规和客户预期风险。",
    nextStep: "先接入最近 50 条线索，跑一轮跟进建议和报价草稿。",
    metrics: [
      { label: "收益确定性", value: "86", tone: "good", direction: "higher" },
      { label: "实施复杂度", value: "42", tone: "neutral", direction: "lower" },
      { label: "组织阻力", value: "28", tone: "good", direction: "lower" },
    ],
    bullets: ["先接入现有 CRM 表格，不重做系统", "从报价草稿与跟进提醒开始", "每周复盘 20 条真实线索"],
    actions: [{ label: "进入深挖" }, { label: "加入路线图" }],
  },
  {
    title: "销售知识库问答",
    subtitle: "低风险铺垫",
    description: "沉淀产品资料、成功案例、异议处理话术，让新销售更快进入状态。",
    badge: "稳妥",
    price: "7 天 · 资料整理优先",
    owner: "销售主管",
    due: "D7",
    recommendation: "适合做基础设施铺垫，但单独上线难以直接证明收入提升。",
    risk: "资料过旧会让回答变成低质搜索，需要先建立审核口径。",
    nextStep: "先整理高频问题和 10 个成功案例，限定回答范围。",
    metrics: [
      { label: "收益确定性", value: "68", tone: "neutral", direction: "higher" },
      { label: "实施复杂度", value: "30", tone: "good", direction: "lower" },
      { label: "组织阻力", value: "20", tone: "good", direction: "lower" },
    ],
    bullets: ["先整理高频问题", "用人工审核兜底", "避免直接替代资深销售判断"],
    actions: [{ label: "查看样例" }],
  },
  {
    title: "经营周报生成",
    subtitle: "管理层可见",
    description: "自动汇总线索、转化、回款和异常，把例会从读数改成决策讨论。",
    badge: "展示",
    price: "10 天 · 依赖数据口径",
    owner: "管理层助理",
    due: "D10",
    recommendation: "管理层感知强，但要先统一指标口径，否则报告会变成漂亮流水账。",
    risk: "跨表字段定义不一致会让趋势结论失真。",
    nextStep: "先确定线索、报价、成交、回款四个指标的唯一来源。",
    metrics: [
      { label: "收益确定性", value: "72", tone: "neutral", direction: "higher" },
      { label: "实施复杂度", value: "56", tone: "warn", direction: "lower" },
      { label: "组织阻力", value: "35", tone: "neutral", direction: "lower" },
    ],
    bullets: ["先统一指标口径", "保留人工备注区", "每周固定发送管理层"],
    actions: [{ label: "评估数据" }],
  },
];

const chartRows = [
  { stage: "线索", value: 420 },
  { stage: "有效沟通", value: 238 },
  { stage: "报价", value: 96 },
  { stage: "成交", value: 41 },
];

export const deepDiagnosisAguiDemoSections: AguiDemoSection[] = [
  {
    id: "askUserChoice",
    name: "askUserChoice",
    description: "用于范围路由、事实确认、生成完整报告前的明确选择。",
    cases: [
      {
        id: "choice-single",
        title: "单选 + 允许其他",
        description: "deep-diagnosis 首轮入口范围路由的典型状态。",
        config: "mode: single · allowOther: true",
        state: "input-available",
        data: {
          question: "这次你希望我先怎么切入诊断？",
          mode: "single",
          allowOther: true,
          options: [
            { id: "global", label: "先全局盘点", description: "适合还没确定哪个环节最值得改造。" },
            { id: "specific", label: "只看一个具体问题", description: "适合已经知道卡点，例如客户跟进、报价、交付。" },
            { id: "project", label: "评估一个 AI 项目", description: "适合已经有想做的方案，需要判断优先级和风险。" },
          ],
        },
      },
      {
        id: "choice-multiple",
        title: "多选 + 最少选择",
        description: "全局盘点后，让用户选 1 个或多个要一起评估的问题。",
        config: "mode: multiple · minSelections: 1 · allowOther: true",
        state: "input-available",
        data: {
          question: "请选择你想一起评估的问题，可以选 1 个，也可以多选。",
          mode: "multiple",
          minSelections: 1,
          allowOther: true,
          options: [
            { id: "sales", label: "销售跟进效率低", description: "线索多、响应慢、报价靠人工经验。" },
            { id: "service", label: "客服重复问题多", description: "售前售后都在回答相似问题。" },
            { id: "delivery", label: "交付质量不稳定", description: "项目复盘少，成功经验难复制。" },
            { id: "data", label: "经营数据看不清", description: "老板要结果，团队只给流水账。" },
          ],
        },
      },
      {
        id: "choice-max-no-other",
        title: "多选上限 + 禁止其他",
        description: "适合报告触发前的有限动作确认，不允许自定义。",
        config: "mode: multiple · maxSelections: 2 · allowOther: false",
        state: "input-available",
        data: {
          question: "这轮诊断先收束到哪两个机会点？",
          mode: "multiple",
          maxSelections: 2,
          allowOther: false,
          options: [
            { id: "follow-up", label: "客户跟进自动化" },
            { id: "quote", label: "报价草稿生成" },
            { id: "weekly", label: "经营周报生成" },
          ],
        },
      },
      {
        id: "choice-submitted",
        title: "已提交状态",
        description: "用户选择完成后，对话里保留的结果摘要。",
        config: "state: output-available",
        state: "output-available",
        data: {
          question: "是否生成完整方案？",
          mode: "single",
          allowOther: false,
          options: [
            { id: "generate_report", label: "出完整方案" },
            { id: "continue", label: "再诊断一轮" },
          ],
          selected: ["generate_report"],
          selectedLabels: ["出完整方案"],
        },
      },
    ],
  },
  {
    id: "showCards",
    name: "showCards",
    description: "用于展示候选机会点、任务包、资源建议和轻量对比。",
    cases: [
      ...["recommendation", "comparison", "insight", "task", "resource"].map((variant) => ({
        id: `cards-variant-${variant}`,
        title: `variant: ${variant}`,
        description: "同一组机会点在不同语义下的卡片质感。",
        config: `variant: ${variant}`,
        data: {
          title: "AI 机会点候选",
          description: "根据业务现场信息生成的初步排序。",
          variant,
          cards: opportunityCards,
        },
      })),
      ...["compact", "normal", "detailed"].map((density) => ({
        id: `cards-density-${density}`,
        title: `density: ${density}`,
        description: "卡片信息密度配置，用于观察拥挤度。",
        config: `density: ${density}`,
        data: {
          title: "信息密度对照",
          variant: "recommendation",
          density,
          cards: opportunityCards.slice(0, 2),
        },
      })),
      ...["none", "first", "scored", "selected"].map((emphasis) => ({
        id: `cards-emphasis-${emphasis}`,
        title: `emphasis: ${emphasis}`,
        description: "推荐态、首选态和无强调态的视觉差异。",
        config: `emphasis: ${emphasis}`,
        data: {
          title: "强调方式对照",
          variant: "recommendation",
          emphasis,
          cards: opportunityCards,
        },
      })),
      ...["grid", "list", "matrix", "compact", "comparison", "product", "plan"].map((layout) => ({
        id: `cards-layout-${layout}`,
        title: `layout: ${layout}`,
        description: "Cards 组件的布局配置；comparison/product/plan 会按渲染器规则归一。",
        config: `layout: ${layout}`,
        data: {
          title: "布局方式对照",
          variant: layout === "matrix" || layout === "comparison" ? "comparison" : "recommendation",
          layout,
          cards: opportunityCards,
        },
      })),
      ...["pills", "rows", "bars", "table"].map((metricsDisplay) => ({
        id: `cards-metrics-${metricsDisplay}`,
        title: `metricsDisplay: ${metricsDisplay}`,
        description: "指标展示方式配置。",
        config: `metricsDisplay: ${metricsDisplay}`,
        data: {
          title: "指标展示对照",
          variant: metricsDisplay === "table" ? "comparison" : "recommendation",
          layout: metricsDisplay === "table" ? "matrix" : "grid",
          metricsDisplay,
          cards: opportunityCards,
        },
      })),
    ],
  },
  {
    id: "showChart",
    name: "showChart",
    description: "用于趋势、漏斗、评分拆解和比例结构展示。",
    cases: ["bar", "line", "donut", "funnel", "radar"].map((chartType) => ({
      id: `chart-${chartType}`,
      title: `chartType: ${chartType}`,
      description: "同一批经营数据在不同图表类型下的呈现。",
      config: `chartType: ${chartType}`,
      data: {
        title: "销售链路转化",
        description: "Mock 数据：本月从线索到成交的关键阶段。",
        source: "CRM 导出 · 2026-06",
        unit: "客户数",
        insight: "最大流失发生在有效沟通到报价之间，应优先检查报价准备和跟进节奏。",
        chartType,
        xKey: "stage",
        yKey: "value",
        data: chartRows,
      },
    })),
  },
  {
    id: "showComparison",
    name: "showComparison",
    description: "用于 A/B/C 方案取舍和路线选择。",
    cases: [
      {
        id: "comparison-normal",
        title: "三方案对比",
        description: "展示 summary、criteria、scores 和 recommendation。",
        data: {
          title: "优先切入方式对比",
          criteria: ["收益确定性", "实施复杂度", "团队接受度"],
          options: [
            {
              name: "客户跟进自动化",
              summary: "收益直接，适合用真实线索验证。",
              scores: { 收益确定性: "高", 实施复杂度: "中", 团队接受度: "中高" },
              recommendation: "建议作为首个 14 天试点。",
            },
            {
              name: "知识库问答",
              summary: "低风险，但容易停留在辅助层。",
              scores: { 收益确定性: "中", 实施复杂度: "低", 团队接受度: "高" },
              recommendation: "适合并行铺底。",
            },
            {
              name: "经营周报",
              summary: "管理层可见，但依赖指标口径统一。",
              scores: { 收益确定性: "中高", 实施复杂度: "中高", 团队接受度: "中" },
              recommendation: "等数据口径确认后再做。",
            },
          ],
        },
      },
    ],
  },
  {
    id: "showChecklist",
    name: "showChecklist",
    description: "用于资源准备、风险清单、上线检查和下一步动作。",
    cases: [
      {
        id: "checklist-priority",
        title: "优先级清单",
        description: "覆盖 high、medium、low 三种优先级。",
        data: {
          title: "试点前准备清单",
          description: "先把真实业务闭环跑起来，再谈自动化范围。",
          items: [
            { label: "整理最近 50 条线索记录", detail: "包含来源、跟进状态、报价结果。", priority: "high", owner: "销售运营", due: "D3" },
            { label: "定义客户分层口径", detail: "避免 AI 根据模糊标签乱分层。", priority: "medium", owner: "销售主管", due: "D5" },
            { label: "约定人工复核规则", detail: "报价和承诺类内容必须人工确认。", priority: "low", owner: "业务负责人", due: "D7" },
          ],
        },
      },
    ],
  },
  {
    id: "showTimeline",
    name: "showTimeline",
    description: "用于 7/30/90 天路线图和执行节奏。",
    cases: [
      {
        id: "timeline-roadmap",
        title: "路线图",
        description: "展示 time、title、detail、owner。",
        data: {
          title: "7/30/90 天落地路线",
          description: "从小闭环到可复制机制。",
          steps: [
            { time: "D1-D7", title: "锁定数据与口径", detail: "整理线索样本，确定客户分层规则。", owner: "业务负责人", risk: "字段不统一" },
            { time: "D8-D30", title: "跑通轻量试点", detail: "生成跟进建议与报价草稿，保留人工复核。", owner: "实施同学", risk: "反馈不及时" },
            { time: "D31-D90", title: "扩展到团队 SOP", detail: "把有效动作写进销售节奏和复盘机制。", owner: "管理层", risk: "扩张过快" },
          ],
        },
      },
    ],
  },
  {
    id: "showScorecard",
    name: "showScorecard",
    description: "用于机会点评分、风险判断和报告质量门禁。",
    cases: [
      {
        id: "scorecard-normal",
        title: "评分卡",
        description: "展示 overall 自动/手动综合分和维度进度条。",
        data: {
          title: "客户跟进自动化优先级评分",
          summary: "适合先做，但不要跳过人工复核。",
          overall: 82,
          dimensions: [
            { label: "业务收益", score: 9, max: 10, note: "直接影响转化和响应速度。", nextStep: "用 20 条真实线索测响应时间。" },
            { label: "数据可得性", score: 7, max: 10, note: "现有表格可用，但字段需要统一。", nextStep: "补齐来源、阶段、报价结果字段。" },
            { label: "组织阻力", score: 6, max: 10, note: "销售担心被管控，需要先定位为辅助。", nextStep: "把 AI 输出定位为草稿和提醒。" },
            { label: "风险可控", score: 8, max: 10, note: "报价承诺保留人工确认即可。", nextStep: "上线前写入复核门禁。" },
          ],
        },
      },
    ],
  },
  {
    id: "showDataTable",
    name: "showDataTable",
    description: "用于来源列表、竞品清单、成本拆解和 POC 任务表。",
    cases: [
      {
        id: "table-normal",
        title: "高密度数据表",
        description: "展示列配置和横向滚动效果。",
        data: {
          title: "POC 任务拆解",
          description: "Mock 数据：两周试点的最小任务表。",
          columns: [
            { key: "task", label: "任务" },
            { key: "owner", label: "负责人" },
            { key: "deadline", label: "截止" },
            { key: "risk", label: "风险" },
          ],
          rows: [
            { task: "线索样本整理", owner: "销售运营", deadline: "D3", risk: "字段不统一" },
            { task: "报价模板归档", owner: "销售主管", deadline: "D5", risk: "版本混乱" },
            { task: "AI 草稿复核", owner: "一线销售", deadline: "D10", risk: "反馈不及时" },
          ],
        },
      },
    ],
  },
  {
    id: "showFramework",
    name: "showFramework",
    description: "用于成熟度模型、诊断框架、转型路径和决策树。",
    cases: [
      {
        id: "framework-normal",
        title: "诊断框架",
        description: "展示节点、状态和节点内条目。",
        data: {
          title: "AI 落地诊断框架",
          description: "先判断业务闭环，再判断数据与组织承接能力。",
          nodes: [
            {
              title: "业务闭环",
              status: "已识别",
              description: "客户从线索到成交的关键动作已经明确。",
              items: ["线索来源", "客户分层", "报价跟进"],
            },
            {
              title: "数据基础",
              status: "待统一",
              description: "字段存在，但历史记录口径不一致。",
              items: ["客户阶段", "报价金额", "跟进结果"],
            },
            {
              title: "组织承接",
              status: "需验证",
              description: "团队接受度取决于是否保留人工判断权。",
              items: ["复核机制", "试点边界", "收益复盘"],
            },
          ],
        },
      },
    ],
  },
  {
    id: "webSearch",
    name: "webSearch",
    description: "外部资料检索结果卡片，用于来源、摘要判断和证据缺口。",
    cases: [
      {
        id: "web-search-complete",
        title: "完成态",
        description: "展示摘要、来源、覆盖类型。",
        data: {
          answer: "公开资料显示，销售自动化试点更适合从辅助决策和流程提醒切入，而不是直接替代销售判断。",
          results: [
            { title: "Sales automation benchmark report", url: "https://example.com/sales-automation", content: "Benchmarks about CRM automation adoption." },
            { title: "AI adoption in SMB sales", url: "https://example.com/smb-ai-sales", content: "Practical adoption patterns for SMB teams." },
            { title: "Human review in AI workflows", url: "https://example.com/human-review", content: "Guidance about keeping humans in critical decisions." },
            { title: "Workflow automation risks", url: "https://example.com/workflow-risks", content: "Common rollout risks and mitigations." },
          ],
          compiledEvidence: {
            coverage: {
              searchedQuestions: ["销售自动化适合从哪里切入", "AI 报价草稿需要哪些人工复核"],
              coveredSourceTypes: ["行业报告", "工具文档", "案例文章"],
              uncoveredSourceTypes: [],
            },
          },
        },
      },
      {
        id: "web-search-warning",
        title: "需复核态",
        description: "展示 warning 和证据缺口。",
        data: {
          warning: "检索结果缺少同规模企业案例，需要后续用真实客户访谈补证。",
          answer: "当前只能作为 B 级外部参考，不能直接推导投资回报。",
          results: [
            { title: "Generic CRM automation guide", url: "https://example.com/generic-crm", content: "General guide with limited industry specificity." },
          ],
          compiledEvidence: {
            coverage: {
              searchedQuestions: ["中小企业销售自动化 ROI"],
              coveredSourceTypes: ["通用文章"],
              uncoveredSourceTypes: ["同规模案例", "本行业数据", "反例"],
            },
          },
        },
      },
    ],
  },
  {
    id: "publishHtmlReport",
    name: "publishHtmlReport",
    description: "完整方案 HTML 发布结果卡片，用于链接、二维码和失败提示。",
    cases: [
      {
        id: "publish-ready",
        title: "已发布",
        description: "展示二维码、打开、复制和下载按钮。",
        data: {
          status: "success",
          title: "深度诊断完整方案",
          summary: "客户跟进自动化 7/30/90 天落地方案已整理为 HTML。",
          url: "https://example.com/reports/deep-diagnosis-demo",
          htmlBytes: 48672,
          publishPath: "/reports/deep-diagnosis-demo.html",
        },
      },
      {
        id: "publish-failed",
        title: "发布失败",
        description: "展示禁用操作和失败说明。",
        data: {
          status: "failed",
          title: "深度诊断完整方案",
          summary: "HTML 内容已生成，但演示环境没有发布出口。",
          url: null,
          htmlBytes: 48672,
          publishPath: "/reports/local-only.html",
          message: "发布服务暂时不可用。",
        },
      },
    ],
  },
];
