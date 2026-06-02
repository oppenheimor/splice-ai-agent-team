---
name: "Splice Agent Team"
description: "一个可扩展的多 Agent 产品工作台，让统一底座承载差异化 Agent 体验。"
colors:
  platform-background: "oklch(0.985 0.004 75)"
  platform-foreground: "oklch(0.18 0.02 260)"
  platform-card: "oklch(1 0 0)"
  deep-work-teal: "oklch(0.32 0.05 198)"
  platform-muted: "oklch(0.95 0.005 260)"
  platform-border: "oklch(0.88 0.01 255)"
  platform-accent-wash: "oklch(0.92 0.03 160)"
  consultant-paper: "#fffffc"
  consultant-panel: "#f7f7f3"
  consultant-control: "#f0f0ed"
  consultant-ink: "#2e2f2d"
  consultant-text: "#222322"
  consultant-muted: "#8a8a86"
  consultant-signal: "#277652"
  treasure-sky: "#9fe3d5"
  treasure-cream: "#fff8df"
  treasure-paper: "#fffdf2"
  treasure-ink: "#725d42"
  treasure-tide: "#19c8b9"
  treasure-gold: "#f7cd67"
  treasure-rose: "#f8a6b2"
typography:
  display:
    fontFamily: "Avenir Next, Optima, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Avenir Next, Optima, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "normal"
  title:
    fontFamily: "Avenir Next, Optima, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Avenir Next, Optima, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Avenir Next, Optima, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "normal"
  mono:
    fontFamily: "IBM Plex Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
  diagnosis-panel: "28px"
  treasure-panel: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.deep-work-teal}"
    textColor: "{colors.platform-background}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.platform-muted}"
    textColor: "{colors.platform-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  card-standard:
    backgroundColor: "{colors.platform-card}"
    textColor: "{colors.platform-foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input-standard:
    backgroundColor: "{colors.platform-background}"
    textColor: "{colors.platform-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  diagnosis-primary-button:
    backgroundColor: "{colors.consultant-ink}"
    textColor: "{colors.consultant-paper}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    height: "56px"
  treasure-action-button:
    backgroundColor: "{colors.treasure-cream}"
    textColor: "{colors.treasure-ink}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
    height: "44px"
---

# Design System: Splice Agent Team

## 1. Overview

**Creative North Star: "分形工作台"**

Splice Agent Team 是一个产品型多 Agent 工作台：平台层保持安静、可靠、可扩展，每个 Agent 像分形一样从同一套底座长出自己的界面节奏、语气和结果呈现。统一性来自聊天底座、工具渲染、组件状态和可访问性；差异化来自 Agent 的任务场景、空状态、结构化输出和局部色彩策略。

平台层的默认场景是白天工作环境中的任务操作：用户进入页面是为了登录、选择 Agent、继续会话、输入目标、查看结果。默认主题因此偏浅色、低对比噪音、轻层次。需求诊断场景像一张克制的顾问工作纸，重点是清醒、可信、能让老板看懂行动路径。寻宝游戏场景像一套可触摸的礼物策划道具，允许温暖、轻松和仪式感，但禁止低龄玩具化。

这个系统明确拒绝传统企业后台感、泛化 SaaS landing 模板、儿童化、赛博霓虹或 AI 炫技、Apple 风极简模板。视觉差异必须服务任务，不能靠复杂配色或装饰性动效硬撑。

**Key Characteristics:**

- 平台层 restrained：浅暖背景、深青主动作、轻边框、稳定控件。
- Agent 层 contextual：需求诊断用墨黑和纸面层次，寻宝游戏用潮青、奶油纸和 3D 压层阴影。
- 色彩复杂度受控：每个主要界面核心色调不超过 3 种，标签、状态色、图表辅助色除外。
- 组件一致但允许换肤：按钮、输入、卡片和消息壳保持交互语法一致，Agent 可以覆盖形状、阴影和语气。

## 2. Colors

调色板采用平台基础色加 Agent 局部色的双层结构：平台只提供安静工作底色，具体 Agent 再引入自己的领域色。

### Primary

- **Deep Work Teal / 沉静工作青**：平台主动作色，来自 `oklch(0.32 0.05 198)`。用于主按钮、当前选择、焦点环和平台级状态指示，不用于大面积装饰。
- **Consultant Ink / 顾问墨黑**：需求诊断主色，来自 `#2e2f2d`。用于诊断主按钮、用户气泡、结果强调和进度表达，传达笃定和顾问感。
- **Treasure Tide / 寻宝潮青**：寻宝主色，来自 `#19c8b9`。用于行动按钮、时间线节点、图表主线和可选项选中态，传达轻快但不过度刺激的游戏感。

### Secondary

