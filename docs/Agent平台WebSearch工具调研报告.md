# Agent 平台 Web Search 工具实现调研报告

> 调研目标：了解主流 Agent 平台（Hermes、Workbuddy、Tavily、智谱AI、Claude、MetaSearchMCP 等）的 Web Search 工具实现方式，包括搜索策略、多查询并发、网页内容提取、结果处理等，为 requirements-diagnosis Agent 的搜索能力设计提供参考。

---

## 一、各平台搜索工具实现概览

### 1.1 平台能力对比总表

| 平台 | 搜索工具名 | 底层搜索引擎 | 多查询并发 | 网页内容提取 | 结果去重/排序 | 搜索策略 |
|------|-----------|-------------|-----------|-------------|-------------|---------|
| **Hermes** | `web_search` / `web_extract` / `web_crawl` | 8 个后端可选（Tavily/Firecrawl/Exa/SearXNG/Brave/DDGS/Parallel/xAI） | 3 个子代理并行 | ✅ 分块处理（<5K原样 / 5K-500K摘要 / 500K-2M分块并行摘要 / >2M拒绝） | 依赖后端自身 | 后端可拆分到不同提供商 |
| **Workbuddy**（推断） | `web_search` / `web_fetch` | 未公开（可能内置搜索引擎或调用第三方） | ✅ 强（截图显示20次并行工具调用） | ✅ 抓取网页转 Markdown | 未知 | 按任务方向多维度并行搜索 |
| **Tavily** | `POST /search` | Tavily 自研搜索索引 | API 层面单次单查询 | ✅ `include_raw_content` / `include_answer` | Tavily 内部排序（score 字段） | 4 种搜索深度 + auto_parameters 自动配置 |
| **智谱AI Search Agent** | `msearch` / `mclick` | search_std / search_pro / search_pro_sogou / search_pro_quark | ✅ 单调用多查询（queries[]） | ✅ `mclick` 选择性深度阅读 | 未知 | 意图识别→查询拆解→并行检索→选择性阅读 |
| **MetaSearchMCP** | `search_web` / `search_google` 等 | 30+ 提供者（Google/Bing/DDG/Brave/百度/维基/GitHub/arxiv 等） | ✅ 并发多提供者聚合 | 部分提供者支持 | ✅ URL 归一化去重 | 语义标签选择 + Google 回退链 |
| **Claude API** | `web_search` / `web_fetch` | Anthropic 云端搜索 | 单调用内自主多次搜索（max_uses） | ✅ `web_fetch` 提取全文 | Anthropic 内部排序 | 动态过滤（20260209版）+ 引用溯源 |
| **Browser-use** | 浏览器自动化（非纯搜索API） | 真实浏览器渲染 | ✅ 云端并行 Sub-Agent | ✅ 完整页面渲染后提取 | 无 | 三种模式（chromium/real/remote） |

---

## 二、各平台详细实现

### 2.1 Hermes Agent

**搜索后端架构**：支持 8 个后端，按能力分为三类：

| 类型 | 后端 | 搜索 | 提取 | 爬取 |
|------|------|:----:|:----:|:----:|
| 全能型 | Firecrawl（默认） | ✅ | ✅ | ✅ |
| 全能型 | Tavily | ✅ | ✅ | ✅ |
| 全能型 | Exa | ✅ | ✅ | ❌ |
| 全能型 | Parallel | ✅ | ✅ | ❌ |
| 纯搜索 | SearXNG | ✅ | ❌ | ❌ |
| 纯搜索 | Brave Search | ✅ | ❌ | ❌ |
| 纯搜索 | DDGS (DuckDuckGo) | ✅ | ❌ | ❌ |
| 纯搜索 | xAI (Grok) | ✅ | ❌ | ❌ |

**关键设计**：
- **搜索和提取可拆分到不同后端**：例如搜索用免费的 SearXNG，提取用 Firecrawl
- **自动检测优先级**：`FIRECRAWL_API_KEY` → `PARALLEL_API_KEY` → `TAVILY_API_KEY` → `EXA_API_KEY` → `SEARXNG_URL`
- **3 个子代理并行**：最多同时扇出 3 个子代理并行工作

**网页提取分块策略**（`web_extract`）：

