import type { DeepDiagnosisEntryRoute, DeepDiagnosisLandingMode, DeepDiagnosisStage } from "./types";

export type DeepDiagnosisStageDefinition = {
  id: DeepDiagnosisStage;
  label: string;
  goal: string;
  requiredSignals: string[];
};

export const DEEP_DIAGNOSIS_STAGES = [
  {
    id: "entry",
    label: "入口识别",
    goal: "先识别用户角色、决策位置和本次诊断范围路由：全局盘点、单点深挖，还是暂时说不清。",
    requiredSignals: ["用户角色", "决策范围", "入口路由"],
  },
  {
    id: "context_collection",
    label: "业务现场补齐",
    goal: "补齐业务类型、用户角色、当前阶段、当前流程、资源约束、已有 AI 尝试和一个真实样本。",
    requiredSignals: ["业务类型", "用户角色", "当前阶段", "当前流程", "主要约束", "真实样本"],
  },
  {
    id: "bottleneck_diagnosis",
    label: "瓶颈定位",
    goal: "定位第一瓶颈，并区分是目标、输入、产能、质量、转化、流程、数据、协作还是工具问题。",
    requiredSignals: ["第一瓶颈", "证据来源", "影响后果", "关键假设"],
  },
  {
    id: "external_research",
    label: "外部证据分析",
    goal: "需要行业、竞品、工具、案例或最新趋势支撑时，先形成外部分析摘要，再和用户现场做对照。",
    requiredSignals: ["搜索主题", "关键发现", "来源等级", "用户现场对照", "差距结论"],
  },
  {
    id: "opportunity_mapping",
    label: "机会点判断",
    goal: "把流程拆成 AI 可介入的机会点，并说明为什么现在先做、为什么不是别的。",
    requiredSignals: ["机会点", "适合原因", "优先级依据", "暂不建议事项"],
  },
  {
    id: "solution_design",
    label: "落地方案设计",
    goal: "为每个机会点匹配工具、工作流、Agent、自动化、知识库、看板或定制开发，并交付至少一项可立即使用的资产。",
    requiredSignals: ["落地方式", "资源条件", "可用资产", "7/30/90 天动作"],
  },
  {
    id: "report_ready",
    label: "完整方案确认",
    goal: "在信息足够时先让用户确认生成完整方案或继续补充。",
    requiredSignals: ["用户确认", "诊断书结构", "HTML 发布调用"],
  },
  {
    id: "human_handoff",
    label: "人工承接判断",
    goal: "判断是否需要进入企业微信人工沟通，并说明原因和准备材料。",
    requiredSignals: ["高意向信号", "人工沟通原因", "准备清单"],
  },
] satisfies DeepDiagnosisStageDefinition[];

export type DeepDiagnosisEntryRouteDefinition = {
  id: DeepDiagnosisEntryRoute;
  label: string;
  userIntent: string;
  requiredNextStep: string;
};

export const DEEP_DIAGNOSIS_ENTRY_ROUTES = [
  {
    id: "overview_scan",
    label: "先全局盘点",
    userIntent: "用户有多个问题，想先判断哪个业务 / 岗位环节最值得 AI 改造。",
    requiredNextStep: "必须用 askUserChoice 的 multiple 模式收集至少 1 个候选问题；不限制最多选择数量，用户可以全选。随后做横向扫描和优先级推荐。",
  },
  {
    id: "focused_deep_dive",
    label: "聚焦一个问题",
    userIntent: "用户已经知道要解决的具体问题，想直接评估方案、风险和落地路径。",
    requiredNextStep: "可以进入单问题或单流程深挖，但必须声明未覆盖其它业务环节。",
  },
  {
    id: "assisted_clarification",
    label: "还说不清楚",
    userIntent: "用户只有模糊困惑，需要先描述现场，由 Agent 帮他归类到候选问题池。",
    requiredNextStep: "先追问 1-2 个业务现场问题，再把用户描述归类为候选问题池，不要直接生成方案。",
  },
] satisfies DeepDiagnosisEntryRouteDefinition[];

