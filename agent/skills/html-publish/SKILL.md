---
name: html-publish
description: 将许愿池沙盒中的单个 HTML 发布为公网地址。
---

# HTML Publish

1. 用 `glob` 或 `read_file` 确认目标是 `/workspace/lab` 下的 `.html`。
2. 用户未指定目标且存在多个候选时，让用户选择，不要猜测。
3. 发布前调用 `validate_html`；存在错误时先修复。
4. 调用 `publish_html`，传入相对 `/workspace` 的 `lab/*.html` 路径。
5. 用户点击预览区“发布”已经表达发布意图，不要再调用 `ask_question`；`publish_html` 自己会请求一次人工审批。
6. 获批后返回工具给出的 `primaryUrl`。被拒绝或失败时停止，不通过其他工具绕过。

每次发布都会生成新地址。第一期界面只突出最近一次地址，历史发布入口留待后续实现。