| 页面大小 | 处理方式 |
|---------|---------|
| < 5,000 字符 | 原样返回，不调用 LLM |
| 5,000 – 500,000 字符 | 辅助模型单次摘要，输出约 5,000 字符 |
| 500,000 – 2,000,000 字符 | 100K 字符分块 → **并行摘要** → 合成最终摘要 |
| > 2,000,000 字符 | 拒绝处理，提示用 `web_crawl` |

**Tavily 额外端点**（原生 web 工具集不包含）：
- `/research`：一次调用多源综合研究，保留每个声明的行内引用
- `/map`：URL 图审计，返回域名链接图，避免为不需要的页面支付提取成本

**数据持久化路径**（自改进循环）：
- 工具结果 → `MEMORY.md` / `USER.md`（Markdown 文件，注入 system prompt）
- 工具结果 → FTS5 全文索引（SQLite 历史对话搜索）
- ≥5 次工具调用 → 反思阶段 → 提取可复用模式写入 `SKILL.md`

---

### 2.2 Workbuddy（从截图和文档推断）

**从用户提供的截图分析**：

在一次茶饮行业 AI 转型调研任务中，Workbuddy 执行了 **20 次工具调用**（10 次网页搜索 + 10 次网页获取），展现了极强的并行搜索能力。

**搜索关键词覆盖维度**：

| 维度 | 搜索关键词示例 |
|------|--------------|
| 竞品调研 | "星巴克 AI 人工智能转型 2024 2025 具体应用场景 数字化" |
| 行业对标 | "霸王茶姬 AI 数字化 运营系统 供应链 2024 2025" |
| 工具方案 | "餐饮连锁 AI 智能体 飞书 内部部署 Hermes 企业运营" |
| 业务场景 | "茶饮连锁 AI 转型 运营体系 点单系统 库存管理 供应链 人员排班 营销" |
| 报价参考 | "AI 数字化转型咨询服务 报价 餐饮零售 中小企业 收费标准" |
| 技术深度 | "星巴克 SITC Deep Brew AI 排班 库存预测 门店运营" |
| 成本分析 | "Hermes Agent 智能体 部署成本 服务器配置 飞书集成" |

**网页获取目标**：
- `www.starbucks.com.cn`（星巴克中国官网）
- `www.cfsn.cn`（中国食品网）
- `m.36kr.com` / `36kr.com`（36氪）
- `www.feishu.cn`（飞书）
- `zhuanlan.zhihu.com`（知乎专栏）
- `cloud.tencent.com`（腾讯云）
- `ai-bot.cn`

**推断的搜索策略**：
1. **任务方向拆解**：将用户的一个大任务拆成多个研究方向（竞品、行业、工具、业务、报价、技术）
2. **多维度关键词并行搜索**：每个方向用 1-2 组不同关键词搜索，增加覆盖度
3. **权威来源优先抓取**：对 36kr、知乎专栏、腾讯云等行业权威来源进行网页内容提取
4. **先并行调研，再汇总报告**

---

### 2.3 Tavily Search API

**请求端点**：`POST https://api.tavily.com/search`

**完整参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | string | 必填 | 搜索查询 |
| `search_depth` | string | `basic` | `ultra-fast`/`fast`/`basic`/`advanced` |
| `max_results` | integer | 5 | 0-20 |
| `topic` | string | `general` | `general`/`news`/`finance` |
| `time_range` | string | null | `day`/`week`/`month`/`year` |
| `include_answer` | boolean/string | false | `true`/`basic`/`advanced` |
| `include_raw_content` | boolean/string | false | `true`/`markdown`/`text` |
| `include_images` | boolean | false | 是否包含图片 |
| `include_domains` | string[] | [] | 白名单（最多300个） |
| `exclude_domains` | string[] | [] | 黑名单（最多150个） |
| `country` | string | null | 130+ 国家支持 |
| `auto_parameters` | boolean | false | 自动配置搜索参数 |
| `exact_match` | boolean | false | 精确匹配模式 |

**搜索深度对比**：

| 深度 | 延迟 | 内容生成 | Credits |
|------|------|---------|---------|
| `ultra-fast` | 最低 | 每个 URL 1 个 NLP 摘要 | 1 |
| `fast` | 较低 | 多个语义相关片段 | 1 |
| `basic` | 均衡 | 每个 URL 1 个 NLP 摘要 | 1 |
| `advanced` | 最高 | 多个语义相关片段（chunks_per_source 1-3，每 chunk 500字符） | 2 |

