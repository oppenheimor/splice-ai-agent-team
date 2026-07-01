# Deep Diagnosis 优化执行计划

日期：2026-06-22

## 0. 背景共识

当前产品分层已经对齐：

| 层级 | 产品 | 定位 | 核心交付 |
|---|---|---|---|
| 免费 / 低价入口 | requirements-diagnosis | 帮用户完成经营画像和 AI 落地初筛 | 经营类型、AI 落地阶段、刚需方向、初步行动建议 |
| 自助深度诊断 | deep-diagnosis | 围绕具体业务 / 岗位问题生成可执行 AI 落地方案 | 结构化诊断、AI 可用环节、优先级、7/30/90 天路径 |
| 高意向人工承接 | 企业微信 | 承接需要定制、陪跑、私有数据接入或组织改造的客户 | 人工沟通、定制方案、后续服务转化 |

本阶段只优化 `deep-diagnosis`，不实现企业主 / 团队版诊断产品。企业微信只作为高意向线索承接出口。

## 1. 知识查询记录

按照项目 AGENTS 规则，本计划在规划前已查询第二大脑。

检索关键词：

```text
deep-diagnosis|深度诊断|自助深度诊断|AI 落地诊断|诊断产品|付费诊断|企业微信|人工转化|需求诊断
```

命中 2 个文件，属于 1-3 命中档，已直接全文读取：

- `/Users/paulchess/wiki-global/wiki/concepts/ai-telephone-digital-employee.md`
- `/Users/paulchess/wiki-global/wiki/products/whobot-pricing.md`

可吸收结论：

- “加企业微信 / 转人工 / 意向筛选”是已被验证的商业闭环动作，可以作为 deep-diagnosis 的高意向承接出口。
- 当前第二大脑没有专门的 “AI 落地诊断产品方法论 / 自助诊断收费模型” 页面，后续值得补充。

## 2. 总目标

把 `deep-diagnosis` 从 “requirements-diagnosis 的继续聊天入口” 升级成 “可收费的自助深度 AI 落地诊断产品”。

用户完成一次 deep-diagnosis 后，应获得一份能看懂、能拿去执行、能判断是否需要人工定制的 AI 落地诊断结果，而不是只得到一段聊天记录。

## 3. 成功标准

### 3.1 用户价值成功标准

用户应能明确得到：

1. 当前最值得优先改造的业务 / 岗位环节。
2. 为什么这些环节适合用 AI，而不是泛泛推荐工具。
3. 每个 AI 机会点适合的落地方式：工具、工作流、Agent、自动化、知识库、数据看板或定制开发。
4. 优先级评分依据与取舍理由。
5. 需要准备的数据、人员、权限、预算或流程条件。
6. 7 天、30 天、90 天分别该做什么。
7. 效果验证指标、当前基线、成功 / 失败阈值。
8. 风险、人工审核边界、失败信号、退出标准。
9. 是否需要进入企业微信人工沟通，以及为什么。
10. 当前结论基于哪些已知信息，哪些判断仍是假设。

### 3.2 产品体验成功标准

1. 独立进入 deep-diagnosis 时，Agent 能主动引导用户补齐业务现场。
2. 从 requirements-diagnosis 结果进入时，Agent 能自动利用已有画像，不要求用户重复说明。
3. 用户身份不被写死为企业主；设计师、运营、销售、产品、管理者等角色也能获得适配回答。
4. 对话过程有明确阶段感：收集信息、诊断判断、方案生成、人工承接判断。
5. 结果不是长篇泛论，而是结构化交付物。

### 3.3 工程成功标准

1. deep-diagnosis 有独立于 requirements-diagnosis 的产品语义和 prompt 约束。
2. 不破坏现有 requirements-diagnosis 问卷、结果页、上下文注入链路。
3. 关键结构可被测试或评估脚本验证，而不是只靠人工看一次。
4. 文件边界清晰，不把所有新增逻辑塞进现有大 prompt 或单个组件。

## 4. 非目标

本阶段不做：

1. 企业主 / 团队版完整产品闭环。
2. 企业微信真实 API 集成、二维码动态生成、CRM 写入。
3. 支付系统、订单系统、优惠券或权限套餐。
4. 多人协同诊断、团队成员邀请、组织级账号。
5. 私有数据上传、文件解析、企业知识库接入。
6. 大规模重构 requirements-diagnosis 既有问卷计分体系。

## 5. 产品边界

### 5.1 requirements-diagnosis 的职责

它是低摩擦入口，负责让用户快速获得：

- 经营类型
- AI 落地阶段
- 认知宽度和盲区
- 刚需方向
- 初步行动建议

它不承担完整业务方案设计。

### 5.2 deep-diagnosis 的职责

它是自助深度诊断，负责将一个具体问题拆成：

- 用户角色和决策位置
- 业务目标
- 当前流程
- 痛点和约束
- AI 机会点
- 优先级
- 落地方案
- 周期和风险
- 是否需要人工承接

### 5.3 企业微信承接的职责

它只处理高意向情况：

- 用户明确要做定制系统 / Agent / 自动化。
- 涉及私有数据、系统集成、企业内部流程。
- 用户愿意进一步沟通预算、周期、团队配合。
- Agent 判断自助报告不足以安全推进。

## 6. 诊断交付物定义

deep-diagnosis 的最终输出应收敛为一份 “AI 落地诊断书”。

建议结构如下：

```text
1. 诊断摘要
   - 用户角色
   - 决策位置
   - 当前业务 / 岗位问题
   - 最推荐的 AI 切入方向
   - 关键假设和信息缺口

2. 业务现场与问题定义
   - 当前流程
   - 核心痛点
   - 现有资源
   - 主要约束
   - 当前基线

3. AI 机会点清单
   - 机会点名称
   - 适合原因
   - 预期收益
   - 落地难度
   - 风险

4. 优先级评分与取舍依据
   - 先做什么
   - 暂缓什么
   - 不建议做什么
   - 预期价值
   - 落地难度
   - 数据准备度
   - 风险水平
   - 见效周期
   - 负责人可控性

5. 落地方案
   - 工具 / 流程 / Agent / 自动化 / 知识库 / 定制开发
   - 所需输入
   - 产出形式
   - 负责角色

6. 所需数据、人员、权限、预算和流程条件
   - 数据条件
   - 人员和负责人
   - 系统权限
   - 预算范围
   - 流程配合

7. 7 / 30 / 90 天路线图
   - 7 天：验证最小闭环
   - 30 天：沉淀可复用流程
   - 90 天：扩大到团队或系统层

8. 效果验证指标、基线和阈值
   - 当前基线
   - 核心指标
   - 成功阈值
   - 失败阈值
   - 观察周期

9. 风险、治理边界和退出标准
   - 数据风险
   - 组织风险
   - 成本风险
   - 哪些可以自动化
   - 哪些必须人工审核
   - 失败信号
   - 退出标准

10. 人工承接判断
   - 是否建议加企业微信
   - 建议原因
   - 沟通前需要准备的信息
```