export const DEEP_DIAGNOSIS_MULTI_PROBLEM_SCAN_RULES = [
  "冷启动时不要直接问「最头疼的问题是哪一个」并强制单选；这会把多问题用户锁进单一路径。",
  "首轮必须先做入口范围路由：先全局盘点、聚焦一个问题、还说不清楚。",
  "当用户选择全局盘点，但业务类型、用户角色、当前阶段任一缺失时，必须先用纯文本追问这些开放信息，不要同轮调用 askUserChoice。",
  "当用户选择全局盘点，必须使用 askUserChoice 的 multiple 模式让用户至少选择 1 个候选问题，不要设置 maxSelections；用户可以全选，并允许其他自填。",
  "全选不代表一次性深挖所有方向；系统必须先横向扫描全部已选方向，再推荐优先深挖 1-2 个。",
  "多问题用户不能一次性深挖所有问题；必须先横向扫描，再推荐优先深挖 1-2 个。",
  "多选后的横向扫描必须说明问题之间可能是因果链，不要把所有症状当成并列待办。",
  "横向扫描必须输出评分分解矩阵，至少包含：候选环节、预期价值、落地容易度、见效速度、数据可得性、第一瓶颈匹配度、总分、为什么不是其它环节。",
  "横向扫描后再使用单选让用户确认本轮深挖对象。",
  "如果多问题横扫后只深挖一个问题，报告应命名为「业务横向扫描 + 单流程深度诊断」，不能叫完整业务全局诊断。",
] as const;

export const DEEP_DIAGNOSIS_INTERACTION_CONTRACTS = [
  "每一轮只能承载一种用户输入形态：要么开放文本，要么结构化选择，不要同时要求用户自由填写又弹选择卡片。",
  "正文里出现「请告诉我」「先说说」「补充一下」「写下」这类开放式必答要求时，本轮不要调用 askUserChoice；应等待用户文本回复。",
  "调用 askUserChoice 时，正文只能写一句简短承接，所有必须回答的内容都必须能在卡片选项或 allowOther 输入框中完成。",
  "如果一个节点既需要业务类型 / 角色这类开放信息，又需要选择候选环节，必须拆成两轮：先收开放信息，再弹选择卡片。",
  "不要在 askUserChoice 卡片上方追加另一个必须回答的问题；否则用户会找不到输入位置。",
  "allowOther 只能承接选项之外的补充，不要把它当作多个开放字段的表单替代。",
] as const;

export const DEEP_DIAGNOSIS_REPORT_READINESS_RULES = [
  "完整报告确认按钮只能在关键事实确认之后出现；没有让用户确认已确认事实、待确认事实和未覆盖区域，不允许调用 askUserChoice 提供「出完整方案」。",
  "事实确认卡必须产品化呈现为三块：已确认事实、待确认事实、未覆盖区域；并给用户三个下一步选择：补齐关键事实、跳过并降级出假设简报、继续诊断未覆盖模块。",
  "如果「待确认事实」非空且用户没有显式确认跳过，说明关键事实确认未完成；不能同轮声称信息足够，也不能提供「出完整方案」。",
  "不要把「待确认事实」当作普通补充项；凡是会影响预算、目标、渠道、优先级、工具选择或验收标准的信息，都属于阻塞完整报告的待确认事实。",
  "「未覆盖区域」不能只是免责声明；如果未覆盖区域非空，报告只能称为本轮专项方案或单流程方案，不能称为完整方案。",
  "如果未覆盖区域非空，进入报告前必须给用户一个范围扩展选择：先出本轮专项方案，还是继续诊断未覆盖模块。",
  "进入完整报告前必须具备最小事实包：业务类型、用户角色、当前阶段、用户选择的深挖方向、当前基线、真实样本或明确缺失、目标指标、资源约束。",
  "如果最小事实包缺任一项，只能继续追问或输出 hypothesis_brief，不能声称信息足够出完整方案。",
  "当用户选择的深挖方向和横向扫描推荐方向不一致时，必须先追问用户为什么坚持该方向，并记录为已确认事实或待确认事实。",
  "如果用户反选低优先级方向但没有说明原因，最多只能输出方向风险提示或假设简报，不能进入完整诊断报告。",
  "webSearch 或外部资料不能替代用户事实确认；外部结论只能补证，不能把未知的用户现场补成已确认事实。",
  "如果报告级别是 hypothesis_brief，不要提供「出完整方案」选项；只能提供「继续补关键信息」或「先看假设简报」。",
  "如果生成的是 hypothesis_brief，不要只给 110 分完整报告成熟度；必须同时给「当前简报可用度」和「完整诊断书成熟度」，避免用户误以为当前交付只有低分。",
] as const;

