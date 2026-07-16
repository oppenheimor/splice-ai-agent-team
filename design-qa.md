# 许愿池设计 QA

## 对比目标

- 视觉基线：
  - `docs/meetings/2026-07-16/assets/wish-creator-hero-confirmed.png`
  - `docs/meetings/2026-07-16/assets/wish-creator-session-confirmed.png`
- 浏览器实现截图：
  - `artifacts/wish-creator/hero-implementation.png`
  - `artifacts/wish-creator/session-implementation.png`
  - `artifacts/wish-creator/hero-mobile.png`
  - `artifacts/wish-creator/session-mobile.png`
  - `artifacts/wish-creator/preview-mobile.png`
- 视口：桌面端 `1487 × 1058`；移动端 `390 × 844`
- 主题：深色模式
- 状态：Hero 已登录态；Session 已生成 HTML、可交互预览、发布等待人工确认态
- 浏览器：Codex 内置浏览器

## 对比证据

### 全屏并排对比

- Hero：`artifacts/wish-creator/hero-comparison.png`
- Session：`artifacts/wish-creator/session-comparison.png`
- 上述图片均为左侧确认稿、右侧浏览器实现，使用同一 `1487 × 1058` 视口。

### 聚焦区域对比

- Hero 主标题、插画、输入框和快捷入口：`artifacts/wish-creator/hero-focus-comparison.png`
- Session 顶栏、Agent 工具卡和预览区：`artifacts/wish-creator/session-focus-comparison.png`

聚焦对比用于检查小字号、控件密度、边框、图标和分区比例；没有用不同缩放或不同状态替代并排判断。

## Findings

- 未发现仍需处理的 P0、P1 或 P2 问题。
- [P3] Session 确认稿使用粉色“今日吃什么”样例，实现截图使用端到端测试实际生成的深色“许愿成功”页面。
  - 位置：Session 右侧预览区。
  - 证据：两者的工具栏、预览画布、分栏关系一致，动态生成内容的主题不同。
  - 影响：不影响产品结构和视觉系统验收；这是动态内容差异，不是样式缺失。
  - 处理：保留真实生成结果，避免用静态假页面冒充运行态。
- [P3] Session 确认稿展示“最近发布”状态，实现截图停在发布审批前，因此没有最近发布条。
  - 位置：Session 预览工具栏下方。
  - 证据：实现中审批卡片已出现“确认发布 / 取消”，但没有执行会产生外部 OSS 地址的最终确认。
  - 影响：不影响审批前状态的设计和功能验证。
  - 处理：已通过服务端初始状态和组件实现验证最近发布条；本次 QA 不代替用户确认执行真实发布。

## 必检表面

- 字体与排版：沿用项目 Geist / 中文系统字体栈；Hero 大标题的字重、字号、紧凑字距和中文副标题层级与确认稿一致；侧边栏和工具状态使用较小字号但仍可读。长会话标题在顶栏和历史列表中截断，没有撑破布局。
- 间距与布局节奏：Hero 侧边栏、主内容宽度、主标题纵向位置、输入框和三项快捷入口已对齐确认稿；Session 桌面端约为 `42:58`，可拖拽且会记忆。卡片圆角、边框和段落间距一致。
- 颜色与视觉令牌：背景为近黑绿网格，主操作统一使用荧光绿；成功、等待确认、禁用和错误状态拥有可区分语义色。没有用渐变替代确认稿的视觉语言。
- 图片质量与资产一致性：Logo、Hero 网格和对话到网页插画均为实际 PNG 资产；没有用 CSS 画图、手写 SVG、文本符号或占位框替代可见资产。图片在目标尺寸下清晰且没有拉伸。
- 文案与内容：Hero 标题、副标题、输入提示和三个快捷创作入口与确认决策一致；工具步骤对普通用户使用“规划页面结构 / 生成 HTML / 检查页面 / 发布页面”等中文表达，原始参数与结果默认折叠。
- 图标：使用项目既有 Lucide 图标，线性风格、尺寸和荧光绿状态与确认稿相符。
- 响应式与可访问性：移动端使用对话 / 预览双 Tab，历史为抽屉；按钮、输入框、iframe 和导航均有语义标签，键盘焦点态可见。`390 × 844` 下没有横向溢出或不可用的持久控件。

## 对比迭代历史

### 迭代 1

- 早期发现 [P2]：移动端聊天区域继承了桌面 `42%` 内联宽度，导致工具卡和文字被压成窄列。
- 修复：将分栏比例改为 CSS 自定义属性，只在 `lg` 断点应用；移动端明确使用 `w-full`。
- 修复后证据：`artifacts/wish-creator/session-mobile.png` 与 `artifacts/wish-creator/preview-mobile.png`，聊天和预览都占满移动视口。

### 迭代 2

- 早期发现 [P2]：Hero 主标题区相对确认稿偏上，导致标题、输入框和快捷入口的纵向节奏过紧。
- 修复：桌面端主内容顶部间距调整为 `10.5rem`，输入区顶部间距单独调整为 `4.75rem`，同时缩短输入框高度。
- 修复后证据：`artifacts/wish-creator/hero-comparison.png` 与 `artifacts/wish-creator/hero-focus-comparison.png`，标题基线、说明文字、输入框和快捷入口已与确认稿形成相同节奏。

## 主要交互验证

- 未登录访问 `/wish-creator` 会跳转登录页。
- 登录后 Hero、历史会话、新建会话和快捷入口可用。
- 真实 DeepSeek / EVE 会话完成“规划 → 写入 HTML → 校验 → 预览”。
- iframe 内 JavaScript 按钮可以交互；预览支持桌面 / 手机和刷新。
- 发布按钮只生成一次人工审批卡；未确认前不会调用 OSS 发布。
- 会话刷新后消息、工具过程、HTML 预览和待审批状态可以恢复。
- 桌面分栏可拖拽并持久化；移动端对话 / 预览 Tab 和历史抽屉可用。
- 历史发布入口本期不存在；服务端保留发布记录，代码中有后续 TODO。

## 控制台检查

- Hero、Session 和另外三个既有产品回归页面的浏览器 `error` / `warn` 日志均为空。

## Implementation Checklist

- [x] Hero 与确认稿的桌面布局、资产、排版和快捷入口对齐。
- [x] Session 的导航、Agent 工具过程、预览工具栏和桌面分栏对齐。
- [x] 修复移动端聊天宽度，验证对话 / 预览双 Tab。
- [x] 验证真实生成、交互预览、审批边界和会话恢复。
- [x] 保持历史发布 UI 不进入本期范围。

## Follow-up Polish

- 后续接入固定视觉回归用例时，可增加一条确定性 HTML fixture，减少动态生成内容对截图差异的干扰。

final result: passed