**响应结构**：

```json
{
  "query": "...",
  "answer": "LLM 生成的答案",
  "results": [
    {
      "title": "...",
      "url": "...",
      "content": "短描述",
      "score": 0.81,
      "raw_content": "原始内容",
      "favicon": "..."
    }
  ],
  "response_time": 1.67,
  "usage": { "credits": 1 }
}
```

**额外端点**（Agent 场景特别有用）：
- **`/research`**：一次调用多源综合研究，保留每个声明的行内引用 → 生成带引用的简报
- **`/map`**：URL 图审计，返回域名链接图 → 选择性摄取：先 map → 过滤 → 再 extract

---

### 2.4 智谱AI Search Agent

**三层架构**：

```
用户查询
    │
    ├── [Web Search API] → 单次结构化检索 → 返回搜索结果列表
    │
    ├── [Web Search in Chat] → 搜索 + LLM 融合 → 带引用标注的回答
    │                              │
    │                              └─ search_prompt 中 {search_result} 占位符
    │
    └── [Search Agent] → 意图识别 → 查询拆解(msearch) → 并行检索
                              │
                              └─ 选择性深度阅读(mclick) → 多源综合生成
```

**核心工具调用（两阶段检索）**：

**阶段 1 — `msearch`（多查询并行搜索）**：

```
WebBrowser(input='msearch(
    description="Search for the impact of Q1 2025 Middle East conflicts on energy market",
    queries=[
        "Impact of Q1 2025 Middle East geopolitical conflicts",
        "Q1 2025 global energy market crude oil price fluctuations",
        "Q1 2025 major oil-producing countries' policy adjustments",
        "Q1 2025 European energy alternatives"
    ],
    recency_days=0
)')
```

- 一个复杂问题自动拆解为 **4 个并行子查询**
- `description` 描述整体意图，`queries` 列出分解后的具体搜索词

**阶段 2 — `mclick`（选择性深度阅读）**：

```
WebBrowser(input='mclick([3, 5, 6, 7, 8, 9, 10, 11, 13])')
```

- 根据第一轮结果，通过索引号选择特定搜索结果进行全文抓取
- 过滤不相关结果，只深入阅读有价值的页面

**搜索引擎选择**：

| 引擎 | 特性 | 单价 |
|------|------|------|
| `search_std` | 基础版（智谱自研），性价比高 | 0.01元/次 |
| `search_pro` | 高级版，多引擎协作，低空结果率 | 0.03元/次 |
| `search_pro_sogou` | 搜狗，覆盖腾讯生态、知乎 | 0.05元/次 |
| `search_pro_quark` | 夸克，精准触达垂直内容 | 0.05元/次 |

---

### 2.5 MetaSearchMCP

**支持的搜索提供者（30+）**：

| 类别 | 提供者 |
|------|--------|
| Google | google, google_serpbase, google_serper |
| 通用网页 | duckduckgo, bing, yahoo, brave, mwmbl, ecosia, mojeek, startpage, qwant, yandex, baidu |
| 知识 | wikipedia, wikidata, internet_archive, openlibrary |
| 开发者 | github, gitlab, stackoverflow, hackernews, reddit, npm, pypi, rubygems, crates, lib_rs, dockerhub, pkg_go_dev, metacpan |
| 学术 | arxiv, pubmed, semanticscholar, crossref |
| 金融 | yahoo_finance, alpha_vantage, finnhub |

**核心架构**：

```
orchestrator.py      → 并发搜索执行与响应组装
merge.py             → URL 归一化与去重
catalog.py           → 提供者发现与选择
contracts.py         → 请求与响应模型
```

**并行执行策略**：
1. **并发多提供者聚合**：同时向多个搜索引擎发起请求
2. **提供者级超时隔离**：每个提供者独立超时（`DEFAULT_TIMEOUT=10s`），单提供者超时不阻塞其他
3. **部分失败容忍**：错误记录在响应 `errors` 字段，其他结果正常返回
4. **全局聚合超时**：`AGGREGATOR_TIMEOUT=15s`

**结果处理**：
- **归一化**：所有结果统一映射到 `{title, url, snippet, source, rank, provider, published_date, extra}`
- **去重**：`merge.py` 对多个引擎返回的相同 URL 去重
- **数量控制**：`num_results`（每提供者上限，默认10）+ `max_total_results`（去重后最终上限）