export const DEEP_DIAGNOSIS_LANDING_MODE_LABELS = {
  tool: "工具",
  workflow: "工作流",
  agent: "Agent",
  automation: "自动化",
  knowledge_base: "知识库",
  dashboard: "数据看板",
  custom_development: "定制开发",
} satisfies Record<DeepDiagnosisLandingMode, string>;

export const DEEP_DIAGNOSIS_REPORT_SECTIONS = [
  "诊断摘要",
  "诊断范围声明",
  "报告级别与适用边界",
  "用户关键事实确认",
  "横向扫描：候选业务环节比较",
  "第一瓶颈定位与证据",
  "行业分析报告：外部资料覆盖范围、引用链与反例",
  "诊断报告：外部资料与用户现场对照",
  "业务现场与问题定义",
  "AI 机会点清单",
  "优先级评分与取舍依据",
  "本次直接交付的可用资产",
  "落地方案",
  "所需数据、人员、权限、预算和流程条件",
  "7 / 30 / 90 天路线图",
  "效果验证指标、基线和阈值",
  "自动化等级、风险边界、失败分支和退出标准",
  "未覆盖区域与后续补证计划",
  "报告质量 Gate 与可比较评分",
  "下一步任务化清单",
  "企业微信人工承接判断",
] as const;

export const DEEP_DIAGNOSIS_SCOPE_LEVELS = [
  "单问题诊断：只回答一个已明确问题，不能声称覆盖全局业务。",
  "单流程诊断：覆盖一个端到端流程，必须说明上下游未覆盖部分。",
  "岗位范围诊断：覆盖一个岗位的主要工作流，必须先横向扫描至少 3 个候选场景。",
  "业务全局诊断：覆盖多个核心业务环节，必须先做横向扫描和外部资料对照。",
] as const;

export const DEEP_DIAGNOSIS_REPORT_LEVELS = [
  "hypothesis_brief：信息不足时的假设简报。",
  "single_problem_report：单问题诊断报告。",
  "workflow_report：单流程诊断报告。",
  "role_scope_report：岗位范围诊断报告。",
  "business_overview_report：业务全局诊断报告。",
  "external_research_report：只针对行业 / 竞品 / 工具资料的外部分析报告。",
  "overview_scan_plus_workflow_report：业务横向扫描 + 单流程深度诊断，适用于多问题横扫后只深挖一个流程的报告。",
] as const;

export const DEEP_DIAGNOSIS_PRIORITY_FACTORS = [
  "预期价值",
  "落地容易度",
  "数据准备度",
  "风险可控性",
  "见效速度",
  "负责人可控性",
  "第一瓶颈匹配度",
] as const;

export const DEEP_DIAGNOSIS_BOTTLENECK_TYPES = [
  "目标不清",
  "输入不足",
  "获客不足",
  "产能过慢",
  "质量不稳",
  "转化偏弱",
  "流程断点",
  "数据缺口",
  "团队协作",
  "工具错配",
  "复购不足",
  "执行不稳",
] as const;

export const DEEP_DIAGNOSIS_DELIVERABLE_ASSET_TYPES = [
  "模板",
  "清单",
  "示范产出",
  "排期日历",
  "评分表",
  "工作流",
  "字段结构",
] as const;

export const DEEP_DIAGNOSIS_UPGRADE_PATH_LEVELS = [
  "自助工具版：适合一个人先试跑，用通用 AI 工具、模板、清单或手工表格验证最小闭环。",
  "工作流模板版：适合稳定重复执行，把输入字段、责任人、节奏、检查点和复盘表固化为团队可复用流程。",
  "系统 / Agent 定制版：适合嵌入客户业务流程，连接数据、角色、提醒、审批、看板或外部系统，让流程自动运转。",
] as const;