## 7. 子任务拆解

### Task 1：定义 deep-diagnosis 独立诊断协议

目标：

- 将 deep-diagnosis 的核心流程从普通聊天变成可控诊断。

工作内容：

- 定义诊断阶段：入口识别、业务现场补齐、机会点判断、方案生成、人工承接判断。
- 定义每个阶段需要收集的信息。
- 定义信息不足时的追问策略。
- 定义何时可以停止追问并生成诊断书。

验收标准：

- 有明确的诊断阶段和状态说明。
- 非企业主角色也能被纳入协议。
- Agent 不会为了追问而无限追问。

### Task 2：拆分 deep-diagnosis 专属 Prompt

目标：

- deep-diagnosis 不再完全复用 requirements-diagnosis 的 promptBuilder。

工作内容：

- 新增 deep-diagnosis prompt builder。
- 保留 requirements-diagnosis 结果上下文注入能力。
- 加入自助诊断交付物约束。
- 加入企业微信承接判断规则。
- 保留证据等级、webSearch、AGUI 工具规范。

验收标准：

- `deep-diagnosis` 有独立 promptBuilder。
- requirements-diagnosis 的现有 prompt 行为不被破坏。
- 冷启动和带结果进入两种路径都有明确首响策略。

### Task 3：设计结构化诊断数据类型

目标：

- 让 deep-diagnosis 的结果可以被 UI、存储、测试共同理解。

工作内容：

- 定义诊断会话中的结构化字段。
- 定义最终 AI 落地诊断书 DTO。
- 区分 “对话消息” 和 “诊断产物”。
- 暂不要求完整 DB 持久化，但类型设计应预留持久化空间。

验收标准：

- 有清晰类型定义。
- 字段覆盖诊断摘要、业务现场、机会点、路线图、风险、企业微信承接判断。
- 类型命名不绑定企业主，能容纳岗位用户。

### Task 4：优化 Chat Shell 为诊断工作台

目标：

- 让用户感觉自己在完成一份诊断，而不是随便聊天。

工作内容：

- 将现有静态 “待确认问题 / 行动清单” 升级为有意义的诊断侧栏或上下文面板。
- 展示当前诊断进度或已确认信息。
- 展示下一步需要补齐的问题。
- 保留移动端可用性。

验收标准：

- 空状态能清楚说明 deep-diagnosis 的交付物。
- 对话中可以看到诊断正在收束。
- 不出现说明书式的大段功能介绍。

### Task 5：生成结构化 AI 落地诊断书

目标：

- 用户在 deep-diagnosis 中能拿到最终交付物。

工作内容：

- 设计触发方式：用户主动要求生成 / Agent 判断信息足够后建议生成。
- 使用 AGUI 组件展示机会点、优先级、路线图、清单。
- 生成纯文本 fallback，避免工具渲染失败导致交付中断。
- 诊断书中明确 7 / 30 / 90 天路径。

验收标准：

- 至少覆盖 3 种样例用户：企业主、设计师、运营 / 销售类岗位。
- 结果包含机会点、优先级、路线图、风险和下一步。
- 不把所有建议都写成 “建议使用 AI 工具提高效率” 这种泛话。

### Task 6：企业微信高意向承接

目标：

- 在不做完整团队版产品的前提下，把高意向用户导向人工。

工作内容：

- 定义高意向触发条件。
- 设计 Agent 的转化话术，避免强销售。
- 在诊断书末尾提供企业微信承接 CTA。
- 暂时使用静态占位链接 / 文案，不接真实 API。

高意向触发条件初版：

- 用户询问定制开发、系统接入、私有数据、企业知识库、跨部门流程。
- 用户明确提到预算、团队、上线周期、老板 / 部门决策。
- Agent 判断方案需要人工确认业务细节。
- 用户主动表示想找人帮忙落地。

验收标准：

- 普通自助用户不会被过早推企业微信。
- 高意向用户能清楚知道加企业微信前要准备什么。
- CTA 是诊断结果的自然延伸，不像广告。

### Task 7：评估脚本和样例用例

目标：

- 避免 deep-diagnosis 质量只能靠手感判断。

工作内容：

- 建立样例输入集。
- 覆盖带 requirements-diagnosis 结果进入和直接进入两条路径。
- 覆盖企业主、设计师、运营 / 销售类岗位。
- 检查输出是否包含关键结构。

验收标准：

- 有可运行的本地评估脚本或最小测试。
- 能检查诊断书关键字段是否存在。
- 能暴露过度泛化、缺少周期、缺少风险、过早销售等问题。

### Task 8：回归验证

目标：

- 确保 deep-diagnosis 优化不破坏现有产品链路。

验证项：

- requirements-diagnosis 首页、问卷、结果页仍可正常使用。
- 从结果页进入 deep-diagnosis 时上下文正确注入。
- 直接进入 deep-diagnosis 时可以冷启动。
- Chat API 工具调用不回归。
- 移动端文本、按钮、工具组件不明显溢出。

验收标准：

- `pnpm lint` 或项目现有 lint 命令通过。
- `pnpm typecheck` 或项目现有类型检查通过。
- 如项目没有对应脚本，需要记录无法执行原因。

## 8. 推荐执行顺序

建议按以下顺序落地，减少返工：

1. Task 1：诊断协议。
2. Task 2：deep-diagnosis 专属 Prompt。
3. Task 3：结构化诊断类型。
4. Task 5：诊断书生成逻辑。
5. Task 4：诊断工作台 UI。
6. Task 6：企业微信承接。
7. Task 7：评估脚本。
8. Task 8：回归验证。

原因：

- 先定义诊断协议和输出结构，UI 才知道展示什么。
- 先让 Agent 稳定生成诊断书，再优化工作台体验。
- 企业微信承接应依附于诊断结果，而不是提前作为独立销售入口。

## 9. 关键风险

### 风险 1：deep-diagnosis 仍然像聊天

表现：

- 用户问什么答什么，没有阶段收束。
- 最终没有可交付诊断书。

控制方式：

- Prompt 中强约束诊断阶段。
- UI 中展示诊断进度和最终交付物。
- 评估脚本检查关键结构。

### 风险 2：过度企业主化

表现：

- 设计师、运营、销售等岗位用户得到不贴切回答。

控制方式：

- 诊断协议中加入 role / decisionPosition 字段。
- Prompt 中要求先识别用户角色和决策范围。
- 样例评估覆盖非企业主用户。

### 风险 3：过早销售企业微信

表现：

- 用户还没获得价值就被引导加微信。

控制方式：

- 企业微信只在高意向条件触发。
- CTA 放在诊断书末尾或用户主动询问时。
- 话术强调 “适合人工沟通的原因”，不是泛销售。

### 风险 4：结构过重导致体验变慢

表现：

- 用户必须回答太多问题才看到价值。

控制方式：

- 每轮只问 1-2 个关键问题。
- 信息不足时先给临时判断，再说明需要补充什么。
- 允许用户随时要求生成初版诊断书。

