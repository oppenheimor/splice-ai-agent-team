---
name: page-creator
description: 创建、修改、检查许愿池中的单页 HTML。
---

# Page Creator

1. 用 `glob` 查找 `/workspace/lab/*.html`；修改任务先用 `read_file` 读取现有文件。
2. 三步以上任务用 `todo` 记录短计划。
3. 把完整页面作为许愿池 HTML artifact 内容流输出，目标为 `lab/index.html`，或继续修改用户当前指定的 `lab/*.html`。不要调用 `write_file`：第一行严格输出 `<!-- wish-creator-html-artifact:v1 path="lab/index.html" -->`，后面紧接完整 HTML，不使用 Markdown 代码块。运行时会在内容流完成后自动落盘。
4. 页面必须是单个自包含 HTML，CSS 和 JavaScript 内联，不请求网络资源。
5. 使用语义化 HTML，提供清晰的 focus 样式，并适配窄屏。
6. artifact 内容流完成后调用 `validate_html`。只有正常返回 `valid: false` 时才重新输出修正后的完整 artifact；工具执行失败时对同一路径原样重试校验，最多两次，禁止重新生成 HTML 或改用 `write_file`。
7. 完成回复只需说明页面已经生成/更新，可以在右侧预览继续体验和提出修改。

不要使用 `bash`、外部 API、远程图片、远程字体、iframe、表单外传或浏览器存储敏感信息。