**Google 回退链**：`google` → `google_serpbase` → `google_serper`

---

### 2.6 Claude API

**两个互补工具**：

| 工具 | 用途 | 计费 |
|------|------|------|
| `web_search` | 发现新内容 | **$10 / 1000 次** |
| `web_fetch` | 从已知 URL 提取全文 | 免费（仅消耗 token） |

**`web_search` 参数**：

| 参数 | 说明 |
|------|------|
| `type` | `web_search_20250305` 或 `web_search_20260209` |
| `max_uses` | 单次请求允许的最大搜索次数 |
| `allowed_domains` / `blocked_domains` | 域名白名单/黑名单 |
| `user_location` | 用户地理位置（本地化搜索） |

**动态过滤（20260209 版）**：
- 搜索前用代码执行工具过滤无关片段
- 显著减少长文档检索的 token 消耗

**多轮上下文保持**：
- 每条结果包含 `encrypted_content` 字段
- 多轮对话中**必须原样回传**，否则引用上下文丢失

**典型工作流**：先 `web_search` 找候选页面 → 再用 `web_fetch` 拉取最相关页面全文

---

### 2.7 浏览器自动化方案（Browser-use / Agent Browser / Playwright）

| 方案 | 并发能力 | Token 消耗 | 内容提取策略 | 搜索场景 |
|------|---------|-----------|-------------|---------|
| **Browser-use** | ✅ 云端并行 Sub-Agent | 极低 | State + Index（精简元素列表+数字索引） | 多站点并行采集、反爬、登录态搜索 |
| **Agent Browser** | ❌ 串行 | 极低（减少93%） | Snapshot + Refs（精简快照+引用ID） | 快速搜索浏览 |
| **Playwright CLI** | ⚠️ 有限（命名Session多实例） | 极低（减少75-99%） | 数据存磁盘（YAML/PNG），按需读取 | 长时间批量搜索（50+页面） |
| **Playwright MCP** | ❌ 串行 | 较高 | 完整 Accessibility Tree | 单次搜索 |
| **DevTools MCP** | ❌ 串行 | 中等 | CDP 全量数据（含 Network 请求/响应） | 搜索结果调试 |

**Browser-use 并行搜索示例**：

```bash
# 同时启动多个搜索任务（异步执行）
browser-use -b remote run "检查竞品 A 的定价" --session task-a
browser-use -b remote run "检查竞品 B 的定价" --session task-b
browser-use -b remote run "检查竞品 C 的定价" --session task-c

# 查看所有任务状态
browser-use task list
```

---

## 三、深度搜索 Agent 架构模式

### 3.1 搜索策略演进

```
基础迭代（ReAct）
    │ 缺陷：单线程效率低
    ▼
并行工作流
    │ 缺陷：子查询数量写死
    ▼
Planner-Only（动态拆分）
    │ 根据问题复杂度动态决定子任务数量
    ▼
+ 评估器（Evaluator）
    │ 每轮判断答案充分性，指导下一轮搜索方向
    ▼
+ 检查清单评分（Checklist）
    │ 长文档输出按预设规范逐项评估
    ▼
递归式（ROMA）
    │ 子问题之间有依赖关系，按依赖图执行
```

### 3.2 子查询数量参考

| 问题复杂度 | 子任务数量 | 每个子任务工具调用次数 |
|-----------|-----------|----------------------|
| 简单事实查找 | 1 个 | 3-10 次 |
| 直接对比查询 | 2-5 个 | 每个约 10-15 次 |
| 复杂研究 | 超过 10 个 | 职责明确划分 |

### 3.3 评估器输出格式

```json
{
  "is_sufficient": true/false,
  "reasoning": "推理过程",
  "knowledge_gap": "知识缺口，指导下一轮搜索方向"
}
```

---

## 四、关键设计模式总结

### 4.1 多查询并发模式

| 模式 | 代表平台 | 实现方式 |
|------|---------|---------|
| **单调用多查询** | 智谱AI Search Agent | `msearch(queries=[...])` 一次调用传多个查询 |
| **多提供者并发** | MetaSearchMCP | 同时向 Google/Bing/DDG 等多个引擎发请求 |
| **子代理并行** | Hermes / Browser-use | 启动多个子代理/Session 各执行不同搜索 |
| **LLM 自主多次搜索** | Claude API | `max_uses` 控制上限，LLM 自主决定何时搜、搜什么 |
| **应用层并行调用** | Workbuddy（推断） | 应用层同时发起多个独立搜索工具调用 |