## 10. 待核对问题

开始实现前建议确认：

1. deep-diagnosis 首版是否需要真实付费墙，还是先只做自助诊断体验？
2. 企业微信 CTA 首版使用二维码、链接、还是占位文案？
3. 诊断书是否需要保存历史，还是首版只存在于当前对话？
4. deep-diagnosis 是否继续复用 requirements-diagnosis 的视觉风格，还是轻微区分？
5. 首版价格是否要在页面上露出，还是先不露出价格？

## 11. 第一版完成定义

当以下条件满足时，可以认为 deep-diagnosis 第一版优化完成：

1. 用户可以独立进入 deep-diagnosis 并完成一次完整自助诊断。
2. 用户可以从 requirements-diagnosis 结果页进入 deep-diagnosis，并自动带入画像上下文。
3. Agent 能稳定生成 AI 落地诊断书。
4. 诊断书包含 AI 机会点、优先级、7/30/90 天路线图、风险和人工承接判断。
5. 高意向用户能被自然引导到企业微信。
6. 非企业主角色至少在样例评估中能得到合理输出。
7. 现有 requirements-diagnosis 核心链路不回归。

## 12. 人工实测 UAT 记录：茶饮单店私域沉淀

测试时间：2026-06-22

测试入口：

```text
先快速横向扫描我的业务流程，判断哪些环节值得 AI 改造、哪些不值得。
```

用户画像：

- 行业：茶饮。
- 角色：单店店主 / 店长。
- 门店阶段：新店开业 3 个月内。
- 当前基础：已用收银系统；已有企业微信或微信群；日均 50 杯以下。
- 聚焦方向：线上营销与内容获客，进一步聚焦私域沉淀。
- 追加事实：团购已上架，但效果一般。

### 12.1 总评分

本次人工实测评分：**78 / 100**。

一句话判断：

> 已经从“空洞咨询报告”进化成“可执行诊断流程”，但还没到“用户愿意为深度诊断买单”的稳定水准。当前最大进步是流程跑通了，最大问题是证据链和评分体系还不够硬。

### 12.2 做得好的地方

1. **流程明显变好**
   - 没有一上来就给方案，而是先问行业、角色、阶段，再做横向扫描，再聚焦线上获客，再进入私域沉淀。
   - 整体路径符合 deep-diagnosis “先横扫、再聚焦、再交付”的目标。

2. **能做范围收束**
   - 最终报告明确覆盖「线上引流 → 到店转化 → 私域沉淀」。
   - 同时声明未覆盖产品研发、库存管理、排班运营、财务核算，避免伪装成全局完整诊断。

3. **事实确认有效**
   - 出方案前确认了茶饮单店、新店、收银系统、企微 / 群、日均 50 杯以下、关注私域沉淀等关键事实。
   - 用户确认事实准确后才进入方案设计，符合关键事实确认门禁。

4. **有可执行资产**
   - 输出了「到店顾客私域沉淀 SOP」、团购优化清单、ChatGPT 提示词、7 / 30 / 90 天路线图。
   - 相比早期空泛建议，已经具备可执行交付物雏形。

5. **有取舍和暂不建议**
   - 明确不建议急着买自动化营销工具、不建议大量投流、不建议在群里频繁发广告。
   - 这类“劝阻”让报告更像顾问判断，而不是工具清单。

### 12.3 主要扣分点

1. **横向扫描还不够像真正的横向扫描**
   - 初始横扫列了新品、库存、营销、客服、排班，但“预期价值”显示为 `-`。
   - 没有统一可比较评分表，也没有解释为什么“客户服务”后来没有继续入选。
   - 改进方向：横扫阶段必须输出 3-5 个候选环节的统一打分，例如价值、难度、数据准备、见效周期、风险、第一瓶颈匹配度，总分必须可比较。

2. **外部搜索证据链不够可信**
   - 调用了 `webSearch`，但正文引用时没有把来源标题、URL、原始摘录和使用方式绑定起来。
   - 出现了类似“小红书品牌笔记数增长 195%+”“ChatGPT 8 美元/月”等需要更严谨来源的说法。
   - 改进方向：外部分析每条发现都按「发现 → 来源标题 → URL → 原始摘要 → 证据等级 → 对本用户的影响」输出；没有完整链条时只能降级为 C 级推断。

3. **coverage 声明仍然偏弱**
   - 没有说明搜了哪些关键词、覆盖了哪些来源类型、没有覆盖哪些来源。
   - 改进方向：搜索后固定输出「本次搜索覆盖 / 未覆盖」，例如覆盖小红书 / 抖音 / 团购 / 私域，未覆盖本地商圈真实竞品、门店后台数据、平台广告数据等。

4. **反例机制不足**
   - 最终报告有“推翻条件”，但外部分析阶段没有主动找反例。
   - 缺少类似：私域沉淀对低客流新店可能见效慢、店员执行会拖垮体验、优惠券钩子可能吸引低质量顾客等不适配判断。
   - 改进方向：每个 P0 建议必须配一个“不适用条件 / 失败案例 / 什么情况下不要做”。

5. **评分体系有明显问题**
   - 中间方案里出现“综合分 49”，但各项描述都很高。
   - “成本投入 10/100”“风险水平 15/100”到底是好还是坏不清楚，会伤害可信度。
   - 改进方向：统一评分方向。所有维度都按“越高越值得做”评分；风险改成“风险可控性”，成本改成“成本友好度”。

6. **业务现场缺关键基线**
   - 已询问日均杯量，但没有问客单价、毛利、团购核销数、当前私域人数、店员人数、商圈位置、平台评分。
   - 这些信息会直接影响团购和私域方案质量。
   - 改进方向：出 `workflow_report` 前至少补齐 5 个核心基线：日均杯量、客单价、团购核销、当前私域人数、平台评分 / 评价数。

7. **最终报告还不够付费级**
   - 行动建议很实用，但部分内容仍像通用门店运营常识。
   - 真正打动用户的部分应该是：根据用户当前状态，指出“团购效果一般”的最可能原因，并给出排查路径。
   - 改进方向：加入“诊断假设树”。例如团购效果一般可能来自曝光低、点击低、转化低、核销低、复购低，每个分支对应要查什么数据、怎么修。

### 12.4 下一轮优化优先级

优先修三件事：

1. **横向扫描评分表真实可比较**
   - 强制候选环节使用同一套评分方向。
   - 禁止出现无法解释的空值或方向混乱的分数。

2. **外部搜索证据链结构化**
   - 把 `webSearch` 结果转成可引用证据块。
   - 报告中引用外部结论时必须附来源标题、URL、原始摘要、证据等级和使用方式。

3. **从建议清单升级为诊断假设树**
   - 对核心问题建立原因树。
   - 每个原因分支要求补哪些数据、如何判断、对应修复动作是什么。

达到这三点后，deep-diagnosis 才会从“AI 很会给建议”，升级成“它真的像在诊断我的店”。

## 13. 通用方法论：Deep Diagnosis OS

