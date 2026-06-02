# 需求诊断 Agent — 需求与架构分析（V2 — 基于 V3 问卷规格更新）

> 本文档基于 V3 问卷规格（思辨式商业AI人格诊断 12题精简版）更新，替代初版分析文档。

### 命名规范（约定）

> **Agent 标识符统一为 `requirements-diagnosis`（复数）**。
>
> - 路由：`/requirements-diagnosis/*`
> - Agent ID：`requirements-diagnosis`
> - 文件/目录：`requirements-diagnosis-*` / `requirements-diagnosis/`
> - 代码标识符：`requirementsDiagnosis`（camelCase）
>
> 不使用单数 `requirement-diagnosis`。"Requirements diagnosis" 复数更自然（类比 "requirements engineering"），且与现有代码（registry、proxy、prompt 文件名）保持一致，避免不必要重构。

---

## 1. 业务定位

**需求诊断 Agent = 用户的 AI 数字分身**，承接企业家朋友的 AI 转型咨询。

核心价值不是聊天，而是**专业诊断 + 实操建议**。用户交付预期：一份像你亲自给出的诊断报告 + 可落地的转型方案。

### 1.1 核心理念

> **不给你答案，只给你镜子。**
> **在AI时代，思辨是最大的宝藏——让你看见，你不止一种可能。**

这不是一个分类器，而是一面镜子。每一道题都是用户内心的一个岔路口，结论不是我们给的，是用户自己走过的路自己证明的。

### 1.2 与 treasure-hunt 的本质差异

| 维度 | treasure-hunt | requirements-diagnosis |
|------|--------------|----------------------|
| 交互模式 | 纯对话 | 问卷 → 评测结果 → 对话（三阶段） |
| 页面流程 | Hero → Chat | Hero → 答题 → 评测结果 → Chat |
| 工具需求 | AGUI 组件即可 | AGUI 组件 + **Web Search 等外部工具** |
| UI 风格 | 岛屿冒险主题 | 专业、商务、可信赖 |
| 上下文注入 | 无 | 问卷结果 + 评测结果自动注入 system prompt |
| 评测生成 | 无 | **纯算法计分 + LLM 增强叙事** |
| 数据持久化 | localStorage | **localStorage → DB 混合策略** |
| 对话起点 | 用户自由输入 | 用户已带诊断结果，Agent 已了解情况 |

---

## 2. 页面流程

```
/requirements-diagnosis              → Hero 首页
/requirements-diagnosis/quiz          → 答题页（12 道题，一页一题）
/requirements-diagnosis/result        → 评测结果页（算法计分 + LLM 增强叙事）
/requirements-diagnosis/chat/[id]     → Agent Chat Bot 页（深度诊断）
```

### 2.1 阶段 1：Hero 首页

- 标题 / 副标题 / 核心亮点（3-4 条）
- CTA 按钮：「开始评测」
- 整体风格：专业、冷静、可信赖（冷色调，非冒险岛屿风）
- 路由：`/requirements-diagnosis`

### 2.2 阶段 2：答题页（12 题）

#### 问卷结构

**第一部分：五维画像（7 题，单选）**

| 题号 | 维度 | 选项数 | 特殊计分规则 |
|------|------|--------|-------------|
| Q1 | 商业视野：深耕 ↔ 拓土 | A/B/C | - |
| Q2 | 商业视野：深耕 ↔ 拓土 | A/B/C | - |
| Q3 | AI工具认知：直觉 ↔ 精算 | A/B/C | **C = 仅左倾向(G)+0.5** |
| Q4 | 组织落地意愿：重构 ↔ 敏捷 | A/B/C | - |
| Q5 | 成本预算心智：控本 ↔ 长投 | A/B/C | **C = 左+0.5, 右+0.5** |
| Q6 | 风险耐受：防守 ↔ 创新 | A/B/C | **A和B均为左倾向(S)！** |
| Q7 | 风险耐受：防守 ↔ 创新 | A/B/C | - |

**第二部分：AI实践画像（5 题，混合类型）**

| 题号 | 维度 | 类型 | 选项数 |
|------|------|------|--------|
| Q8 | AI关注偏好（人群分叉口） | 单选 | A/B/C |
| Q9 | 日均AI有效使用时长 | 单选 | A/B/C/D |
| Q10 | 常态化AI工具清单 | **多选** | A/B/C/D |
| Q11 | AI认知宽度 | **多选** | A/B/C/D/E/F |
| Q12 | AI刚需诉求 | 单选 | A/B/C |

#### 答题交互设计

- **一页一题**，逐题推进，顶部进度条（3/12）
- 支持回退上一题（左箭头/按钮），不可跳跃到任意题
- Q10、Q11 为多选题，需 checkbox 样式 + 确认按钮
- **4 处过渡提示**（答完特定题目后展示，点击"继续"进下一题）：
  - Q3 后：💡 "这道题看的是你面对不确定性时的判断方式——直觉还是数据？"
  - Q8 后：💡 "这道题是你的分叉口——它决定你的身份后缀"
  - Q10 后：💡 "你选的工具决定了你在AI的哪一层"
  - Q12 后：💡 "最后一题——决定了我们推荐什么方向"
- 答完最后一题自动提交 → 前端算法计分 → 跳转结果页
- 路由：`/requirements-diagnosis/quiz`

#### 答题开场白

> 🪞 **不止一种可能**
>
> 7道题，没有对错，没有标准答案。
> 你选的不是答案，是你做决策的底层逻辑。
>
> 选你的第一反应。👇

### 2.3 阶段 3：评测结果页

#### 生成方式：算法计分 + LLM 增强叙事

**核心变化**：评测结果是**纯算法计算**的（不需要 LLM 算分），但叙事部分（"从数据到行动"段落、"最后想对你说的话"）由 LLM 增强生成。

```
答题完成
  → 前端算法计算：5维倾向 + 4字母人格代码 + L1-L5 + 用户类型 + 认知宽度 + 盲区
  → 前端立即渲染结构化报告骨架（人格代码、雷达图、进度条、AI实践画像等）
  → 同时调用 POST /api/agent-team/diagnosis/complete（保存 DB + 流式增强叙事）
  → LLM 流式生成个性化叙事段落
  → 前端流式渲染叙事内容
```

