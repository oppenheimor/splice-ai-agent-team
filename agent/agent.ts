import { deepseek } from "@ai-sdk/deepseek";
import { defineAgent } from "eve";

export default defineAgent({
  model: deepseek("deepseek-chat"),
  reasoning: "none",
  limits: {
    // EVE 省略输入限制时会回退到默认额度，必须显式设为 false 才能关闭会话级 token 限制。
    maxInputTokensPerSession: false,
    maxOutputTokensPerSession: false,
  },
  build: {
    // Prisma 与 pg 包含运行时文件和原生边界，交给 Node 在部署产物中解析。
    externalDependencies: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
});