背景：

茶饮单店只是一次人工实测案例，不能靠穷举行业来把 deep-diagnosis 做到 90 分。真正可泛化的方法不是覆盖所有行业，而是建立一套行业无关的诊断骨架、行业轻量适配层和可回归评估体系。

核心判断：

> 不要问“茶饮怎么诊断、教培怎么诊断、律师怎么诊断”。要问“任何一个业务问题，怎样被拆成范围、目标、流程、瓶颈、假设、证据、方案、验证、失败分支”。

### 13.1 诊断范围层

每次报告必须先落到一个诊断范围等级：

- 单问题诊断：只回答一个具体想法值不值得做。
- 单流程诊断：覆盖一个流程，例如获客、交付、客服、内容生产。
- 岗位诊断：覆盖某个角色的主要工作。
- 业务全局诊断：覆盖多个核心业务环节。

90 分关键：

- 不能让用户误以为单点深挖就是完整诊断。
- 如果只深挖一个问题，报告必须明确降级为单问题或单流程报告。

### 13.1.1 入口范围路由器

实际测试发现，门店老板、运营负责人这类用户经常不是“只有一个问题”，而是同时困扰于客流、转化、员工、库存、复购和运营琐事。此时如果系统直接问“最头疼的问题是哪一个”并强制单选，会把用户锁进单一路径，后续报告容易显得遗漏真实经营复杂度。

入口必须先做范围路由：

- 先全局盘点：用户有多个问题，先多选 2-5 个候选问题，再横向扫描。
- 聚焦一个问题：用户已明确要深挖某个问题，直接进入单问题或单流程诊断。
- 还说不清楚：用户只有模糊困惑，先追问业务现场，再归类成候选问题池。

全局盘点不是把所有问题都深挖一遍，而是：

```text
入口范围选择 → 多问题收集 → 横向扫描 → 推荐优先深挖 1-2 个 → 用户确认 → 单点 / 单流程深度诊断
```

90 分关键：

- 多问题用户必须能被承接，但不能让报告变散。
- 多选后的横向扫描要说明问题之间可能是因果链，不要把所有症状当成并列待办。
- 多问题横扫后只深挖一个流程时，报告命名为“业务横向扫描 + 单流程深度诊断”，不能叫完整业务全局诊断。

### 13.1.2 交互契约层

实际测试还暴露出一个更底层的问题：系统有时会在正文里要求用户“先说说业务类型和角色”，但同一轮又弹出只能选择业务环节的卡片。用户会不知道自己该在哪里填写业务类型和角色。

这不是 UI 小瑕疵，而是交互契约错误：

- 开放式信息收集适合自由文本。
- 范围、方向、优先级确认适合 `askUserChoice`。
- 同一轮不能同时要求用户自由填写必答信息，又弹一个结构化选择卡片。

强制规则：

- 每轮只承载一种输入形态：开放文本或结构化选择。
- 如果正文出现“请告诉我 / 先说说 / 补充一下 / 写下”这类开放式必答要求，本轮不要调用 `askUserChoice`。
- 如果调用 `askUserChoice`，正文只能写一句承接，所有必答内容必须能在卡片选项或 `allowOther` 输入框里完成。
- 如果既需要业务类型 / 角色 / 阶段，又需要多选候选环节，必须拆成两轮：先收开放信息，再弹选择卡片。

90 分关键：

- 用户每一轮都必须清楚“我现在应该输入文字，还是点选项”。
- 不要让工具卡片替代复杂表单；`allowOther` 只能补充选项之外的信息，不能承接多个开放字段。

### 13.1.3 完整报告就绪门禁

实际测试中还出现过另一个高风险问题：用户只提供了业务类型、角色和阶段，系统做完横向扫描和外部搜索后，就提示“现在信息够出完整方案了”。这会让用户感觉诊断过快，像模板生成，而不是深度诊断。

完整报告不能只靠“模型觉得差不多了”。进入「出完整方案」之前必须满足：

- 已完成横向扫描。
- 已确定用户选择的深挖方向。
- 已让用户确认关键事实：已确认事实、待确认事实、未覆盖区域。
- 已补齐最小事实包：业务类型、用户角色、当前阶段、深挖方向、当前基线、真实样本或明确缺失、目标指标、资源约束。
- 如果用户选择了系统不推荐的低优先级方向，必须先追问“为什么你更想看这个方向”，并把原因记录为事实。

如果不满足以上条件：

- 不能出现“出完整方案”按钮。
- 只能继续追问 1-2 个关键问题。
- 或者诚实降级为 `hypothesis_brief`，给“先看假设简报 / 继续补关键信息”的选择。

90 分关键：

- webSearch 和外部资料不能替代用户事实确认。
- 用户反选低优先级方向时，系统不能直接顺着生成完整报告，必须先理解用户坚持这个方向的真实原因。
- “完整诊断书”必须让用户感觉前面确实经历了必要的诊断过程，而不是两三轮后直接出长文。

工程化落地：

- 新增运行期完整报告就绪判定，从完整对话里检查最小事实包、关键事实确认、反选原因确认。
- 运行期就绪判定新增 `hasBlockingPendingFacts`：只要「待确认事实」非空且用户没有显式跳过，就阻塞完整报告。
- 运行期就绪判定新增 `hasUncoveredAreas`：只要「未覆盖区域」非空，就只能称为本轮专项方案 / 单流程方案，不能称为完整方案。
- 如果未就绪，系统上下文会明确注入：本轮禁止出现「出完整方案」选项，也不要说「现在信息够出完整方案」。
- 新增真实 UAT 失败样例：教培校长起步 1 个月，横向扫描推荐内容产出，但用户反选复购/续费，系统 webSearch 后过早提供「出完整方案」按钮。
- 新增真实 UAT 失败样例：教培招生办老师起步 1 个月，待确认事实仍包含地推月成本、招生目标、线上账号，却进入「出完整方案」。
- 新增真实 UAT 失败样例：获客专项诊断列出课程交付、复购、排课、财务等未覆盖区域，却仍称为完整方案。
- 该样例进入 `scripts/evaluate-deep-diagnosis.mjs` 回归检查，避免后续只靠 prompt 自律。

范围扩展体验：

- 「未覆盖区域」不是免责声明，而是下一步诊断入口。
- 如果用户已经补齐当前专项范围的信息，应提示：当前范围可以出专项方案；未覆盖模块可以继续诊断。
- 选项应类似「出本轮专项方案 / 继续看未覆盖模块」，而不是「出完整方案 / 再诊断一轮」。

### 13.2 业务结构层

用通用业务地图替代行业枚举。

大多数行业都可以拆成以下通用环节：

- 获客。
- 转化。
- 交付。
- 复购。
- 客服。
- 内容。
- 运营。
- 供应链。
- 财务。
- 管理协同。
- 数据分析。

茶饮、教培、律所、SaaS、电商，本质都是这些环节的不同组合。

90 分关键：