#### 结果页报告结构（11 个区块）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪞 你的思辨坐标
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧬 商业AI人格类型：[中文人格名]
英文简称：[前两位]-[后两位] · [英文全称诠释]
英文诠释：The [核心特征描述] — [一句话关键描述]
人格定义：[2-3句人格定义]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 雷达图 —— 你的五维人格形状
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[五维雷达图 SVG/Canvas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 五大维度数据
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[5行进度条：████████░░ XX% ↔ XX% ⭐]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💭 从数据到行动  ← LLM 增强生成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
①-⑤ 每维度：数据陈述 → 客观判断 → 积极引导

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗺️ 你的AI实践画像
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 用户类型 / 📈 AI应用级别 / 🧠 认知宽度+盲区 / 🎯 刚需方向

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 专属推荐路径
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[路径X]：[路径名] + [路径描述] + 🎁 [钩子]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 三步落地建议  ← LLM 增强生成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本周 / 本月 / 持续

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 最后想对你说的话——三层呼应  ← LLM 增强生成
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI技术逻辑 / 做事哲学 / 送给[人格名]一句话

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 这还只是你的「五维画像」
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[转化引导段：9种变体之一]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪞 不止一种可能
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- CTA：「深度诊断」→ 进入 Chat
- 路由：`/requirements-diagnosis/result`

### 2.4 阶段 4：Agent Chat Bot

- 流式对话 + Markdown 渲染 + AGUI 组件（复用 useAgentChat）
- **工具调用**（webSearch 为核心，Tavily API，未来可扩展行业报告/竞品分析等）
- **问卷结果自动注入 system prompt**（Agent 从第一轮就知道用户背景）
- 专业商务风格 Chat Shell（非岛屿主题）
- 路由：`/requirements-diagnosis/chat/[id]`

---

## 3. 算法计分引擎

### 3.1 五维倾向计分

**核心规则**：
- A 选项 = 左倾向（各维度左倾向不同）
- B 选项 = 右倾向（各维度右倾向不同）
- C 选项 = 中性/平衡倾向（A趋势+B趋势各+0.5分，**除非特殊说明**）

**五大维度偏向值计算**：

| 维度 | 代码 | 题目 | 左倾向 | 右倾向 | 左字母 | 右字母 |
|------|------|------|--------|--------|--------|--------|
| 商业视野 | V | Q1,Q2 | A=深耕(1),C=0.5 | B=拓土(1),C=0.5 | D(Deep) | E(Expand) |
| AI工具认知 | D | Q3 | A=直觉(1) | B=精算(1),C=0.5 | G(General) | P(Practical) |
| 组织落地意愿 | E | Q4 | A=重构(1) | B=敏捷(1),C=0.5 | R(Reconstruct) | A(Agile) |
| 成本预算心智 | A | Q5 | A=控本(1) | B=敏捷型投入(1),C=0.5 | C(Cost) | L(Long) |
| 风险耐受程度 | B | Q6,Q7 | A=防守(1),C=0.5 | B=创新(1),C=0.5 | S(Safe) | I(Innovate) |

**特殊计分规则**：
1. **Q3-C**：代表"直觉为主+数据参考" → 仅左倾向(G)+0.5
2. **Q5-C**：代表"试探型投入" → 左(C)+0.5, 右(L)+0.5
3. **Q6-A/B均为左倾向**：A（资源认知壁垒）和B（分析建壁垒）都是防守反应，只有C（分析再判断）是创新方向

**计算公式**：
```
左倾向分值 = A选数量 × 1 + C选数量 × 0.5（考虑特殊规则）
右倾向分值 = B选数量 × 1 + C选数量 × 0.5（考虑特殊规则）
左倾向% = 左倾向分值 / 总分值 × 100
右倾向% = 右倾向分值 / 总分值 × 100
```

### 3.2 平衡度星级判定

| 偏向比例差 | 星级 | 解读 |
|-----------|------|------|
| 偏差 ≥ 60%（80:20以上） | ⭐ | 极端倾向，短板的另一面可能是极限 |
| 偏差 20%-50%（60:40~75:25） | ⭐⭐ | 有明显倾向，但还有弹性空间 |
| 偏差 < 20%（50:50~60:40） | ⭐⭐⭐ | 接近平衡，切换自如，但可能模糊了真正优势 |

### 3.3 四字母人格代码生成

**前两位**：从五个维度中取最突出的1-2个非平衡维度（偏差≥20%）
- 0个非平衡：VB（Versatile Balanced）
- 1个非平衡：取该维度特征字母写两次（如 DD, EE, GG 等）
- 2个非平衡：直接取这两个字母（如 DG, EP 等）
- 3个及以上：取偏差最大的两个

**后两位**：用户身份类型（来自 Q8）
- Q8=A（关注AI前沿技术）→ TE = Tech Explorer · 技术探索者
- Q8=B（关注商业变现）→ EP = Entrepreneurial Pragmatist · 企业家实用派
- Q8=C（关注学习成长）→ AP = Application Practitioner · 应用实践者

**共计 75 种完整组合**：25种前两位特征 × 3种身份后缀

### 3.4 L1-L5 AI应用能力定级

| 级别 | 条件（从上向下匹配） | 标签 |
|------|------|------|
| L5 | Q9选C/D(2h+) **且** Q10同时选了A+B+C **且** Q8选B | 🧬 全域刚需层 |
| L4 | Q9选C/D(2h+) **且** Q10选了B(含低代码) **且** 不满足L5 | 🔧 工具瓶颈层 |
| L3 | Q9选B/C(1-4h) **且** Q10选了A且未选B | 🛠️ 单点应用层 |
| L2 | Q9选A/B(基本不用~1-2h) **且** Q10只选A或只选A+D | 🧪 基础试用层 |
| L1 | Q9选A(基本不用) **且** Q10选D或未选任何工具 | 👀 小白观望层 |

> **判定顺序必须从L5开始向下匹配**，因为L5条件最严格。

### 3.5 认知宽度评分

- Q11 选 1-2 个 → 🔍 聚焦认知
- Q11 选 3-4 个 → 🌐 拓展认知
- Q11 选 5-6 个 → 🗺️ 全景认知

**盲区提示**：用户没选的选项（取前3个），用自然短句展示而非生硬的"你没选X"。

### 3.6 三类人群判定逻辑

```
IF Q8==A AND L1-L2        → 第一类 🔬 技术好奇者/学习型
ELIF Q8==B AND L5         → 第三类 🎯 零基础纯刚需企业决策人
ELIF Q8==B AND L4         → 第二类 💼 有基础遇瓶颈企业主
ELIF Q8==B AND L1-L3      → 第二类 💼（浅层，可引导升级）
ELIF Q8==C AND L3+        → 第一类 🔬 深度学习者
ELIF Q8==C AND L1-L2      → 第一类 🔬 学习入门型
ELSE                       → 第二类 💼（默认fallback）
```

### 3.7 转化引导（9 种变体 = 3类人群 × 3种级别）

| 人群 | L1-L2 | L3-L4 | L5 |
|------|-------|-------|-----|
| 🔬 技术好奇者(TE) | AI创业入门方案 | AI创业升级方案 | AI创业全链路方案 |
| 💼 企业家实用派(EP) | 企业AI降本清单 | 企业AI转型路线图 | 企业AI定制方案 |
| 📖 应用实践者(AP) | AI学习+就业路线 | AI职业升级方案 | AI专家变现路径 |

---

## 4. 架构设计

### 4.1 整体流程架构

```
┌──────────┐    ┌──────────┐    ┌──────────────────┐    ┌───────────────┐
│  Hero    │───▶│  Quiz    │───▶│     Result       │───▶│  Chat Bot     │
│  首页    │    │  答题页  │    │  评测结果页       │    │  深度诊断对话  │
└──────────┘    └──────────┘    └──────────────────┘    └───────────────┘
                    │                   │                       │
                    ▼                   ▼                       ▼
              localStorage        算法计分(前端)          GET /chat
              (防刷新丢失)        + LLM增强(流式)        → 注入诊断上下文
                                  → localStorage          → webSearch 工具
                                  → 用户点"深度诊断"      → AGUI 组件
                                    后同步到 DB
```

### 4.2 后端数据流

```
答题答案
  → 前端算法计算（5维倾向 + 4字母代码 + L1-L5 + 用户类型 + 盲区）
  → 前端立即渲染结构化报告骨架（秒出）
  → 同时 POST /api/agent-team/diagnosis/complete（保存 DB + 流式 LLM 增强）
       → 保存评测结果到 DB（DiagnosisQuizResult）
       → LLM 生成个性化叙事（"从数据到行动"、"最后想对你说的话"）
  → 前端流式渲染叙事内容
  → 用户点击「深度诊断」→ 创建/继续 ChatSession → 进入 Chat
  → Chat API 读取 DB 中的诊断结果 → 注入 system prompt → 开始对话
```

### 4.3 数据持久化策略：全登录 + 1:1:N 模型

**已确认决策**：所有需求诊断页面均需登录，不存在未登录答题场景。

| 阶段 | 存储位置 | 理由 |
|------|---------|------|
| 答题过程 | localStorage | 防刷新丢失（答题中途刷新不丢数据） |
| 评测结果 | localStorage 即时渲染 + DB 持久 | 答完即存 DB（已登录），同时 localStorage 缓存用于即时渲染 |
| Chat 阶段 | DB 读取 | Agent 从 DB 读取诊断结果注入 system prompt |
| 评测历史 | DB | 用户可查看所有历史评测记录 |

**1:1:N 交互模型**：
- 1 个评测结果 = 最多 1 个 Chat 会话
- 1 个 Chat 会话 = N 轮对话（可持续，今天聊3轮，明天回来继续）
- 重新评测不覆盖旧记录，新增一条评测
- 评测历史列表需提供入口（Hero 页面或导航栏）

```
评测历史列表
├── 评测 #1 (5月27日) → 人格 DP-EP → [查看结果] [继续深度诊断→]
│   └── Chat 会话 (3轮，最后聊到"餐饮行业AI点餐方案")
├── 评测 #2 (6月3日)  → 人格 VB-TE → [查看结果] [开始深度诊断→]
│   └── (尚未开始Chat)
└── ...
```

### 4.4 AgentManifest 类型扩展

```typescript
// 新增
type ExternalToolName = "webSearch"; // 未来可扩展

type AgentManifest = {
  // ...existing fields
  tools: AgentToolName[];           // AGUI 交互工具（已有）
  externalTools: ExternalToolName[]; // 外部能力工具（新增）
};
```

### 4.5 Chat API 改造

**文件**：`app/api/agent-team/chat/route.ts`

改造点：
1. 需求诊断 Agent 的 Chat 请求必须携带 `quizResultId`（从 DB 读取诊断结果）
2. 后端拼接诊断结果进 system prompt
3. `pickTools` 函数扩展：合并 AGUI tools + external tools
4. webSearch 工具注册
5. 对话自动关联 `DiagnosisChatSession`（1:1 绑定评测结果）

```typescript
// 需求诊断 Chat 请求字段
type DiagnosisChatRequest = {
  agentId: string;
  quizResultId: string;     // 必传：关联的评测结果 ID
  conversationId?: string;  // 可选：已有对话 ID（继续上次对话）
  messages: UIMessage[];
};

// 后端处理流程
const quizResult = await prisma.diagnosisQuizResult.findUnique({
  where: { id: quizResultId },
  include: { chatSession: true },
});

// 首次对话：创建 chatSession
if (!quizResult.chatSession) {
  await prisma.diagnosisChatSession.create({
    data: { userId, quizResultId },
  });
}

// 注入诊断上下文
const diagnosisContext = buildDiagnosisContext(quizResult);
const systemPrompt = buildSystemPrompt(agent, diagnosisContext);
```

### 4.6 外部工具层

**新增目录**：`lib/agent-team/external-tools/`

```typescript
// web-search.ts — Tavily API 搜索工具
export const webSearchTool = tool({
  description: "搜索互联网获取行业动态、竞品信息、技术趋势、企业案例等",
  parameters: jsonSchema({
    type: "object",
    properties: {
      query: { type: "string", description: "搜索关键词" },
      maxResults: { type: "number", description: "最大结果数，默认5" },
    },
    required: ["query"],
  }),
  execute: async ({ query, maxResults = 5 }) => {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: "advanced",
        include_answer: true,
      }),
    });
    const data = await response.json();
    return {
      answer: data.answer,
      results: data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })),
    };
  },
});
```

### 4.7 数据库新增模型

```prisma
model DiagnosisQuizResult {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  answers         Json     // { q1: "A", q2: "B", ..., q10: ["A","B"], q11: ["A","C","D"] }
  // 五维倾向
  dimensionScores Json     @map("dimension_scores")
    // { V: { left: 60, right: 40 }, D: { left: 25, right: 75 }, ... }
  // 人格代码
  personalityCode String   @map("personality_code")  // 如 "DP-EP"
  personalityName String   @map("personality_name")  // 如 "深耕精算企业家"
  // AI实践
  aiLevel         String   @map("ai_level")           // L1-L5
  userType        String   @map("user_type")          // TE/EP/AP
  cognitiveWidth  String   @map("cognitive_width")     // 聚焦/拓展/全景
  blindSpots      Json     @map("blind_spots")         // 盲区列表
  justNeed        String   @map("just_need")           // Q12 刚需方向
  // LLM 增强叙事（流式生成后存储）
  enhancedNarrative Json?  @map("enhanced_narrative")  // 叙事增强结果
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  user            User     @relation(fields: [userId], references: [id])
  // 1:1 关联 — 一个评测最多对应一个 Chat 会话
  chatSession     DiagnosisChatSession?

  @@map("diagnosis_quiz_results")
}

model DiagnosisChatSession {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  quizResultId    String   @unique @map("quiz_result_id")  // 1:1 关联评测
  // 对话状态
  status          String   @default("active") @map("status") // active / archived
  lastMessageAt   DateTime @default(now()) @map("last_message_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  // 关联
  user            User     @relation(fields: [userId], references: [id])
  quizResult      DiagnosisQuizResult @relation(fields: [quizResultId], references: [id])

  @@map("diagnosis_chat_sessions")
}
```

### 4.8 评测完成 API（保存 DB + LLM 叙事）

**新增**：`app/api/agent-team/diagnosis/complete/route.ts`

```
POST /api/agent-team/diagnosis/complete
请求：{
  answers: Record<string, string | string[]>,
  dimensionScores: DimensionScores,
  personalityCode: string,
  personalityName: string,
  aiLevel: string,
  userType: string,
  cognitiveWidth: string,
  blindSpots: string[],
  justNeed: string,
}
处理：
  1. 保存评测结果到 DB（DiagnosisQuizResult）
  2. 构造叙事增强 prompt → streamText → 流式返回
响应：Server-Sent Events (SSE) 流式
```

LLM 只负责生成需要语义理解的叙事段落：
1. "从数据到行动"（5个维度的个性化解读）
2. "三步落地建议"（本周/本月/持续）
3. "最后想对你说的话"（AI技术逻辑 + 做事哲学 + 人格定制一句话）

#### 叙事增强失败降级策略

**原则：报告骨架必须可用，永不阻塞结果页。**

```
答题完成 → 前端算法计算 → 立即渲染结构化报告骨架（无需任何后端请求）
         → POST /complete → DB 保存（必须成功）→ 流式叙事增强
                                       ↓                        ↓
                                  DB 成功               叙事增强成功/失败
                                       ↓                        ↓
                              骨架 + 叙事（完整体验）   骨架 + 重试按钮
```

**降级分级**：

| 场景 | DB 状态 | 叙事状态 | 前端展示 |
|------|---------|---------|---------|
| 正常 | ✅ 已保存 | ✅ 流式返回 | 完整报告（骨架 + 叙事） |
| DB 成功 + 叙事失败 | ✅ 已保存 | ❌ 超时/异常 | 骨架报告 + 叙事区显示"AI 叙事生成中，点击重试"按钮 |
| DB 失败 | ❌ 异常 | — | 骨架报告 + 全局提示"保存失败，请重试"+ 重试按钮（重试整个 /complete） |
| 流式中途断开 | ✅ 已保存 | ⚠️ 部分 | 已渲染的叙事保留 + 断点处显示重试按钮（仅重试叙事） |

**重试逻辑**：
- 首次失败：自动重试 1 次（前端静默）
- 二次失败：展示重试按钮，用户手动触发
- 重试请求：`POST /api/agent-team/diagnosis/complete` + `{ quizResultId: "xxx", retryNarrative: true }`
- 后端收到 `retryNarrative: true` 时跳过 DB 写入，仅重新生成叙事流

### 4.9 评测历史 API

**新增**：`app/api/agent-team/diagnosis/history/route.ts`

```
GET /api/agent-team/diagnosis/history
处理：查询当前用户的所有评测结果（按时间倒序），含 chatSession 状态
响应：{ results: DiagnosisQuizResult[] }
```

---

## 5. AGUI 工具集

### 5.1 需求诊断场景工具选择

| AGUI 工具 | 需求诊断是否需要 | 用途 |
|-----------|----------------|------|
| askUserChoice | ✅ | 澄清需求、选择方向 |
| showCards | ✅ | 候选方案、转型路线 |
| showChart | ✅ **关键** | 行业数据、投入产出、维度分析 |
| showComparison | ✅ | 方案对比、工具选型 |
| showChecklist | ✅ | 实施步骤、交付清单 |
| showTimeline | ✅ | 转型路线图、里程碑 |
| showScorecard | ✅ **关键** | 可行性评估、就绪度评分 |
| showDataTable | ✅ | 财务数据、竞品清单、工具参数、来源结果等结构化表格 |
| showFramework | ✅ | AI 成熟度模型、转型路径图、诊断框架、方法论结构展示 |

### 5.2 新增 AGUI 工具

#### `showDataTable`

用于展示高密度结构化信息，避免把表格压进 Markdown 后在移动端难读。

典型场景：
- 行业/竞品/工具清单
- 成本、投入产出、预算拆解
- webSearch 来源列表
- POC 方案的功能项、优先级、负责人、周期

#### `showFramework`

用于展示抽象模型和方法论结构，帮助用户理解诊断逻辑。

典型场景：
- 企业 AI 成熟度模型
- 单点提效 → 流程自动化 → 系统重构的转型路径
- 业务诊断框架
- 技术选型决策树

---

## 6. Chat 页面 UI 差异化

### 6.1 复用策略

| 组件 | 策略 |
|------|------|
| `useAgentChat` Hook | 100% 复用，不改动 |
| `AgentChatShell` | 作为基础结构参考，独立实现 `DiagnosisChatShell` |
| AGUI 工具渲染器 | 基于通用渲染器做样式调整，不需要像 treasure-hunt 那样完全重写 |
| `Composer` | 可复用，微调样式 |
| `ConversationPanel` | 可复用 |

### 6.2 独立实现的部分

- **DiagnosisChatShell**：专业商务风格 Chat Shell
  - 配色：冷色调/深蓝灰，专业可信
  - 布局：更宽的内容区域展示图表/报告
  - 空状态：展示诊断结果摘要 + 建议的下一步
  - 消息气泡：更简洁专业的样式

- **DiagnosisMessagePartsRenderer**：消息渲染（可基于通用版调整样式）

---

## 7. 需求诊断 Agent 配置

```typescript
// registry.ts 更新
{
  id: "requirements-diagnosis",
  name: "需求诊断 Agent",
  route: "/requirements-diagnosis",
  category: "diagnosis",
  description: "思辨式商业AI人格诊断 — 企业AI转型需求诊断与深度咨询",
  version: "0.3.0",
  starterPrompts: [
    "帮我分析我们公司的 AI 转型路线",
    "我想了解行业里 AI 转型的最佳实践",
    "帮我制定一份 AI 转型 POC 方案",
  ],
  tools: [
    "askUserChoice",
    "showCards",
    "showChart",
    "showComparison",
    "showChecklist",
    "showTimeline",
    "showScorecard",
  ],
  externalTools: ["webSearch"],
  rendererProfile: "default",
  promptBuilder: "requirementsDiagnosis",
  memoryPolicy: { mode: "session" },
}
```

---

## 8. 新增文件清单

```
页面（4 + 1 个）：
  app/requirements-diagnosis/page.tsx              → Hero（重写现有占位页，含评测历史入口）
  app/requirements-diagnosis/quiz/page.tsx          → 答题页
  app/requirements-diagnosis/result/page.tsx        → 评测结果页
  app/requirements-diagnosis/chat/[id]/page.tsx     → Chat 页
  app/requirements-diagnosis/history/page.tsx       → 评测历史列表页

API（3 新增 + 1 改造）：
  app/api/agent-team/diagnosis/complete/route.ts    → 保存评测 + LLM 叙事增强（流式）
  app/api/agent-team/diagnosis/history/route.ts     → 评测历史查询
  app/api/agent-team/chat/route.ts                  → 改造（外部工具 + 诊断上下文注入 + ChatSession 关联）

诊断逻辑（3 个）：
  lib/agent-team/diagnosis/scoring.ts               → 五维计分引擎
  lib/agent-team/diagnosis/level.ts                 → L1-L5 定级逻辑
  lib/agent-team/diagnosis/personality-types.ts     → 75种人格类型表

组件（~9 个）：
  components/requirements-diagnosis/
    DiagnosisChatShell.tsx                           → 专业风格 Chat Shell
    DiagnosisMessagePartsRenderer.tsx                → 消息渲染
    DiagnosisHero.tsx                                → Hero 首页组件
    QuizFlow.tsx                                     → 答题流程组件（含过渡提示）
    QuizProgress.tsx                                 → 答题进度条
    ResultDashboard.tsx                              → 评测结果仪表盘（含雷达图）
    RadarChart.tsx                                   → 五维雷达图组件（ECharts）
    PlaceholderAvatar.tsx                            → 人格头像占位组件（渐变色+人格代码）

Prompt（2 个）：
  lib/agent-team/agents/prompts/requirements-diagnosis.ts         → Chat 系统提示（✅ 已完成）
  lib/agent-team/agents/prompts/requirements-diagnosis-enhance.ts → 评测叙事增强

外部工具（2 个）：
  lib/agent-team/external-tools/index.ts
  lib/agent-team/external-tools/web-search.ts

类型改造（2 个）：
  lib/agent-team/agents/types.ts      → 新增 ExternalToolName，扩展 AgentManifest（✅ 已完成）
  lib/agent-team/agents/registry.ts  → 更新 requirements-diagnosis 配置
```

---

## 9. 关键技术决策记录

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 答题交互 | 一页一题逐步推进 | 体验流畅，聚焦度高 |
| 答题回退 | 支持回退上一题 | 允许纠错，但不能跳跃造成混乱 |
| 搜索 API | Tavily | 专注 AI Agent 搜索场景，结果质量高，有中国区域支持 |
| Chat 上下文注入 | 自动注入 system prompt + 前端展示摘要卡片 | Agent 自动读取诊断结果，用户无需重复说明 |
| 评测结果生成 | **算法计分 + LLM 增强叙事** | 算法保证计分准确，LLM 增强个性化解读 |
| 数据持久化 | **localStorage 防刷新 + DB 全量存储** | 全页面登录保护，答题过程 localStorage 防刷新，答完即存 DB |
| 评测→Chat 模型 | **1:1:N（1评测:1会话:N轮对话）** | 简单清晰，支持持续对话，历史记录可追溯 |
| 图表库 | **ECharts**（非 recharts） | 配置灵活，雷达图+后续趋势图都方便，动态 import 即可 |
| 人格头像 | **渐变色占位 + AI 生图后期替换** | 开发阶段用 CSS 渐变占位，AI 生图提示词体系已设计（第14节） |
| CSV 导出 | 不需要，后端 DB 即可 | 简化实现，后续可通过管理后台导出 |
| Q6 计分 | A和B均为左倾向（防守） | V3 设计：两种反应都是防守策略，C 才是创新方向 |
| 评测历史 | 提供 Hero/导航栏入口 | 用户可查看所有历史评测，支持重测和继续深度诊断 |

---

## 10. 待提供内容

| # | 内容 | 影响范围 | 状态 |
|---|------|---------|------|
| 1 | 12 道题的具体题目和选项 | Quiz 页面、评测引擎 | ✅ 已提供（V3 文档） |
| 2 | 评测结果的框架设计 | Result 页面、评测引擎 | ✅ 已提供（V3 文档） |
| 3 | 评测叙事增强 Prompt | 评测增强 API | 🔄 可基于报告模板推导 |
| 4 | **Chat 阶段的系统 Prompt**（数字分身人格设定、工作方式、专业领域约束等） | Chat API、Prompt 文件 | ✅ 已设计（见第 12 节） |
| 5 | Hero 首页的标题、副标题、亮点文案 | Hero 页面 | 🔄 占位中（先随便生成，后续打磨） |
| 6 | 答题过渡语中第二部分的开场白 | Quiz 页面 Q8 前的过渡 | ✅ 已提供（V3 文档） |

---

## 11. 实施顺序建议

### Phase 1：诊断引擎 + 答题页面

1. 实现诊断计分引擎（`scoring.ts` + `level.ts` + `personality-types.ts`）
2. 实现 Quiz 页面（一页一题 + 进度条 + 回退 + 过渡提示 + 多选题支持）
3. 答题数据 localStorage 缓存

### Phase 2：评测结果页

1. 实现 Result 页面（人格代码卡片 + 五维雷达图 + 进度条 + AI实践画像）
2. 实现评测叙事增强（`/api/agent-team/diagnosis/complete` 内置流式增强 + 降级）
3. 前端流式渲染 LLM 叙事内容（失败时降级为结构化骨架 + 重试按钮）
4. 转化引导段（9种变体）

### Phase 3：基础设施（外部工具 + Chat 改造）

1. 扩展 AgentManifest 类型（新增 `externalTools`）
2. 实现外部工具层（`external-tools/web-search.ts`）
3. 改造 Chat API（支持外部工具 + 诊断上下文注入）
4. 配置 Tavily API Key

### Phase 4：Chat 页面

1. 实现 DiagnosisChatShell（专业商务风格）
2. 对接 useAgentChat + 诊断上下文注入
3. 验证 webSearch 工具调用流程
4. 实现 Chat 系统 Prompt

### Phase 5：Hero 首页

1. 重写 Hero 页面（专业风格，非岛屿冒险）
2. 与答题页对接

> Hero 放最后，因为它不涉及核心逻辑，且需要整体视觉风格确定后再打磨。

---

## 附录 A：75 种人格类型速查

> 📄 **完整 V3 问卷规格（12 题全文、75 种人格类型表、9 种转化引导、经验教训等）见 [`v3-quiz-spec.md`](./v3-quiz-spec.md)**

以下是维度字母速查：

| 维度 | 代码 | 左倾向 | 右倾向 | 平衡 |
|------|------|--------|--------|------|
| 商业视野 | V | D(深耕) | E(拓土) | B |
| AI工具认知 | D | G(直觉) | P(精算) | B |
| 组织落地意愿 | E | R(重构) | A(敏捷) | B |
| 成本预算心智 | A | C(控本) | L(长投) | B |
| 风险耐受程度 | B | S(防守) | I(创新) | B |

身份后缀：TE(技术探索者) / EP(企业家实用派) / AP(应用实践者)

## 附录 B：V3 经验教训（实现时必读）

1. **18题太长，12题是平衡点** — 保持核心信息链完整，完成时间3分钟
2. **选项不能有明显的"好选项"** — 每个选项都必须是正常人会做出的合理选择
3. **C选项是刚需** — "都沾点边但不极端"的选择，降低"选错"压力
4. **雷达图比数据条更快传递画像** — 形状总结框最关键
5. **同一道题不同时间测结果可能不同** — 报告用"此刻的脚印"，不说"画像稳定"
6. **提问风格不能太情绪化** — 题干保持干练，无emoji、无故事化
7. **报告开头需要MBTI式人格定义作为锚点** — 首尾呼应
8. **认知宽度盲区是用户转发意愿最强的段落** — Q11 必须保留
9. **选项措辞中的修饰语可能和计分方向打架** — 统一指向该选项所代表的倾向方向

---

## 12. Chat 阶段系统 Prompt 设计

> 参考实现：`lib/agent-team/agents/prompts/requirements-diagnosis.ts`
>
> 设计参考来源：fbs-iplib Agent Team 的库长执行规范

### 12.1 设计理念

Chat 阶段的 Prompt 是需求诊断智能体的"灵魂"。它不是通用聊天机器人的 prompt，而是**用户的 AI 数字分身**的运行规范。

核心设计原则：
- **fbs-iplib 的「首响契约」** → 用户进来就知道 Agent 能做什么
- **fbs-iplib 的「三层运行模式」** → 适配不同复杂度的问题
- **fbs-iplib 的「输出纪律」** → 杜绝 AI 痕迹，像人说话
- **fbs-iplib 的「证据等级」** → 区分事实和推断
- **fbs-iplib 的「降级策略」** → 工具不可用时的备选方案
- **V3 诊断结果的联动** → 从第一轮就基于用户画像对话

### 12.2 Prompt 结构（11 个模块）

| # | 模块 | 来源 | 核心内容 |
|---|------|------|---------|
| 1 | 身份与定位 | 业务需求 | 用户的 AI 数字分身，承接企业家朋友的 AI 转型咨询 |
| 2 | 诊断上下文感知 | 新设计 | 自动感知注入的 V3 诊断结果，不让用户重复说明 |
| 3 | 三层运行模式 | fbs-iplib 三层模式 | L1 速答(60s) / L2 结构化分析(3-5min) / L3 深度调研(10-15min) |
| 4 | 首响契约 | fbs-iplib 首响契约 | 冷启动四步：认出用户 → 本轮先做 → 本轮不做 → 下一步 |
| 5 | 场景路由 | fbs-iplib 场景路由 + V3 九类人群 | 3 人群 × 3 级别 = 9 种对话策略 |
| 6 | 证据等级 | fbs-iplib 证据等级 | A(一手数据) / B(行业分析) / C(AI推断) / D(未验证) |
| 7 | 输出纪律 | fbs-iplib 输出纪律 | 禁泄露/禁推理/禁编造/禁投资建议 + 每轮必给可执行建议 |
| 8 | 工具使用规范 | 新设计 | AGUI 工具映射 + webSearch 触发/搜索策略 |
| 9 | 降级策略 | fbs-iplib 降级策略 | 搜索超时/空结果/不可用/渲染失败 四级降级 |
| 10 | 合规护栏 | fbs-iplib 合规护栏 + 新增 | 投资/法律/报价/医疗 四类敏感边界 |
| 11 | 诊断结果联动 | 新设计 | 人格代码→语言风格, 五维→建议侧重, AI级别→信息密度, 盲区→补充角度 |

### 12.3 与 fbs-iplib 的关键差异

| 维度 | fbs-iplib（5 专家协作） | 需求诊断（单人 Agent） |
|------|------------------------|----------------------|
| 运行模式 | 30 秒卡 / 精简诊断 / 五专家工作坊 | 速答 / 结构化分析 / 深度调研 |
| 协作方式 | 库长调度专家，四段式回传 | 单人运行，无专家协作 |
| 诊断数据来源 | 用户实时输入 + 专家采集 | **前置问卷结果自动注入** |
| 场景路由 | 9 种 scenePackId | 3 人群 × 3 级别 = 9 种策略 |
| 搜索能力 | 连接器真实调用 | Tavily webSearch + 降级策略 |
| 输出复杂度 | 多专家合稿 | 单人输出，限制 500 字/轮 |

### 12.4 诊断上下文注入方式

Chat API 在构建 system prompt 时，调用 `buildSystemPrompt(agent, diagnosis)` 将诊断结果注入。注入格式为结构化的 YAML-like 代码块：

```
【用户诊断结果 — 自动注入，用户无需重复说明】
```diagnosis
人格代码: DP-EP
人格名称: 深耕精算企业家
AI应用级别: L3
用户类型: EP
人群分类: 💼 有基础遇瓶颈企业主
认知宽度: 🌐 拓展认知
刚需方向: B

五维倾向:
  商业视野(深耕↔拓土): 左65% ↔ 右35%
  AI工具认知(直觉↔精算): 左25% ↔ 右75%
  组织落地意愿(重构↔敏捷): 左40% ↔ 右60%
  成本预算心智(控本↔长投): 左55% ↔ 右45%
  风险耐受程度(防守↔创新): 左70% ↔ 右30%

认知盲区: AI编程/开发、AI硬件/芯片、AI安全/隐私
```
```

### 12.5 首响示例

**冷启动（用户第一次进 Chat）**：

> 你是一个深耕型、精算导向的企业家——做事稳，但一旦看准数据就不会犹豫。你现在的 AI 用到了工具层，但还没变成刚需。
>
> 我能帮你做三件事：分析你所在行业的 AI 转型机会、对比同类企业的落地路径、做一份分阶段的 POC 方案。
>
> 你想先聊哪个方向？还是直接说你的具体问题？

**热恢复（用户回来继续聊）**：

> 上次聊到餐饮行业的智能点餐方案，我先帮你查了最新的行业数据——直接说结论。

---

## 13. 已确认决策记录

> 开发前与用户确认的所有关键决策，落盘于此。

### 13.1 全页面登录保护

所有需求诊断页面（Hero/Quiz/Result/Chat）均需登录。未登录用户访问时重定向到登录页。

### 13.2 Tavily API Key

已获取，存放于 `.env.local`（`TAVILY_API_KEY`），不进代码仓库。

### 13.3 图表库：ECharts

放弃 recharts，使用 ECharts。注意：
- ECharts 不支持 SSR，需动态 import（`const Chart = dynamic(() => import(...), { ssr: false })`）
- 雷达图配置灵活，后续做趋势对比图也方便
- 安装包：`echarts` + `echarts-for-react`（React 封装）

### 13.4 评测 → Chat 交互模型：1:1:N

```
评测历史列表
├── 评测 #1 (5月27日) → 人格 DP-EP → [查看结果] [继续深度诊断→]
│   └── Chat 会话 #1 (3轮，最后聊到"餐饮行业AI点餐方案")
│
├── 评测 #2 (6月3日)  → 人格 VB-TE → [查看结果] [开始深度诊断→]
│   └── (尚未开始Chat)
│
└── 评测 #3 (6月10日) → 人格 VA-AP → [查看结果] [继续深度诊断→]
    └── Chat 会话 #3 (1轮，刚开始)
```

**规则**：
- 1 个评测 = 最多 1 个 Chat 会话
- 点"深度诊断"→ 创建新会话（如果还没有）或继续已有会话
- 重新评测不覆盖旧记录，而是新增一条
- 评测历史列表需提供入口（从 Hero 或导航栏进入）
- Chat 会话可持续（分多次完成），但一个评测永远只有一个会话

### 13.5 Hero 文案

先占位，后续打磨。

### 13.6 人格类型数据

按 V3 文档中的内容录入代码（`personality-types.ts`）。

### 13.7 人格头像：占位 + AI 生图提示词

开发阶段用占位图（渐变色块 + 人格代码文字），后续用 AI 生图替换。

头像体系设计为 **3 基底 × N 倾向色** 的组合模式（详见第 14 节）。

### 13.8 Chat 消息持久化：先专属表，预留统一模型字段

需求诊断先新增专属表：
- `DiagnosisChatSession`
- `DiagnosisChatMessage`

原因：需求诊断 Chat 与评测结果存在强绑定关系（`quizResultId` → 1 个 Chat 会话 → N 轮消息），生命周期不同于 treasure-hunt 的普通对话。

为降低未来多 Agent 统一消息表的迁移成本，`DiagnosisChatMessage` 字段按 AI SDK / AGUI 结构化消息预留：
- `parts Json?`
- `metadata Json?`
- `toolCalls Json?`
- `sources Json?`

### 13.9 Result 页查询参数

评测结果页必须带明确查询参数：

```
/requirements-diagnosis/result?quizResultId=xxx
```

不使用泛化的 `id`，避免历史评测、重试叙事、进入 Chat 时语义混淆。

### 13.10 Chat URL 与会话 ID 语义

Chat 页面 URL 使用 `quizResultId`：

```
/requirements-diagnosis/chat/[quizResultId]
```

`quizResultId` 是用户进入诊断 Chat 的稳定业务入口。后端可内部创建 `DiagnosisChatSession.id`，但 URL、恢复会话、上下文注入均以 `quizResultId` 为主键语义。

### 13.11 Streaming 契约与历史回放

Chat 流式协议沿用 Vercel AI SDK message `parts` / Data Stream，不自定义裸 SSE 文本协议。

历史回放需要恢复：
- 用户/助手文本
- AGUI 工具卡片
- webSearch 来源链接
- 工具成功/失败状态

不能只保存纯文本，否则刷新后会丢失工具上下文和来源证据。

### 13.12 webSearch 来源展示

webSearch 来源链接需要可见展示。

第一版展示策略：
- 工具结果卡片展示 3-5 条来源
- 助手最终回答底部展示「参考来源」列表
- 暂不做逐句 citation，避免第一版复杂度过高

### 13.13 叙事增强重试 API

评测叙事增强失败时复用同一个 API：

```
POST /api/agent-team/diagnosis/complete
{
  "quizResultId": "xxx",
  "retryNarrative": true
}
```

后端收到 `retryNarrative: true` 时跳过 DB 初次写入，只重新生成叙事流并更新 `enhancedNarrative`。

---

## 14. 人格头像 AI 生图提示词体系

### 14.1 设计思路

75 种人格全设计头像工作量太大。采用**基底 × 倾向色**的组合逻辑：

| 层级 | 数量 | 逻辑 | 视觉效果 |
|------|------|------|---------|
| 基底 | 3 种 | TE / EP / AP 三类身份 | 3 个差异化主形象（构图+核心图标） |
| 倾向色 | 5×2=10 种 | 五维 × 左右倾向 | 在基底上叠加色调/光晕变化 |
| 实际组合 | ≤30 种 | 基底 + 主倾向色 | 代码可生成，AI 也可批量出图 |

实际开发中先用**渐变色占位**，后期用 AI 生图替换。

### 14.2 三类基底设计

| 身份 | 代号 | 视觉关键词 | 构图 | 基底色 | 核心图标/符号 |
|------|------|-----------|------|--------|-------------|
| 技术好奇者 | TE | 精密·探索·数据流 | 中心对称，几何线条辐射 | 冷钢蓝 `#3B82F6` + 银灰 | 电路节点 / 放大镜 / 代码符号 `</>` |
| 企业家实用派 | EP | 沉稳·战略·罗盘 | 三角稳固构图，底部重 | 暖琥珀 `#F59E0B` + 深藏青 | 罗盘 / 棋盘 / 上升箭头 |
| 应用实践者 | AP | 锋利·前沿·电光 | 前倾动态，向上突破 | 电光紫 `#8B5CF6` + 翠绿 | 闪电 / 火箭 / 光谱棱镜 |

### 14.3 五维倾向色映射

每个维度有两个方向，各自对应一种色调/光晕。当某维度是用户的主导偏差时，该色调会叠加到基底上：

| 维度 | 左倾向（防守/深耕） | 左倾向色 | 右倾向（创新/拓土） | 右倾向色 |
|------|-------------------|---------|-------------------|---------|
| V 商业视野 | 🌿 深耕·扎根 | `#059669` 翠绿 | 🌅 拓土·远望 | `#F97316` 暖橙 |
| D AI工具认知 | 🫧 直觉·感知 | `#A78BFA` 柔紫 | 🔍 精算·解析 | `#0EA5E9` 钢蓝 |
| E 组织落地意愿 | 🏗️ 重构·系统 | `#DC2626` 深红 | 🏄 敏捷·轻快 | `#06B6D4` 青碧 |
| A 成本预算心智 | 🪙 控本·精打 | `#92400E` 暖棕 | 🌱 长投·生长 | `#10B981` 翡翠绿 |
| B 风险耐受程度 | 🛡️ 防守·稳守 | `#6B7280` 冷灰 | ⚡ 创新·突破 | `#C026D3` 电紫 |

### 14.4 组合规则

人格代码如 `DP-EP`：
- 后 2 位 `EP` → 基底 = 企业家实用派
- 前 2 位中每个字母 → 对应维度的倾向方向 → 叠加倾向色

代码示例（伪代码）：
```typescript
function getAvatarConfig(code: string) {
  const identity = code.slice(-2); // TE / EP / AP
  const tendency1 = code[0];       // 第一主导维度的倾向字母
  const tendency2 = code[1];       // 第二主导维度的倾向字母（如有）

  return {
    base: BASE_STYLES[identity],           // 基底构图+基底色
    accent1: TENDENCY_COLORS[tendency1],   // 主倾向色叠加
    accent2: TENDENCY_COLORS[tendency2],   // 次倾向色叠加
  };
}
```

### 14.5 AI 生图 Prompt 模板

以下模板用于批量生成 30 种头像变体。每个 prompt 由**通用前缀 + 基底描述 + 倾向色叠加**组成。

#### 通用前缀（所有变体共用）

```
A professional digital avatar icon for a business AI personality assessment platform,
circular composition, 512x512px, dark theme with subtle gradient background,
minimalist geometric style, clean vector lines, high contrast,
suitable for profile display at 80x80px and 200x200px,
no text, no face, abstract symbolic representation,
```

#### 基底 Prompt 片段

**TE（技术好奇者）**：
```
central geometric node with radiating circuit-like lines,
cool steel blue (#3B82F6) and silver gray primary palette,
symmetrical composition suggesting precision and analytical thinking,
subtle data flow patterns in background, tech-forward aesthetic,
```

**EP（企业家实用派）**：
```
solid triangular composition with compass-rose motif at center,
warm amber (#F59E0B) and deep navy primary palette,
stable architectural structure suggesting strategy and groundedness,
subtle upward arrow elements in background, executive aesthetic,
```

**AP（应用实践者）**：
```
dynamic forward-leaning shape breaking through a boundary line,
electric purple (#8B5CF6) and vivid green primary palette,
asymmetric composition suggesting innovation and bold action,
subtle prism/spectrum light refraction in background, pioneer aesthetic,
```

#### 倾向色叠加 Prompt 片段

在每个基底 prompt 末尾追加倾向色描述：

| 倾向 | 追加 Prompt |
|------|------------|
| V左(深耕) | `emerald green (#059669) accent glow at the base, suggesting deep roots and grounded growth` |
| V右(拓土) | `warm orange (#F97316) accent glow at the edges, suggesting horizon expansion and vision` |
| D左(直觉) | `soft lavender (#A78BFA) accent aura, suggesting intuitive perception and gut-feel sensing` |
| D右(精算) | `steel cyan (#0EA5E9) accent lines, suggesting analytical precision and data-driven clarity` |
| E左(重构) | `deep red (#DC2626) accent structure lines, suggesting systematic reconstruction and bold overhaul` |
| E右(敏捷) | `teal cyan (#06B6D4) accent ripples, suggesting agile responsiveness and fluid adaptation` |
| A左(控本) | `warm brown (#92400E) accent texture, suggesting measured caution and resource consciousness` |
| A右(长投) | `emerald green (#10B981) accent growth rings, suggesting patient investment and organic scaling` |
| B左(防守) | `cool gray (#6B7280) accent shield pattern, suggesting defensive stability and risk awareness` |
| B右(创新) | `electric magenta (#C026D3) accent lightning, suggesting bold innovation and breakthrough energy` |

#### 完整示例

生成 `DP-EP`（深耕精算企业家）头像的完整 Prompt：

```
A professional digital avatar icon for a business AI personality assessment platform,
circular composition, 512x512px, dark theme with subtle gradient background,
minimalist geometric style, clean vector lines, high contrast,
suitable for profile display at 80x80px and 200x200px,
no text, no face, abstract symbolic representation,
solid triangular composition with compass-rose motif at center,
warm amber (#F59E0B) and deep navy primary palette,
stable architectural structure suggesting strategy and groundedness,
subtle upward arrow elements in background, executive aesthetic,
steel cyan (#0EA5E9) accent lines, suggesting analytical precision and data-driven clarity,
emerald green (#10B981) accent growth rings, suggesting patient investment and organic scaling
```

### 14.6 开发阶段占位方案

AI 生图上线前，用 CSS 渐变色块 + 人格代码文字作为占位：

```tsx
// 伪代码：占位头像组件
function PlaceholderAvatar({ personalityCode }: { personalityCode: string }) {
  const config = getAvatarConfig(personalityCode);
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold"
      style={{
        background: `linear-gradient(135deg, ${config.base.primary} 0%, ${config.accent1} 100%)`,
      }}
    >
      {personalityCode}
    </div>
  );
}
```

占位头像足以支撑开发和测试，AI 生图可在 Phase 2 打磨时批量替换。