export const DEEP_DIAGNOSIS_CUSTOMIZATION_TRIGGER_SIGNALS = [
  "这个问题每天或每周重复发生，已经不是一次性任务。",
  "涉及多人协作、交接、审批、提醒或复盘。",
  "需要接入表格、飞书、企业微信、CRM、POS、订单、课程、库存或其它业务系统。",
  "用户希望自动生成、自动分派、自动提醒、自动汇总、自动看板或自动复盘。",
  "当前自助工具能跑通，但数据分散、执行不稳或团队难以长期坚持。",
  "用户明确提到预算、上线周期、团队配合、系统接入、私有数据或定制开发。",
] as const;

export const DEEP_DIAGNOSIS_CUSTOMIZATION_SOFT_SIGNALS = [
  "这个问题每天或每周重复发生，已经不是一次性任务。",
  "涉及多人协作、交接、审批、提醒或复盘。",
  "用户希望自动生成、自动分派、自动提醒、自动汇总、自动看板或自动复盘。",
] as const;

export const DEEP_DIAGNOSIS_CUSTOMIZATION_HARD_SIGNALS = [
  "需要接入表格、飞书、企业微信、CRM、POS、订单、课程、库存或其它业务系统。",
  "当前自助工具能跑通，但数据分散、执行不稳或团队难以长期坚持。",
  "用户明确提到预算、上线周期、团队配合、系统接入、私有数据或定制开发。",
  "已经能描述当前业务损失、稳定重复流程、数据源或样本、人工兜底边界和最小试点指标。",
] as const;

export const DEEP_DIAGNOSIS_CUSTOMIZATION_BLOCKING_SIGNALS = [
  "问题还没有稳定重复发生，只是一次性想法或临时需求。",
  "用户还没有跑通过自助工具版，缺少真实样本和效果数据。",
  "业务流程本身还没定型，责任人、输入、输出和判断标准都不清楚。",
  "当前损失无法描述，暂时看不出系统化投入的回报边界。",
  "涉及敏感数据、权限或对外动作，但用户还没有明确人工审核边界。",
] as const;

export const DEEP_DIAGNOSIS_CUSTOMIZATION_READINESS_RULES = [
  "只命中软信号时，只能建议先做自助工具版或工作流模板版，可提未来系统化方向，但不能推荐定制。",
  "至少命中一个硬信号，且没有阻塞信号，才允许写系统化升级判断。",
  "存在阻塞信号时，不能推荐定制，只能列出定制前置条件。",
  "推荐定制时必须说明业务损失、试点范围、成功指标、人工兜底和失败退出标准。",
] as const;

export const DEEP_DIAGNOSIS_CUSTOM_HANDOFF_QUESTIONS = [
  "现在线索、订单、客户、内容或任务数据分别记录在哪里？",
  "哪些角色会参与这个流程，谁负责最终结果？",
  "当前使用哪些系统或工具，例如飞书、企微、表格、CRM、POS、课程系统？",
  "希望先自动化哪一个具体动作：生成、提醒、分派、汇总、分析、审批还是复盘？",
  "可接受的试点周期、预算范围和失败退出标准是什么？",
] as const;

export const DEEP_DIAGNOSIS_ANTI_EMPTY_REPORT_RULES = [
  "没有诊断范围等级和报告级别，不生成完整诊断书",
  "没有入口范围路由，不允许直接把用户锁进单一问题；用户有多个问题时，必须先横向扫描再深挖",
  "没有横向扫描至少 3 个候选业务环节，不允许声称找到了最值得先做的环节",
  "横向扫描评分必须统一为分数越高越值得做；禁止出现预期价值为空、风险分越低越好这类方向混乱",
  "没有诊断假设树，不允许直接给最终建议；每个核心问题必须说明要查什么数据、如果是怎么修、如果不是排除什么",
  "没有用户确认关键事实，最多只能生成假设简报",
  "没有第一瓶颈定位，不生成完整诊断书",
  "没有证据来源的关键判断，必须标注为假设",
  "做过 webSearch 后，必须先输出外部分析摘要，再和用户实际情况做对照",
  "webSearch 失败、空结果或来源弱时，必须把失败状态写进报告，不能用自然语言补偿成已验证结论",
  "外部证据必须保留来源标题、链接、原始摘要和证据等级；普通搜索结果默认 C 级，只有权威机构、一手文档或官方案例才能升到 A/B 级",
  "外部资料必须先编译成证据块，再进入诊断结论；没有完整证据块的结论只能作为 C 级推断",
  "必须列出至少 1 个反例或不适配条件，说明什么情况下当前建议会被推翻",
  "没有取舍理由的机会点，不允许进入最高优先级",
  "没有可立即使用且带质量标准的资产，不算完成交付",
  "没有自助工具版、工作流模板版、系统 / Agent 定制版三档升级路径，不算完成高质量落地方案",
  "没有成功阈值、失败阈值和可能推翻结论的条件，不算完成验证闭环",
  "人格画像、用户类型和初诊标签只能作为先验，不能覆盖当前用户原话；若两者冲突，以当前事实为准",
] as const;

