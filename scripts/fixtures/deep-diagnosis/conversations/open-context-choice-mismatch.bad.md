# Bad Conversation: 开放上下文与选择卡片同轮冲突

用户：我想先全局盘点一下，看看门店哪些环节适合 AI 改造。

助手：好的，先告诉我你的业务类型、你在里面是什么角色、现在大概处于什么阶段。

askUserChoice:
- question: 你目前在门店经营中，最头疼的问题集中在哪个方面？
- mode: multiple
- options:
  - 获客
  - 转化
  - 复购
  - 交付

问题：正文要求用户补充业务类型、角色、当前阶段，但工具卡片只能选择业务环节，用户没有地方填写开放信息。

应被策略层拦截：
- nextAction: ask_open_context
- inputMode: text
- forbiddenPhrases: 请选择、多选 2-5 个、出完整方案