- 先横向扫描这些环节，再决定深挖哪个。
- 行业只是变量，业务结构才是骨架。

### 13.3 瓶颈层

不要直接给建议，先定位约束。

所有问题先归类成瓶颈类型：

- 目标不清。
- 流量不足。
- 转化偏弱。
- 交付效率低。
- 质量不稳定。
- 数据缺失。
- 流程断点。
- 人员执行弱。
- 工具错配。
- 复购不足。

用户付费感来自这里：

> 用户不是想听“你可以用 AI 写文案”，而是想知道“我真正卡住的是哪里”。

### 13.4 假设树层

这是从 78 分升到 90 分的关键。

例如“团购效果一般”，不能直接说“优化标题和主图”，而要先拆假设树：

- 曝光低：平台没有给流量。
- 点击低：标题 / 主图不吸引。
- 下单低：价格 / 套餐不合适。
- 核销低：买了不到店。
- 复购低：到店后没有沉淀私域。

每个分支都必须对应：

- 要查什么数据。
- 怎么判断是不是它。
- 如果是，怎么修。
- 如果不是，排除掉什么。

90 分报告必须让用户感觉：

> 它不是在给建议，它在查案。

### 13.5 证据层

外部搜索不能只当装饰，必须升级成证据块。

每条外部发现都应该固定为以下结构：

```text
发现：
来源标题：
URL：
原始摘要：
证据等级：A/B/C/D
适用于用户的原因：
不适用或需谨慎的地方：
对诊断结论的影响：
```

90 分关键：

- 用户要看到模型为什么敢这么判断。
- 没有来源标题、URL、原始摘要和使用方式的外部结论，只能降级为 C 级推断。
- 搜索 coverage 必须说明覆盖了什么、没有覆盖什么。

### 13.6 方案层

每个建议都必须可执行、可验证、可失败。

每个机会点必须包含：

- 做什么。
- 谁做。
- 用什么工具。
- 需要什么数据。
- 第 1 天怎么开始。
- 7 天看什么信号。
- 30 天成功阈值。
- 失败后怎么办。
- 什么情况下不要继续。

这比普通的 7 / 30 / 90 天路线图更硬，因为它有退出机制。

### 13.6.1 升级路径与定制适配度

deep-diagnosis 的高客单转化不能靠报告末尾加一句“如需定制请联系我们”。那会让诊断变成销售话术，反而削弱可信度。

正确做法是把“可自助、可模板化、可系统化”的升级路径嵌入每个高优先级机会点：

| 层级 | 适用场景 | 报告必须说清 |
|---|---|---|
| 自助工具版 | 单人能推进、数据少、试错成本低 | 今天用什么工具、填什么输入、7 天看什么结果 |
| 工作流模板版 | 多人协作、需要稳定复用、已有固定业务节奏 | 表格字段、责任人、节奏、检查点、复盘方式 |
| 系统 / Agent 定制版 | 已有重复流程、跨角色协同、数据分散、人工漏斗损耗明显 | 为什么可能值得系统化、还缺哪些事实、先做哪个最小试点 |

关键约束：

- 不能默认推荐定制。只有命中触发信号时，才允许出现“系统 / Agent 定制版”作为升级判断。
- 如果没有触发信号，报告应明确建议先跑自助工具版或工作流模板版。
- 如果命中触发信号，也不要写报价、不要强推人工承接，而是写成“系统化升级判断”。
- “系统化升级判断”必须包含：当前为什么可能值得升级、需要补哪些事实、最小试点做什么、试点失败后如何回退。
- 系统 / Agent 定制版不能只是“做一个智能体”。它必须说清需要嵌入哪些工具、知识、观测数据、动作接口和权限边界，否则只能算概念建议，不能算定制适配判断。

触发信号包括：

- 流程需要多人协作，单靠老板或一个执行人已经卡住。
- 数据分散在多个工具、表格、群聊或系统里，人工汇总影响决策。
- 同一类动作每周重复多次，且漏跟进、漏复盘、漏提醒会造成损失。
- 用户已经跑通过工具版，但稳定性、权限、留痕、看板或自动化衔接成为新瓶颈。
- AI 输出需要进入真实业务流程，例如线索分配、客户跟进、内容审核、库存预警、客服工单、经营复盘。

这部分的本质不是销售转化，而是成熟度分层。用户会觉得值钱，是因为他看到了“我今天怎么开始、团队怎么复制、什么时候才值得系统化”的连续路径。

参考第二大脑中的 `SkillForge` 和 `Learn Claude Code`：企业级 Agent 价值来自真实流程、真实工具、运行反馈和 harness 工程，而不是通用模型临场发挥。因此 deep-diagnosis 只在诊断证据足以支撑时，才把定制作为下一层成熟度。

### 13.7 评估层

不要用人工测试覆盖所有行业，要用 benchmark 覆盖问题结构。

建议优先覆盖 20-30 个“问题结构”，例如：

- 新店获客不足。
- 老客户复购不足。
- 内容产能不足。
- 客服重复问题太多。
- 销售线索跟进不及时。
- 交付质量不稳定。
- 库存损耗高。
- 团队协同混乱。
- 数据分散无法决策。
- 老板有 AI 想法但不知道值不值得做。

行业不是重点，问题结构才是重点。

### 13.8 90 分评分标准

建议将 deep-diagnosis 报告按 110 分拆成：

| 维度 | 分值 | 说明 |
|---|---:|---|
| 范围声明准确 | 15 | 不伪完整，明确报告级别和未覆盖区域 |
| 横向扫描真实可比较 | 15 | 候选环节使用同一套评分方向 |
| 第一瓶颈定位准确 | 15 | 能指出当前最先卡住业务结果的约束 |
| 假设树清晰 | 15 | 有原因分支和排查路径 |
| 证据链可信 | 15 | 有 coverage、引用链、反例和证据等级 |
| 方案可执行 | 15 | 有资产、指标、负责人和失败分支 |
| 顾问感表达 | 10 | 像业务顾问，不像模板报告 |
| 接地气程度 | 10 | 贴着用户现场、基线、预算和人手给低成本动作 |

90 分不是每项满分，而是不能有硬伤。尤其不能缺：

- 范围。
- 瓶颈。
- 假设树。
- 证据链。
- 可执行资产。
- 失败分支。

接地气程度单独计分，原因是人工测试显示：即使范围、证据、路线图都齐了，如果方案听起来像给头部品牌、成熟团队或咨询报告读者看的，用户仍然不会买账。接地气的报告必须出现：

- 用户现场：引用用户原话或现场事实。
- 当前基线：哪怕是估算，也要说清现在大概什么水平。
- 低成本动作：优先给零成本 / 低成本 / 现有工具能做的动作。
- 7 天内真实试跑：用户能在一周内跑一次真实业务样本。
- 现在不用做什么：明确挡掉大系统、大设备、大团队、重投入方案。

### 13.9 工程化落地模块

下一阶段不应继续只补 prompt 细节，而应做 4 个工程化模块：

