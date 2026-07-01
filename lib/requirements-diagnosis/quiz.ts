import type { QuizQuestion } from "./types";

export const REQUIREMENTS_DIAGNOSIS_STORAGE_KEY = "requirements-diagnosis.quiz.v3";
export const REQUIREMENTS_DIAGNOSIS_RESULT_KEY = "requirements-diagnosis.result.v3";

// ─── 经营画像 q1–q10，每维度2题，4选项（A=强左 / B=偏左 / C=偏右 / D=强右）
// ─── AI 落地画像 q11–q24，含4道新增认知题

export const quizQuestions: QuizQuestion[] = [
  // ── 商业视野：深耕 ↔ 拓展 ──────────────────────────────────────
  {
    id: "q1",
    section: "经营画像",
    dimension: "商业视野：深耕 ↔ 拓展",
    prompt: "遇到行业新风口，所有人都在冲，你第一反应是？",
    type: "single",
    options: [
      { value: "A", label: "先守稳现有业务，这类机会更适合观望" },
      { value: "B", label: "会关注，但只拿很小资源在现有能力范围内小测试" },
      { value: "C", label: "快速判断和现有业务的关联，再决定是否切入" },
      { value: "D", label: "先上车，有位置才能找到机会，错过才是最大成本" },
    ],
  },
  {
    id: "q2",
    section: "经营画像",
    dimension: "商业视野：深耕 ↔ 拓展",
    prompt: "你更认可哪种商业成长逻辑？",
    type: "single",
    options: [
      { value: "A", label: "一个方向做到极致，护城河越挖越深" },
      { value: "B", label: "把核心业务做稳后，再谨慎拓展相邻机会" },
      { value: "C", label: "同时布局几个相邻方向，哪个跑出来就加码" },
      { value: "D", label: "先跑多个方向，用组合机会放大增长窗口" },
    ],
  },

  // ── 判断方式：经验判断 ↔ 数据验证 ──────────────────────────────
  {
    id: "q3",
    section: "经营画像",
    dimension: "判断方式：经验判断 ↔ 数据验证",
    prompt: "业绩突然涨了30%，来源不明，你第一步是？",
    type: "single",
    options: [
      { value: "A", label: "延续当前打法，结果说明方向大概率对了" },
      { value: "B", label: "凭经验判断主要原因，顺带确认几个关键数据" },
      { value: "C", label: "拆解可能的原因，找到关键变量" },
      { value: "D", label: "先做归因分析，确认哪些因素可以被复制" },
    ],
  },
  {
    id: "q4",
    section: "经营画像",
    dimension: "判断方式：经验判断 ↔ 数据验证",
    prompt: "面对没做过的新项目，最能降低你不确定感的是？",
    type: "single",
    options: [
      { value: "A", label: "过往经验和对人、对市场的直觉" },
      { value: "B", label: "找到几个真实跑通的案例，摸清基本路径" },
      { value: "C", label: "设小范围验证，用真实样本先跑出信号" },
      { value: "D", label: "先建验证指标和分析框架，再投入资源" },
    ],
  },

  // ── 组织落地：系统重构 ↔ 快速试水 ──────────────────────────────
  {
    id: "q5",
    section: "经营画像",
    dimension: "组织落地：系统重构 ↔ 快速试水",
    prompt: "做一件新的事，你更接近哪种节奏？",
    type: "single",
    options: [
      { value: "A", label: "想清楚再动，宁可慢点，出手就是完整版" },
      { value: "B", label: "先搭好主框架再推出，边运营边完善细节" },
      { value: "C", label: "先出最小版本，验证核心假设，对了再投入" },
      { value: "D", label: "先跑起来，哪怕粗糙，边用边改比等完美更重要" },
    ],
  },
  {
    id: "q6",
    section: "经营画像",
    dimension: "组织落地：系统重构 ↔ 快速试水",
    prompt: "AI 试点验证成功后，你倾向怎么在团队推广？",
    type: "single",
    options: [
      { value: "A", label: "先整理成完整 SOP 和培训材料，再统一推广" },
      { value: "B", label: "先形成标准做法，再有节奏地推到其他团队" },
      { value: "C", label: "先让跑通的小团队继续深化，成熟后扩散" },
      { value: "D", label: "快速推给更多人，用真实反馈倒逼优化" },
    ],
  },

  // ── 投入心智：成本优先 ↔ 长期投入 ──────────────────────────────
  {
    id: "q7",
    section: "经营画像",
    dimension: "投入心智：成本优先 ↔ 长期投入",
    prompt: "判断一个 AI 项目值不值得做，你最看重什么？",
    type: "single",
    options: [
      { value: "A", label: "短期能节省多少时间、成本或人力" },
      { value: "B", label: "3 个月内能否看到可量化的改善" },
      { value: "C", label: "既要短期有效，也要能沉淀可复用的能力" },
      { value: "D", label: "能否建成数据资产或方法论，长期持续摊薄投入" },
    ],
  },
  {
    id: "q8",
    section: "经营画像",
    dimension: "投入心智：成本优先 ↔ 长期投入",
    prompt: "AI 试点头两周没有明显效果，你会怎么处理？",
    type: "single",
    options: [
      { value: "A", label: "先停掉，避免继续投入看不到回报的成本" },
      { value: "B", label: "缩小范围，要求更快看到可量化的结果" },
      { value: "C", label: "复盘原因，判断是方向问题还是执行问题" },
      { value: "D", label: "愿意继续优化，能力沉淀本来就需要周期" },
    ],
  },

  // ── 风险策略：风险防守 ↔ 创新进攻 ──────────────────────────────
  {
    id: "q9",
    section: "经营画像",
    dimension: "风险策略：风险防守 ↔ 创新进攻",
    prompt: "面对有机会但不确定的 AI 项目，你更倾向？",
    type: "single",
    options: [
      { value: "A", label: "权限清晰、边界确定，才考虑启动" },
      { value: "B", label: "先建评估清单，限定范围后谨慎推进" },
      { value: "C", label: "给小团队授权，快速做一个最小验证" },
      { value: "D", label: "把它当创新突破口，愿意先承担试错成本" },
    ],
  },
  {
    id: "q10",
    section: "经营画像",
    dimension: "风险策略：风险防守 ↔ 创新进攻",
    prompt: "一个尝试结果不理想，你通常怎么判断是否继续？",
    type: "single",
    options: [
      { value: "A", label: "看试错成本，代价高就先暂停或撤出" },
      { value: "B", label: "看方向是否成立，方向对就调整后继续" },
      { value: "C", label: "快速换切入角度，继续试" },
      { value: "D", label: "失败也是数据，积累样本直到找到突破口" },
    ],
  },

  // ═══ AI 落地画像 ═══════════════════════════════════════════════

  // ── 基础层：态度 / 关注 / 使用 / 工具 / 工作流 ───────────────────
  {
    id: "q11",
    section: "AI 落地画像",
    dimension: "AI 态度与心理准备度",
    prompt: "你现在对 AI 进入自己业务的态度，更接近哪种？",
    type: "single",
    options: [
      { value: "A", label: "观望，不确定投入后能不能看到实际效果" },
      { value: "B", label: "有兴趣，但需要先看懂具体案例和边界" },
      { value: "C", label: "已经尝试过，想找到更值得深入的场景" },
      { value: "D", label: "认可价值，准备系统地把 AI 放进工作流程" },
    ],
  },
  {
    id: "q12",
    section: "AI 落地画像",
    dimension: "AI 关注偏好",
    prompt: "你最关注 AI 的哪个方向？",
    type: "single",
    options: [
      { value: "A", label: "AI 前沿技术资讯：新模型、新能力、新突破" },
      { value: "B", label: "AI 落地商业结果：别讲技术，告诉我能带来什么结果" },
      { value: "C", label: "AI 学习成长路径：我想上手，从哪开始、怎么学" },
    ],
  },
  {
    id: "q13",
    section: "AI 落地画像",
    dimension: "日均 AI 工作使用时长",
    prompt: "你现在每天把 AI 实际用于工作的时间大概是？",
    type: "single",
    options: [
      { value: "A", label: "几乎没有把 AI 用进日常工作" },
      { value: "B", label: "1-2 小时" },
      { value: "C", label: "2-4 小时" },
      { value: "D", label: "4 小时以上" },
    ],
  },
  {
    id: "q14",
    section: "AI 落地画像",
    dimension: "已常态化使用的 AI 工具",
    prompt: "下面哪些 AI 工具已经进入你的日常工作？（可多选）",
    type: "multiple",
    options: [
      { value: "A", label: "AI 聊天工具：豆包、千问、DeepSeek、ChatGPT、Claude 等" },
      { value: "B", label: "低代码 AI 搭建工具：Coze、Dify、n8n 等" },
      { value: "C", label: "专业代码类 AI 工具：Cursor、Claude Code、Codex 等" },
      { value: "D", label: "专业 Agent 工具：OpenClaw、Hermes、CoWork 等" },
      { value: "E", label: "还没有任何 AI 工具进入日常工作" },
    ],
  },
  {
    id: "q15",
    section: "AI 落地画像",
    dimension: "AI 是否进入真实工作流",
    prompt: "AI 现在和你的真实工作的关系是？",
    type: "single",
    options: [
      { value: "A", label: "基本没有进入工作流，偶尔了解一下" },
      { value: "B", label: "个人临时使用，提效某些小任务" },
      { value: "C", label: "固定用于一个明确场景，有稳定使用习惯" },
      { value: "D", label: "多个场景都有固定用法，或已进入团队协作流程" },
    ],
  },

  // ── 认知层：AI 边界认知 / 参照系 / 协作偏好（新增）───────────────
  {
    id: "q16",
    section: "AI 落地画像",
    dimension: "AI 边界认知",
    prompt: "你认为 AI 目前最容易翻车的是哪类任务？",
    type: "single",
    options: [
      { value: "A", label: "需要精确数字和实时事实的任务（财务数据、最新行情等）" },
      { value: "B", label: "需要持续保持一致风格和品牌调性的长期内容输出" },
      { value: "C", label: "需要基于真实人际关系的销售、谈判或情感判断" },
      { value: "D", label: "我觉得 AI 现在已经很厉害了，基本没有明显短板" },
    ],
  },
  {
    id: "q17",
    section: "AI 落地画像",
    dimension: "AI 落地参照系",
    prompt: "你身边（同行、竞品、朋友）有没有让你印象深刻的 AI 落地案例？",
    type: "single",
    options: [
      { value: "A", label: "完全没有，身边人都还没在认真用 AI" },
      { value: "B", label: "有听说，但没看到具体效果" },
      { value: "C", label: "见过，大概知道是怎么做的" },
      { value: "D", label: "有，我亲自观察或参与过完整落地过程" },
    ],
  },
  {
    id: "q18",
    section: "AI 落地画像",
    dimension: "人机协作偏好",
    prompt: "AI 帮你完成了一项任务的80%，剩下20%需要你判断，你的处理方式是？",
    type: "single",
    options: [
      { value: "A", label: "从头到尾仔细检查 AI 的输出，再补完剩余" },
      { value: "B", label: "重点检查关键节点，对主体内容快速浏览" },
      { value: "C", label: "信任 AI 的主体输出，只处理它标注的不确定点" },
      { value: "D", label: "直接基于 AI 的结论行动，有问题再回头复盘" },
    ],
  },

  // ── 需求层：认知宽度 / 刚需 / 预期价值 ──────────────────────────
  {
    id: "q19",
    section: "AI 落地画像",
    dimension: "AI 认知宽度",
    prompt: "你觉得 AI 目前能帮你做以下哪些事？（可多选）",
    type: "multiple",
    options: [
      { value: "A", label: "替我干活：写方案、回消息、整理资料" },
      { value: "B", label: "替我创作：写小红书、做视频脚本、设计素材" },
      { value: "C", label: "替我分析：市场调研、竞品分析、数据整理" },
      { value: "D", label: "替我服务：客服回复、私域运营、社群管理" },
      { value: "E", label: "替我管理：订单跟踪、排期调度、流程监控" },
      { value: "F", label: "替我决策：商业方向、产品选择、定价策略" },
    ],
  },
  {
    id: "q20",
    section: "AI 落地画像",
    dimension: "AI 刚需诉求",
    prompt: "你当下最想让 AI 直接解决哪类工作难题？",
    type: "single",
    options: [
      { value: "A", label: "重复执行：方案初稿、自动回复、表格规整" },
      { value: "B", label: "内容创意：爆款笔记、短视频脚本、宣传素材" },
      { value: "C", label: "客户转化：客服回复、线索跟进、私域运营" },
      { value: "D", label: "经营分析：市场调研、竞品分析、复盘报告" },
      { value: "E", label: "复杂流程：内部 SOP、跨部门工作流、自动化闭环" },
    ],
  },
  {
    id: "q21",
    section: "AI 落地画像",
    dimension: "AI 预期价值",
    prompt: "你最希望 AI 给你的业务带来什么？",
    type: "single",
    options: [
      { value: "A", label: "节省时间和人力，做同样的事更快更省" },
      { value: "B", label: "做以前做不到的事，比如个性化内容、24 小时服务" },
      { value: "C", label: "让经营决策更有依据，减少靠感觉拍板的比例" },
      { value: "D", label: "建立可持续的差异化优势，让竞争对手难以追上" },
    ],
  },

  // ── 行动层：落地方式 / 阻力 / 深度诊断意愿 ──────────────────────
  {
    id: "q22",
    section: "AI 落地画像",
    dimension: "AI 落地方式偏好",
    prompt: "如果要真正把 AI 用起来，你更希望怎么落地？",
    type: "single",
    options: [
      { value: "A", label: "自己先学会工具，独立上手" },
      { value: "B", label: "套用已验证的模板和案例，降低试错成本" },
      { value: "C", label: "先做一个小流程自动化，跑通后再扩大" },
      { value: "D", label: "希望有人帮我对接方案，直接落地到业务结果" },
    ],
  },
  {
    id: "q23",
    section: "AI 落地画像",
    dimension: "AI 落地主要阻力",
    prompt: "如果现在推进 AI 落地，最大的阻力可能是？",
    type: "single",
    options: [
      { value: "A", label: "不知道从哪个业务场景开始" },
      { value: "B", label: "缺少工具方法，不知道怎么稳定做出来" },
      { value: "C", label: "现有流程混乱或团队执行习惯跟不上" },
      { value: "D", label: "担心预算和投入产出不清晰" },
    ],
  },
  {
    id: "q24",
    section: "AI 落地画像",
    dimension: "深度诊断意愿",
    prompt: "做完这份初步评测，你最希望接下来得到什么？",
    type: "single",
    options: [
      { value: "A", label: "一份可以立刻对照执行的操作清单" },
      { value: "B", label: "和人 1V1 聊一聊，把方向和下一步具体确认" },
      { value: "C", label: "看看和我类似情况的人是怎么落地 AI 的" },
      { value: "D", label: "先推荐几个工具试试，有感觉后再深入" },
    ],
  },
];