### 4.2 网页内容提取策略

| 策略 | 代表 | 适用场景 |
|------|------|---------|
| **API 直接返回内容片段** | Tavily `include_raw_content` | 快速获取结构化摘要 |
| **分块处理 + 并行摘要** | Hermes `web_extract` | 长页面（500K-2M字符） |
| **选择性深度阅读** | 智谱AI `mclick` | 先广度搜索再精选阅读 |
| **浏览器渲染后提取** | Browser-use / Playwright | 需要 JavaScript 渲染的动态页面 |
| **磁盘存储 + 按需读取** | Playwright CLI | 长时间批量处理，避免上下文溢出 |

### 4.3 搜索结果处理流程

```
搜索查询
    │
    ├─→ [可选] 查询拆解（1→N 个子查询）
    │
    ├─→ 并行搜索（多引擎 / 多查询 / 多代理）
    │
    ├─→ 结果归一化（统一 Schema）
    │
    ├─→ 去重（URL 归一化）
    │
    ├─→ 排序（相关性评分 / 原生排名 / 混合）
    │
    ├─→ [可选] 选择性深度提取（mclick / web_fetch）
    │
    ├─→ [可选] 评估器判断充分性
    │       │
    │       └─ 不充分 → 生成 knowledge_gap → 下一轮搜索
    │
    └─→ LLM 综合生成最终回答（带引用标注）
```

---

## 五、对 requirements-diagnosis Agent 的启示

### 5.1 推荐实现方案

基于以上调研，结合项目现状（Next.js + Vercel AI SDK + DeepSeek），推荐以下搜索能力设计：

#### 方案 A：Tavily 单后端（推荐，MVP 阶段）

```
Chat API
    │
    ├─→ 用户提问触发 webSearch 工具
    │
    ├─→ LLM 自主决定搜索查询词
    │
    ├─→ 单次调用 Tavily /search
    │       ├── search_depth: "advanced"（高质量结果）
    │       ├── max_results: 5-10
    │       ├── include_answer: true（LLM 生成的摘要）
    │       └── include_raw_content: "markdown"（原始内容）
    │
    ├─→ 结果返回给 LLM
    │
    └─→ LLM 综合回答（可结合 AGUI 组件展示）
```

**优点**：
- 实现简单，一次 API 调用
- Tavily 专为 AI Agent 设计，结果质量高
- 支持中文搜索
- 免费层 1000 credits/月，足够测试

**缺点**：
- 单次单查询，无法像 Workbuddy 那样一次并行搜 10 个方向
- 复杂调研可能需要多轮工具调用（当前已限制最多 4 轮）

#### 方案 B：Tavily + 应用层并行（进阶）

```
Chat API
    │
    ├─→ 用户提问触发 webSearch 工具
    │
    ├─→ LLM 生成多个搜索查询词（如 3-5 个方向）
    │
    ├─→ 应用层并行调用 Tavily /search × N 次
    │       ├── Promise.allSettled() 并发执行
    │       ├── 每个查询独立 timeout
    │       └── 部分失败容忍
    │
    ├─→ 结果合并、去重、排序
    │
    ├─→ 对高价值结果进行 web_fetch（网页内容提取）
    │
    └─→ LLM 综合回答
```

**优点**：
- 接近 Workbuddy 的并行搜索效果
- 一次用户提问可覆盖多个研究方向
- 结果更全面

**缺点**：
- 实现复杂度更高
- Tavily credits 消耗增加（每次搜索 1-2 credits）
- 需要结果合并和去重逻辑

### 5.2 工具参数设计建议