1. **Universal Business Map**
   - 定义通用业务环节、瓶颈类型、AI 介入方式、自动化等级。

2. **Diagnosis Hypothesis Tree**
   - 针对常见问题结构建立假设树模板，例如获客、转化、复购、交付、客服、内容、库存。

3. **Evidence Compiler**
   - 把 `webSearch` 结果编译成证据块，强制带 coverage、引用链、反例和证据等级。

4. **Report Judge**
   - 报告生成后做结构化评分。
   - 低于 90 分不允许叫“完整诊断书”，只能叫“初版假设报告”。

### 13.10 目标流水线

deep-diagnosis 的目标不是“一个很会聊的 AI 顾问”，而是一条业务诊断流水线：

```text
范围判断 → 横向扫描 → 瓶颈定位 → 假设树 → 证据对照 → 方案设计 → 质量评分 → 任务化
```

这套流水线稳定了，行业只是变量。这才是把 deep-diagnosis 做到 90 分的通用方法。

### 13.11 变更工作流：先压测决策，再改 Prompt

后续每次新增 deep-diagnosis 能力，不能再直接补 prompt。真实 UAT 已经证明：很多规则“听起来很对”，但一跑就暴露过度触发、UI 无法承接、状态机冲突或报告命名失真。

新的变更工作流固定为：

1. **行为判定表**
   - 写清楚什么时候触发。
   - 写清楚什么时候不触发。
   - 写清楚缺哪些信息不能触发。
   - 写清楚触发后允许输出什么，不允许输出什么。

2. **正例与反例压测**
   - 至少准备 3 个正例。
   - 至少准备 5 个反例。
   - 反例必须覆盖：信息不足、用户多问题、用户反选低优先级、工具失败、UI 无法承接、过度推荐定制。

3. **状态机 / UI 承接检查**
   - 每个模型问题都要明确输入形态：自由文本、单选、多选、表单或确认。
   - 如果正文要求用户补开放信息，本轮不能弹只能选择的卡片。
   - 如果调用 `askUserChoice`，所有必答信息必须能在选项或 `allowOther` 中完成。

4. **模拟对话测试**
   - 不只评估最终报告，还要跑多轮 scripted conversation。
   - 测试模型是否过早进入完整报告、是否遗漏关键事实确认、是否把未覆盖区域伪装成完整方案。
   - 新增能力必须先通过模拟对话，再进入 prompt 或运行时策略。

5. **运行时门禁优先于 Prompt 自律**
   - 只要某个规则会影响报告级别、是否出完整方案、是否建议定制、是否调用工具，就应优先工程化成判定函数。
   - Prompt 负责表达风格和业务解释，运行时策略负责硬决策。

这套流程的目标不是让开发变慢，而是减少“听起来合理、实测打补丁”的循环。每次补能力前，先把它变成可判定、可反驳、可回归的产品行为。

### 13.12 `buildDeepDiagnosisPrompt` 决策层审视

当前 `buildDeepDiagnosisPrompt` 的问题不是内容少，而是规则太多都压在自然语言里。它已经包含范围路由、交互契约、横向扫描、假设树、外部证据、事实确认、报告就绪、质量 Gate、升级路径、人工承接等完整约束，但这些约束之间缺少统一的决策优先级。

需要优先优化的决策点：

1. **把“允许生成什么”从 prompt 中抽到运行时决策**
   - 例如 `hypothesis_brief`、`workflow_report`、`overview_scan_plus_workflow_report`、`business_overview_report` 应由状态机 / readiness evaluator 决定。
   - Prompt 只读取当前允许的报告级别和禁止项，不再自行判断“现在够不够完整”。

2. **建立统一的 Decision Policy**
   - 输入：入口路由、事实包、横向扫描状态、深挖方向、待确认事实、未覆盖区域、证据状态、质量分、定制触发信号。
   - 输出：下一步动作，例如 `ask_scope_route`、`ask_open_facts`、`run_scan`、`confirm_facts`、`offer_special_report`、`offer_complete_report`、`generate_hypothesis_brief`。
   - 这层应是纯函数，便于写 fixture 和模拟对话测试。

3. **拆分软规则和硬规则**
   - 硬规则：是否可出完整方案、是否可称完整报告、是否可推荐定制、是否可调用工具、是否可弹选择卡片。
   - 软规则：怎么表达、怎么更接地气、如何排序、如何写顾问感。
   - 硬规则不能继续只靠 prompt 自律。

4. **修复 prompt 内部潜在冲突**
   - 「用户主动要求生成方案时，即使信息不满，也可以生成初版」容易和完整报告就绪门禁冲突；应改成只能生成 `hypothesis_brief` 或专项假设简报。
   - 「每个高优先级机会点都必须给出三档路径」容易和「没有触发信号不要引导定制」冲突；应改成第三档只在命中定制 readiness 时展开，否则只写“暂不建议系统化”。
   - 「连续两轮继续诊断后第三轮建议先出完整方案」容易绕过最小事实包；应改成第三轮建议“出当前允许级别的报告”，而不是默认完整方案。
   - `generate_report` 的描述仍写“尝试生成可访问 HTML 链接”，但 `publishHtmlReport` 当前未启用；这里应统一改成不承诺 HTML 链接。
   - 「用户确认关键事实」不适合只用 `askUserChoice` 承接复杂事实，应引入事实卡确认或自由文本确认。

5. **为定制建议增加 readiness 和 blocking gate**
   - 触发信号分为软信号和硬信号。
   - 存在阻塞信号时，只能写“定制前置条件”，不能写“建议定制”。
   - 推荐系统 / Agent 定制时，必须同时具备：业务损失、稳定重复流程、数据源或样本、人工兜底边界、最小试点指标。

6. **Prompt 应降级为“表达层”**
   - 当前 prompt 同时承担策略、流程、质量、表达、工具边界，负担过重。
   - 下一步应把它拆为：运行时策略上下文、报告结构模板、表达风格要求、工具使用纪律。
   - 这样后续新增能力时，不需要继续往一个大 prompt 里塞更多自然语言规则。

建议的目标结构：

```text
messages
  -> extractDiagnosisState
  -> decideNextDeepDiagnosisAction
  -> buildManagedContext
  -> buildDeepDiagnosisPrompt
  -> model output
  -> evaluateOutputAgainstDecision
```

其中 `buildDeepDiagnosisPrompt` 不再决定“该不该做”，只负责在已决策的边界内“怎么说得专业、具体、接地气”。

### 13.13 第一阶段落地：Decision Policy 最小闭环

已按 P0 范围完成第一版运行时决策策略层，目标是先拦住最容易造成 UAT 反复打补丁的硬决策，不把系统扩成庞大规则引擎。

新增文件：

- `lib/deep-diagnosis/decision/types.ts`
- `lib/deep-diagnosis/decision/state.ts`
- `lib/deep-diagnosis/decision/policy.ts`
- `lib/deep-diagnosis/decision/format.ts`
- `lib/deep-diagnosis/decision/index.ts`

接入点：

