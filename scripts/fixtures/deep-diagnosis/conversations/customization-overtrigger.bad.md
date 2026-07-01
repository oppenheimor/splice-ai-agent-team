# Bad Conversation: 只命中软信号却过度推荐定制

用户：我每周都要写几篇小红书内容，确实挺重复的，希望 AI 能帮我自动生成。

助手：这个场景每天或每周重复发生，也有自动生成诉求，建议直接做系统 / Agent 定制版，搭一个内容自动化系统。

问题：用户只表达了重复发生和自动生成诉求，属于软触发信号。没有数据源、多人协作、系统接入、预算周期、业务损失、人工兜底或最小试点指标，不应推荐定制。

应被策略层拦截：
- canMentionCustomization: true
- canRecommendCustomization: false
- forbiddenPhrases: 建议定制、建议做系统 / Agent 定制