```typescript
// lib/agent-team/external-tools/web-search.ts
const webSearchTool = tool({
  description: `搜索互联网获取行业动态、竞品信息、技术趋势、企业案例等。
    当需要引用外部数据、行业报告、竞争对手信息时调用。
    支持自动生成多个搜索查询以覆盖不同维度。`,
  parameters: jsonSchema({
    type: "object",
    properties: {
      queries: {
        type: "array",
        items: { type: "string" },
        description: "搜索查询词列表，建议 1-5 个，覆盖不同维度",
      },
      maxResults: {
        type: "number",
        description: "每个查询返回的最大结果数（1-20，默认5）",
        default: 5,
      },
      searchDepth: {
        type: "string",
        enum: ["basic", "advanced"],
        description: "搜索深度，advanced 质量更高但消耗 2 credits",
        default: "advanced",
      },
      timeRange: {
        type: "string",
        enum: ["day", "week", "month", "year"],
        description: "时间范围过滤",
      },
      includeAnswer: {
        type: "boolean",
        description: "是否包含 Tavily 生成的答案摘要",
        default: true,
      },
    },
    required: ["queries"],
  }),
  execute: async ({ queries, maxResults, searchDepth, timeRange, includeAnswer }) => {
    // 并行调用 Tavily API
    const results = await Promise.allSettled(
      queries.map(q =>
        fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.TAVILY_API_KEY}` },
          body: JSON.stringify({
            query: q,
            max_results: maxResults,
            search_depth: searchDepth,
            time_range: timeRange,
            include_answer: includeAnswer,
            include_raw_content: "markdown",
          }),
        }).then(r => r.json())
      )
    );

    // 合并结果、去重、返回
    // ...
  },
});
```

### 5.3 是否需要网页内容提取（web_fetch）？

| 场景 | 是否需要 web_fetch |
|------|------------------|
| 简单问答（如"星巴克AI转型用了哪些技术"） | ❌ Tavily 的 `include_answer` + `content` 已足够 |
| 深度调研（如"帮我分析星巴克AI转型的完整路线"） | ✅ 需要抓取关键页面全文 |
| 数据提取（如"星巴克2024年财报中AI相关投入是多少"） | ✅ 必须抓取原文 |

**建议**：MVP 阶段先用 Tavily 的 `include_raw_content`（直接在搜索结果中返回页面内容），暂时不单独实现 `web_fetch`。如果后续有深度页面提取需求，再引入 Firecrawl 或 Playwright。

### 5.4 搜索查询生成策略

参考 Workbuddy 和智谱AI Search Agent 的做法，让 LLM 在调用搜索工具时**自主生成多个查询词**，覆盖不同维度：

```
用户提问："帮我调研茶饮行业AI转型"
    │
    ▼
LLM 生成搜索查询：
    ├── "茶饮行业 AI 转型 2025 2026 案例分析"
    ├── "霸王茶姬 奈雪的茶 AI 数字化 运营"
    ├── "餐饮连锁 AI 智能体 飞书 部署"
    ├── "茶饮品牌 单店模型 AI 自动化 成本效率"
    └── "AI 数字化转型咨询 报价 餐饮 收费标准"
```

这样即使单次 Tavily 调用只搜一个查询，通过让 LLM 生成多个查询词，也能达到多维度覆盖的效果。

---

## 六、调研局限性说明

| 平台 | 局限性 |
|------|--------|
| Workbuddy | 未找到公开的 API/工具定义文档，搜索实现细节基于截图推断 |
| QoderWork | 未找到 web search 的底层实现文档，仅确认支持联网搜索和 MCP |
| OpenHanako | 概览页面未展示 Tools & Execution 章节，搜索细节未获取 |
| Hanako | 可能指其他平台，搜索结果主要匹配到 OpenHanako |

---

## 七、参考链接

1. Hermes Agent Web Search 文档：https://hermes-doc.aigc.green/user-guide/features/web-search
2. Tavily Search API 文档：https://docs.tavily.com/documentation/api-reference/endpoint/search
3. Tavily 接入指南：https://lixx.cn/posts/tech/tavily-integration-guide/
4. 智谱AI 联网搜索文档：https://docs.bigmodel.cn/cn/guide/tools/web-search
5. MetaSearchMCP GitHub：https://github.com/gefsikatsinelou/MetaSearchMCP
6. Claude API Web Search 指南：https://help.apiyi.com/en/claude-api-web-search-guide-en.html
7. Claude Code 浏览器自动化对比：https://www.heyuan110.com/zh/posts/ai/2026-01-28-claude-code-browser-automation/
8. Workbuddy 系统架构：https://blog.csdn.net/Openclaw2026/article/details/159278055
9. 深度搜索 Agent 架构解析：https://developer.cloud.tencent.com/article/2615247