- `lib/deep-diagnosis/context-manager.ts`：在托管上下文中注入【Deep Diagnosis 决策策略层】。
- `lib/agent-team/agents/prompts/deep-diagnosis.ts`：明确策略层是运行时裁判，优先级高于 prompt 通用写作建议。
- `lib/deep-diagnosis/protocol-data.ts`：新增定制软信号、硬信号、阻塞信号和 readiness 规则。
- `scripts/evaluate-deep-diagnosis.mjs`：新增 Decision Policy、定制 readiness、conversation bad cases 检查。

当前第一版规则覆盖：

1. 入口范围路由缺失时，只能做 `ask_scope_route`。
2. 全局盘点但缺业务类型 / 用户角色 / 当前阶段时，只能做开放文本追问，不能弹多选卡片。
3. 待确认事实非空时，阻塞完整方案。
4. 最小事实包缺失时，最高只能到 `hypothesis_brief`。
5. 关键事实未确认时，必须进入事实确认。
6. 未覆盖区域非空时，只能提供本轮专项方案 / 继续看未覆盖模块。
7. 完整报告就绪且无未覆盖区域时，才允许提供完整方案确认。
8. 定制建议按软信号 / 硬信号 / 阻塞信号分层，避免过度推荐系统 / Agent 定制。
9. 工具失败或弱来源信号必须披露，不能包装成已验证结论。

规则合并原则：

- `hardBlocks` 只能追加。
- `forbiddenPhrases` 只能追加。
- `maxReportLevel` 只能降级。
- `nextAction` 由更高优先级阻塞规则决定。
- prompt 不得自行升级策略层给出的最高报告级别。

新增 conversation bad cases：

- `scripts/fixtures/deep-diagnosis/conversations/open-context-choice-mismatch.bad.md`
- `scripts/fixtures/deep-diagnosis/conversations/pending-facts-complete-report.bad.md`
- `scripts/fixtures/deep-diagnosis/conversations/customization-overtrigger.bad.md`

已通过验证：

```bash
node scripts/evaluate-deep-diagnosis.mjs
pnpm lint lib/deep-diagnosis/decision/types.ts lib/deep-diagnosis/decision/state.ts lib/deep-diagnosis/decision/policy.ts lib/deep-diagnosis/decision/format.ts lib/deep-diagnosis/decision/index.ts lib/deep-diagnosis/context-manager.ts lib/deep-diagnosis/protocol-data.ts lib/deep-diagnosis/protocol.ts lib/agent-team/agents/prompts/deep-diagnosis.ts scripts/evaluate-deep-diagnosis.mjs
pnpm exec tsc --noEmit
```

### 13.17 第五阶段落地：90 -> 94 Report Judge 真裁判

本阶段目标：把 `Report Judge` 从“关键词打卡器”升级为可复现的维度化裁判，能识别关键词齐全但逻辑空洞的报告。

已改造：

- `lib/deep-diagnosis/report-quality.ts`
- `lib/deep-diagnosis/runtime-quality-gate.ts`
- `lib/deep-diagnosis/output-validator.ts`

新增：

- `scripts/fixtures/deep-diagnosis/keyword-stuffed-hollow-report.bad.md`
- `scripts/evaluate-deep-diagnosis-judge.mjs`

Judge 维度：

1. 诊断范围与报告级别。
2. 横向扫描。
3. 第一瓶颈可信度。
4. 因果链。
5. 证据强度。
6. 可执行资产质量。
7. 接地气程度。
8. 反选与暂不做判断。
9. 定制升级适配度。

新增裁判能力：

- 输出 `verdict`：`pass / revise / downgrade / continue_diagnosis`。
- 输出 `revisionHints`，说明每个未通过维度的修订原因。
- 每个维度包含 `antiPatterns`，用于拦截“建议加强、提升效率、形成闭环、根据实际情况、持续优化”等空洞话术。
- 阻塞维度未通过时，禁止称为完整报告。
- `Output Validator` 消费 Judge verdict 和 revision hints，不再只看分数。
- `Runtime Quality Gate` 在上下文中展示 verdict、阻塞项和修订建议。

新增 benchmark：

- golden case：`content-creation.good.md`，要求 Judge 输出 `pass` 且 `score >= 90`。
- hollow bad case：`keyword-stuffed-hollow-report.bad.md`，即使包含诊断范围、横向扫描、第一瓶颈、证据、可用资产等关键词，也必须被判为非 pass。

已通过验证：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-runtime.mjs
node scripts/evaluate-deep-diagnosis-judge.mjs
node scripts/evaluate-deep-diagnosis-conversations.mjs
pnpm lint lib/deep-diagnosis/report-quality.ts lib/deep-diagnosis/runtime-quality-gate.ts lib/deep-diagnosis/output-validator.ts scripts/evaluate-deep-diagnosis.mjs scripts/evaluate-deep-diagnosis-runtime.mjs scripts/evaluate-deep-diagnosis-judge.mjs
pnpm exec tsc --noEmit
```

当前边界：

- 这是 deterministic Judge，不是 LLM-as-judge。
- 它已经能拦关键词堆砌和通用空话，但仍依赖文本信号与反模式规则。
- 要继续从 94 往 98，需要扩充跨行业 golden/bad fixtures，并接入真实 UAT 回放，而不是继续只增加规则。

### 13.16 第四阶段落地：85 -> 90 结构化状态

本阶段目标：把 deep-diagnosis 的状态判断从散落正则收束为统一、可机读、可审计的运行时快照。判断仍可使用启发式信号，但启发式必须集中在一个结构层里，对外输出稳定结构。

新增文件：

- `lib/deep-diagnosis/runtime-state.ts`

已接入：

- `lib/deep-diagnosis/decision/state.ts` 不再自行散落判断入口、上下文、进度和工具失败，而是从 `buildDeepDiagnosisRuntimeState` 派生。
- `lib/deep-diagnosis/context-manager.ts` 注入 `formatDeepDiagnosisRuntimeStateForPrompt`，让模型看到当前状态、已完成门禁、阻塞门禁、事实/证据/质量状态和上一轮输出裁判阻塞项。
- `lib/deep-diagnosis/output-validator.ts` 使用同一个 runtime snapshot 读取事实卡与证据视图，避免 validator 和 decision 各自维护一套状态。
- `scripts/evaluate-deep-diagnosis.mjs` 和 `scripts/evaluate-deep-diagnosis-runtime.mjs` 增加 runtime state 结构化覆盖检查。

结构化快照包含：

1. `currentState`：当前流程状态。
2. `entryRoute`：入口路线选择状态。
3. `openContext`：业务类型、用户角色、当前阶段的识别状态和缺失项。
4. `progress`：横向扫描、假设树、证据 coverage、质量 Gate、报告意图、工具失败等进度信号。
5. `factCard`：已确认事实、待确认事实、未覆盖区域和确认状态。
6. `evidenceView`：coverage、来源数量、反例、工具失败和未验证缺口。
7. `reportReadiness`：完整报告就绪判定。
8. `qualityGate`：Report Judge 当前分数、阻塞项和报告级别。
9. `stateGates` / `blockingGates`：可机读门禁审计记录。
10. `previousValidationBlockers`：上一轮输出裁判阻塞项。

设计原则：

- 状态层是工程结构，不是 prompt 文案。
- Decision Policy、Context Manager、Output Validator 必须消费同一份状态快照。
- 后续新增状态优先扩展 `runtime-state.ts`，不要在各模块继续散落正则。
- 启发式判断暂时允许存在，但只能作为快照生成的输入，不能直接外溢成决策来源。

已通过验证：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-runtime.mjs
pnpm lint lib/deep-diagnosis/runtime-state.ts lib/deep-diagnosis/decision/state.ts lib/deep-diagnosis/decision/types.ts lib/deep-diagnosis/context-manager.ts lib/deep-diagnosis/output-validator.ts scripts/evaluate-deep-diagnosis.mjs scripts/evaluate-deep-diagnosis-runtime.mjs
pnpm exec tsc --noEmit
```

