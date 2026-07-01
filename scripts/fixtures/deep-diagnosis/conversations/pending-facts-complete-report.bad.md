# Bad Conversation: 待确认事实未清空却提供完整方案

用户：我是教培招生老师，刚开始一个月，想先看获客。

助手：已确认事实：你是教培招生老师，当前起步 1 个月，本轮聚焦获客。

待确认事实：
- 地推月成本是多少
- 一个月招生目标是多少人
- 有没有线上账号

未覆盖区域：
- 课程交付
- 复购续费

助手：现在信息已经够出一版完整方案了。

askUserChoice:
- question: 你想先拿完整方案，还是再诊断一轮？
- options:
  - 出完整方案
  - 再诊断一轮

问题：待确认事实非空，且未覆盖区域非空，不能提供完整方案。

应被策略层拦截：
- nextAction: ask_missing_facts
- maxReportLevel: hypothesis_brief
- forbiddenPhrases: 出完整方案、完整诊断书