export const DEEP_DIAGNOSIS_EXTERNAL_RESEARCH_SECTIONS = [
  "搜索了什么问题",
  "搜索覆盖了哪些来源类型，哪些没有覆盖",
  "外部资料的关键发现",
  "证据等级、来源标题、链接和原始摘要",
  "反例、相反证据或不适配条件",
  "这些发现和用户现场哪里一致",
  "这些发现和用户现场哪里不一致",
  "证据如何支撑或削弱每个关键结论",
  "因此需要调整的诊断判断",
] as const;

export const DEEP_DIAGNOSIS_HORIZONTAL_SCAN_MATRIX_COLUMNS = [
  "候选环节",
  "预期价值",
  "落地容易度",
  "见效速度",
  "数据可得性",
  "第一瓶颈匹配度",
  "总分",
  "为什么不是其它环节",
] as const;

export const DEEP_DIAGNOSIS_FACT_CONFIRMATION_OPTIONS = [
  "补齐关键事实：继续追问会影响预算、目标、渠道、优先级、工具选择或验收标准的信息。",
  "跳过并降级出假设简报：允许带假设继续，但报告级别必须是 hypothesis_brief。",
  "继续诊断未覆盖模块：从未覆盖区域中选择下一个模块继续看。",
] as const;

export const DEEP_DIAGNOSIS_EVIDENCE_BINDING_COLUMNS = [
  "关键结论",
  "依据",
  "证据等级",
  "来自用户事实 / 外部资料 / 业务推断",
  "未验证缺口",
] as const;

export const DEEP_DIAGNOSIS_REPORT_SCORE_SECTIONS = [
  "当前级别可用度：评价这份 hypothesis_brief / 专项方案是否足够指导下一步行动。",
  "完整诊断书成熟度：评价它距离 complete report 还缺哪些事实、证据和覆盖范围。",
] as const;

export const DEEP_DIAGNOSIS_ASSET_QUALITY_CRITERIA = [
  "用户不需要二次理解产品说明即可直接使用",
  "包含输入字段、使用步骤和示例输出",
  "有明确验收标准，能判断产物是否合格",
  "不依赖未接入的数据或不可用工具",
  "能在 7 天内产出一次真实业务样本",
] as const;

export const DEEP_DIAGNOSIS_TODOS = [
  "TODO: publishHtmlReport 当前仍是占位发布链路，后续需要接入真实 HTML 文件发布和二维码生成。",
  "TODO: deep-diagnosis 独立会话目前仍依赖本地会话和已有诊断会话链路，后续需要独立服务端持久化。",
  "TODO: 深度诊断价格 / 价值边界后续单独设计，本轮不纳入实现。",
] as const;

export const DEEP_DIAGNOSIS_HUMAN_HANDOFF_SIGNALS = [
  "用户询问定制开发、系统接入、私有数据或企业知识库",
  "用户明确提到预算、上线周期、团队配合或部门决策",
  "方案涉及跨部门流程、权限审批、核心业务系统读写",
  "方案需要从工具试跑升级为工作流、Agent、看板或系统嵌入",
  "自助方案能验证价值，但长期执行依赖多人协作或业务系统接入",
  "自助诊断无法安全确认业务细节，继续推进可能造成误判",
  "用户主动表示想找人帮忙落地",
] as const;