- **Treasure Gold / 礼物金**：寻宝辅助色，来自 `#f7cd67`。用于奖励、阶段结果、时间线过渡和庆祝性提示。
- **Consultant Signal / 诊断信号绿**：需求诊断辅助色，来自 `#277652`。用于“AI 需求诊断”等轻量标签，提醒用户进入诊断语境。

### Tertiary

- **Treasure Rose / 礼物玫瑰**：寻宝点缀色，来自 `#f8a6b2`。只用于愿望卡、结果分类或小范围注意力提示。

### Neutral

- **Platform Warm Canvas**：平台背景，来自 `oklch(0.985 0.004 75)`。承载首页、通用聊天壳和后台页面。
- **Platform Ink**：平台正文，来自 `oklch(0.18 0.02 260)`。用于默认正文、标题和图标。
- **Platform Mist Border**：平台边框，来自 `oklch(0.88 0.01 255)`。用于标准卡片、输入框、分隔线。
- **Consultant Paper**：诊断纸面，来自 `#fffffc`。用于需求诊断主背景。
- **Consultant Panel**：诊断面板，来自 `#f7f7f3`。用于顾问式卡片和消息面板。
- **Treasure Cream**：寻宝奶油纸，来自 `#fff8df`。用于按钮、输入和大量承载容器。
- **Treasure Ink**：寻宝正文，来自 `#725d42`。用于文本、边框和图标，使游戏感保持温暖而可读。

### Named Rules

**The Three-Tone Rule.** 单个主要界面的核心色调最多 3 种。状态色、标签色和图表辅助色可以存在，但不能成为视觉主角。

**The Agent Earns Color Rule.** 平台层不抢色。只有当 Agent 的任务语境需要时，才引入领域色和更强的形状语言。

## 3. Typography

**Display Font:** Avenir Next, Optima, ui-sans-serif, system-ui, sans-serif
**Body Font:** Avenir Next, Optima, ui-sans-serif, system-ui, sans-serif
**Label/Mono Font:** IBM Plex Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace

**Character:** 单一 humanist sans 承担主要界面文字，保持产品工具的清晰和温度。需求诊断可以使用更重的字重与斜体标题制造顾问式强调，寻宝游戏通过 `font-black`、圆角和压层阴影表达触感，而不是换成低龄字体。

### Hierarchy

- **Display** (900, 40px to 54px, 1.2)：用于 Agent 首屏大标题、诊断入口标题和强品牌信号。仅用于真正的入口场景。
- **Headline** (700, 24px, 1.15)：用于页面标题、结果报告标题和主要分组标题。
- **Title** (600, 20px, 1.25)：用于卡片标题、消息头和设置面板标题。
- **Body** (400 to 500, 16px, 1.7)：用于说明文本、Agent 输出和表单说明。长文本控制在 65 到 75ch。
- **Label** (600 to 900, 11px to 14px, normal to 0.04em)：用于徽章、按钮、表头和短状态。只在诊断标签里允许轻微字距。
- **Mono** (500, 13px, 1.5)：用于代码、原始工具输出和技术性辅助信息，不用于普通按钮或导航。

### Named Rules

**The Product Voice Rule.** 平台控件不使用 display 字体效果。标签、按钮、输入和表格文字必须先可读，再谈风格。

**The Agent Accent Rule.** Agent 可以调整字重、斜体和标题节奏，但不能让字体变化成为主要差异化手段。

## 4. Elevation

这个系统是 hybrid elevation。平台层使用轻阴影和边框表达层次；需求诊断使用纸面压印、内高光和柔和投影表达顾问工作纸；寻宝游戏使用 tactile 的 3D 压层阴影，让按钮和卡片像可按压的道具。

### Shadow Vocabulary

- **Platform Soft** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)`): 标准 shadcn 卡片、按钮和输入的默认层次。
- **Consultant Lift** (`box-shadow: 0 18px 50px rgba(0,0,0,0.08)`): 需求诊断面板，用于低噪音的纸面浮起。
- **Consultant Ink Press** (`box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), 0 12px 30px rgba(0,0,0,0.2)`): 诊断主按钮和用户气泡，用于坚定、沉着的行动感。
- **Treasure Press** (`box-shadow: 0 4px 0 #d8c8a2`): 寻宝按钮和历史项，用于可按压的道具感。
- **Treasure Card Lift** (`box-shadow: 0 8px 0 rgba(114,93,66,0.16), 0 18px 36px rgba(93,75,45,0.12)`): 寻宝 Hero 和消息卡，用于游戏场景中的重点容器。

### Named Rules

**The State Makes Depth Rule.** 平台默认静止，不用夸张阴影。只有 hover、active、focus 或 Agent 语境需要时，才增加明显层次。

**The Tactile Only In Treasure Rule.** 3D 压层阴影属于寻宝 Agent，不迁移到需求诊断或后台页面。