### 13.15 第三阶段落地：78 -> 85 硬门禁

本阶段目标：把一部分“模型应该遵守”的规则升级成运行时约束，先解决最影响体验的越权问题。

新增文件：

- `lib/deep-diagnosis/tool-guard.ts`
- `lib/deep-diagnosis/output-validator.ts`
- `scripts/evaluate-deep-diagnosis-runtime.mjs`

已接入：

- `app/api/agent-team/chat/route.ts` 在 deep-diagnosis 请求中先计算 `Decision Policy`。
- 根据 `Decision Policy` 生成 `activeTools`，并通过 `prepareStep` 在每一步持续收窄工具。
- 当策略要求自由文本输入或当前动作不允许选择卡片时，运行时禁用 `askUserChoice`。
- assistant 输出完成后运行 `Output Validator`，检查禁止表达、报告级别越权、待确认事实、未覆盖区域、HTML 发布承诺、外部证据弱引用和质量 Gate。
- 验证结果写入最后一条 assistant message 的 `metadata.deepDiagnosisValidation`，便于后续上下文管理、UI 提示和回归分析消费。

当前能硬拦的内容：

1. `askUserChoice` 工具越权调用。
2. 开放文本追问阶段错误弹选择卡片。
3. 非 choice 动作阶段错误弹选择卡片。

当前能识别并记录的内容：

1. 禁止表达命中，例如“出完整方案”“完整诊断书”。
2. 最高报告级别仍是 `hypothesis_brief` 时却使用完整报告口径。
3. 存在 `hardBlocks` 时仍承诺完整报告。
4. 待确认事实非空时仍承诺完整报告。
5. 未覆盖区域非空时仍包装成业务全局完整方案。
6. `publishHtmlReport` 尚未真实发布时承诺 HTML 链接或二维码。
7. 外部分析口径出现但 Evidence View 仍有未验证缺口。
8. Report Judge 未通过却称为完整报告。

重要边界：

- 工具调用已经是硬约束。
- 文本输出本阶段先做“完成后验证 + metadata 记录 + 下轮可注入修正”，尚未实现流式输出替换。
- 若要真正做到文本级硬拦，需要后续改造为自定义 `createUIMessageStream` 或在 UI 层消费 `deepDiagnosisValidation` 后展示“该回答未通过诊断裁判，已降级为草案”。

已通过验证：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-runtime.mjs
node scripts/evaluate-deep-diagnosis-conversations.mjs
pnpm lint app/api/agent-team/chat/route.ts lib/deep-diagnosis/tool-guard.ts lib/deep-diagnosis/output-validator.ts scripts/evaluate-deep-diagnosis.mjs scripts/evaluate-deep-diagnosis-runtime.mjs
pnpm exec tsc --noEmit
```

### 13.14 第二阶段落地：产品化五块骨架

在 Decision Policy 最小闭环之后，继续补齐 deep-diagnosis 从“强 prompt”走向“真正产品”的五块骨架。目标不是一次性宣称 100 分，而是把后续 UAT 能持续收敛的结构先打进去。

新增文件：

- `lib/deep-diagnosis/fact-card.ts`
- `lib/deep-diagnosis/evidence-view.ts`
- `lib/deep-diagnosis/runtime-quality-gate.ts`
- `scripts/evaluate-deep-diagnosis-conversations.mjs`

已接入：

- `lib/deep-diagnosis/context-manager.ts` 注入事实卡、证据视图、运行时质量 Gate。
- `lib/deep-diagnosis/protocol.ts` 导出新结构化模块。
- `lib/deep-diagnosis/decision/state.ts` 增加中间诊断状态：假设树、证据 coverage、质量 Gate。
- `lib/deep-diagnosis/decision/policy.ts` 增加中间门禁：横向扫描、假设树、外部证据 coverage、质量 Gate。
- `lib/agent-team/agents/prompts/deep-diagnosis.ts` 明确事实卡、证据视图和运行时质量 Gate 是产品化结构层，优先于普通表达。

五块对应关系：

1. **Decision Policy 2.0**
   - 继续覆盖中间诊断门禁，不只拦报告出口。
   - 新增横向扫描、假设树、外部证据 coverage、质量 Gate 的策略判断。

2. **事实卡产品化**
   - `DeepDiagnosisFactCard` 结构化记录已确认事实、待确认事实、未覆盖区域和确认状态。
   - 后续 UI 可直接消费该结构，升级为用户可编辑事实卡。

3. **Report Judge 运行时强制**
   - `DeepDiagnosisRuntimeQualityGate` 基于现有 Report Judge 生成运行时质量上下文。
   - 当 `canCallCompleteReport=false` 或 `enforcedReportLevel=hypothesis_brief` 时，prompt 不得使用完整报告称谓。

4. **Conversation Simulator**
   - 新增 `scripts/evaluate-deep-diagnosis-conversations.mjs`。
   - 当前先检查多轮 bad fixture 的策略拦截期望，后续可升级为真实模型回放。

5. **Evidence / Research 产品化**
   - `DeepDiagnosisEvidenceView` 汇总 coverage、来源数量、反例、工具失败和未验证缺口。
   - 后续 EvidencePanel 可以从文本启发式展示升级为消费结构化证据视图。

已通过验证：

```bash
node scripts/evaluate-deep-diagnosis.mjs
node scripts/evaluate-deep-diagnosis-conversations.mjs
pnpm lint lib/deep-diagnosis/fact-card.ts lib/deep-diagnosis/evidence-view.ts lib/deep-diagnosis/runtime-quality-gate.ts lib/deep-diagnosis/context-manager.ts lib/deep-diagnosis/decision/types.ts lib/deep-diagnosis/decision/state.ts lib/deep-diagnosis/decision/policy.ts lib/deep-diagnosis/protocol.ts lib/agent-team/agents/prompts/deep-diagnosis.ts scripts/evaluate-deep-diagnosis.mjs
pnpm exec tsc --noEmit
```
