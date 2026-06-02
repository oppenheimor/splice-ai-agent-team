import type { QuizQuestion } from "./types";

export const REQUIREMENTS_DIAGNOSIS_STORAGE_KEY = "requirements-diagnosis.quiz.v1";
export const REQUIREMENTS_DIAGNOSIS_RESULT_KEY = "requirements-diagnosis.result.v1";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    section: "经营画像",
    dimension: "商业视野：深耕 ↔ 拓展",
    prompt: "行业突然冒出风口，所有人都在冲。你第一反应是？",
    type: "single",
    options: [
      { value: "A", label: "冷静，看数据再决定" },
      { value: "B", label: "先上车，站着才有话语权" },
      { value: "C", label: "派人探路，其他人待命" },
    ],
  },
  {
    id: "q2",
    section: "经营画像",
    dimension: "商业视野：深耕 ↔ 拓展",
    prompt: "如果只能选一种成功路径，你会选择？",
    type: "single",
    options: [
      { value: "A", label: "一个领域做到前 10%" },
      { value: "B", label: "三个领域各做到前 30%" },
      { value: "C", label: "一个领域做深后，跨界再开一局" },
    ],
  },
  {
    id: "q3",
    section: "经营画像",
    dimension: "判断方式：经验判断 ↔ 数据验证",
    prompt: "业绩突然涨了 30%，但不确定是策略对还是市场好。你第一反应是？",
    type: "single",
    options: [
      { value: "A", label: "业绩结果为王，说明策略对了，继续深耕" },
      { value: "B", label: "必须拆清楚，能复制才是真本事" },
      { value: "C", label: "最初靠直觉为主，但可以看数据哪里对了，作为下次参考" },
    ],
  },
  {
    id: "q4",
    section: "经营画像",
    dimension: "组织落地：系统重构 ↔ 快速试水",
    prompt: "两种创业者，你更接近哪种风格？",
    type: "single",
    options: [
      { value: "A", label: "花三年打磨产品，一推出就惊艳" },
      { value: "B", label: "三个月出第一版，边卖边改迭代二十版" },
      { value: "C", label: "快速出 MVP，验证对了再回头精雕细琢" },
    ],
  },
  {
    id: "q13",
    section: "经营画像",
    dimension: "组织落地：系统重构 ↔ 快速试水",
    prompt: "如果一个 AI 试点跑通了，你更倾向怎么让团队真正用起来？",
    type: "single",
    options: [
      { value: "A", label: "重写流程、角色和考核方式，让它变成组织的固定能力" },
      { value: "B", label: "先让小团队继续用，边用边改，成熟后再逐步推广" },
      { value: "C", label: "先沉淀一套标准做法，再决定哪些团队适合复制" },
    ],
  },
  {
    id: "q5",
    section: "经营画像",
    dimension: "投入心智：成本优先 ↔ 长期投入",
    prompt: "如果要在公司里落地 AI，你更愿意怎么投入？",
    type: "single",
    options: [
      { value: "A", label: "先找一个能明确省人/省钱的环节，算清楚回报再投入" },
      { value: "B", label: "先投入一个能长期复用的基础能力，比如知识库、流程模板、自动化工作台" },
      { value: "C", label: "先用小预算做试点，跑通效果后再扩大投入" },
    ],
  },
  {
    id: "q6",
    section: "经营画像",
    dimension: "风险策略：风险防守 ↔ 创新进攻",
    prompt: "AI 试点有不确定性，你更倾向怎么启动？",
    type: "single",
    options: [
      { value: "A", label: "先选低风险、低影响环节，明确权限和边界再试" },
      { value: "B", label: "只要方向有机会，先做一个小试点快速验证，边跑边控风险" },
      { value: "C", label: "先建立评估清单和退出标准，再决定试点范围" },
    ],
  },
  {
    id: "q7",
    section: "经营画像",
    dimension: "风险策略：风险防守 ↔ 创新进攻",
    prompt: "如果第一个 AI 试点效果一般，你会怎么处理？",
    type: "single",
    options: [
      { value: "A", label: "先暂停扩大，复盘投入产出和风险，再决定是否继续" },
      { value: "B", label: "调整场景或流程，尽快换一个更有机会的切入点继续试" },
      { value: "C", label: "保留有效部分，缩小范围继续观察" },
    ],
  },
  {
    id: "q8",
    section: "AI 落地画像",
    dimension: "AI关注偏好",
    prompt: "你最关注 AI 的哪个方向？",
    type: "single",
    options: [
      { value: "A", label: "AI前沿技术资讯：新模型、新能力、新突破" },
      { value: "B", label: "AI落地商业结果和变现模式：别讲技术，告诉我结果" },
      { value: "C", label: "AI高效学习成长路径：我想上手，想知道从哪开始" },
    ],
  },
  {
    id: "q9",
    section: "AI 落地画像",
    dimension: "日均 AI 工作使用时长",
    prompt: "你现在每天把 AI 实际用于工作处理的时间大概是？",
    type: "single",
    options: [
      { value: "A", label: "几乎没有把 AI 用进日常工作" },
      { value: "B", label: "1-2 小时" },
      { value: "C", label: "2-4 小时" },
      { value: "D", label: "4 小时以上" },
    ],
  },
  {
    id: "q10",
    section: "AI 落地画像",
    dimension: "已常态化使用的 AI 工具",
    prompt: "下面哪些 AI 工具已经进入你的日常工作？",
    type: "multiple",
    options: [
      { value: "A", label: "AI 聊天工具：豆包、千文、元宝、DeepSeek、ChatGPT、Gemini 等" },
      { value: "B", label: "低代码 AI 搭建工具：Coze、Dify、n8n 等" },
      { value: "C", label: "专业代码类 AI 工具：Cursor、Claude Code、Codex 等" },
      { value: "D", label: "专业 Agent 工具：OpenClaw、Hermes、Workbuddy、QoderWork、CoWork 等" },
      { value: "E", label: "还没有任何 AI 工具进入日常工作" },
    ],
  },
  {
    id: "q11",
    section: "AI 落地画像",
    dimension: "AI 认知宽度",
    prompt: "你觉得 AI 目前能帮你做以下哪些事？",
    type: "multiple",
    options: [
      { value: "A", label: "替我干活：写方案、回消息、整理资料、看邮件" },
      { value: "B", label: "替我创作：写小红书、做视频脚本、设计海报" },
      { value: "C", label: "替我分析：市场调研、竞品分析、数据整理" },
      { value: "D", label: "替我服务：客服回复、私域运营、社群管理" },
      { value: "E", label: "替我管理：订单管理、库存跟踪、排期调度" },
      { value: "F", label: "替我决策：商业方向、产品选择、定价策略" },
    ],
  },
  {
    id: "q12",
    section: "AI 落地画像",
    dimension: "AI 刚需诉求",
    prompt: "你当下最想让 AI 直接解决哪类工作难题？",
    type: "single",
    options: [
      { value: "A", label: "重复性机械工作：写通用方案、批量对账、自动回复消息、规整表格" },
      { value: "B", label: "创意产出工作：小红书爆款笔记、短视频脚本、口播文案、宣传素材" },
      { value: "C", label: "复杂系统工作：订单全流程管理、客户私域 SOP、企业内部闭环工作流" },
    ],
  },
];