## 5. Components

### Buttons

- **Shape:** 平台按钮使用轻圆角矩形 (8px)，诊断主按钮和寻宝动作按钮使用胶囊形 (9999px)。
- **Primary:** 平台主按钮使用 Deep Work Teal 背景和浅色文字，默认高度 40px，水平内边距 16px。
- **Hover / Focus:** hover 只做颜色轻微变化；focus 必须保留 2px ring；disabled 使用 opacity 降低并禁止交互。
- **Diagnosis:** 需求诊断主按钮使用 Consultant Ink，56px 高度，强字重和柔和阴影，表达明确行动。
- **Treasure:** 寻宝按钮使用 Treasure Cream、2px 边框和 3D 压层，active 状态向下移动 2px 并减少阴影。

### Chips

- **Style:** 平台徽章使用圆形 pill、12px 左右内边距和轻背景。需求诊断标签使用 Consultant Control 背景和高字重。寻宝标签使用 Treasure Cream 或浅潮青背景。
- **State:** 选中态必须同时改变背景、边框或图标，不能只靠颜色变化。

### Cards / Containers

- **Corner Style:** 平台标准卡片为 12px；诊断面板为 24px 到 30px；寻宝卡片为 22px 到 28px。
- **Background:** 平台用 Platform Card；诊断用 Consultant Paper / Consultant Panel；寻宝用 Treasure Cream / Treasure Paper。
- **Shadow Strategy:** 平台轻阴影，诊断纸面浮起，寻宝压层。不要跨 Agent 混用。
- **Border:** 平台使用 1px Mist Border；诊断可以用无边框加压印；寻宝常用 2px 低对比暖边框。
- **Internal Padding:** 平台常用 16px 到 24px；诊断主卡常用 16px；寻宝内容卡常用 16px 到 20px，移动端可降至 14px。

### Inputs / Fields

- **Style:** 平台输入使用 40px 高度、8px 圆角、1px 边框、背景同页面。需求诊断输入可以取消边框，使用 Consultant Control 背景。寻宝 composer 使用 pill 容器和透明输入。
- **Focus:** 平台和诊断使用 2px ring；寻宝 composer 使用压层阴影加轻微外圈。
- **Error / Disabled:** 错误必须有文本说明；disabled 使用 opacity 和 cursor 状态，不能只改变颜色。

### Navigation

- **Platform:** 侧栏和顶部栏使用浅背景、边框和当前项背景。导航文字保持 14px 到 16px，图标 16px 到 20px。
- **Diagnosis:** 导航更少，优先让用户沿测评流程前进，历史入口作为次要动作。
- **Treasure:** 会话历史可以抽屉化，移动端用浮动历史按钮，桌面端可显示左侧历史栏。

### Signature Component: Agent Message Surface

Agent 消息面板是系统的核心复用组件。平台默认消息卡使用 8px 圆角和标准边框；需求诊断用户消息切换为 Consultant Ink；寻宝消息卡切换为无边框压层卡片。工具输出必须作为消息的一部分出现，使用领域化 renderer，而不是把工具结果塞进普通 Markdown。

## 6. Do's and Don'ts

### Do:

- **Do** 让平台层保持克制：浅背景、深青主动作、轻边框、标准控件。
- **Do** 让每个 Agent 的差异来自任务结构、空状态、工具 renderer 和结果呈现。
- **Do** 在单个主要界面内控制核心色调不超过 3 种，标签、状态色和图表辅助色除外。
- **Do** 为按钮、输入、选项和消息提供 hover、focus、active、disabled 或 loading 状态。
- **Do** 在需求诊断里使用纸面层次、顾问墨黑、明确步骤和可解释结果。
- **Do** 在寻宝游戏里使用奶油纸、潮青、礼物金和可按压阴影，但保持文本清楚可读。
- **Do** 保持 WCAG AA 目标：颜色不作为唯一信息载体，焦点状态可见，错误提示有文本。

### Don't:

- **Don't** 做成传统企业后台感：冷硬、拥挤、只有表单和表格。
- **Don't** 套用泛化 SaaS landing 模板：大标题、指标卡、渐变装饰和重复卡片网格。
- **Don't** 儿童化。寻宝游戏 Agent 要有礼物策划和仪式设计的精致感，不要低龄玩具感。
- **Don't** 使用过度赛博、霓虹或 AI 炫技。智能应体现在追问质量、结构化输出和行动建议里。
- **Don't** 做成 Apple 风极简模板。简洁不能牺牲任务密度、领域信息和决策线索。
- **Don't** 使用 `border-left` 或 `border-right` 大于 1px 的侧边彩条作为卡片、列表或提示的装饰。
- **Don't** 使用渐变文字、默认玻璃拟态、装饰性页面加载动效或无意义弹窗。
