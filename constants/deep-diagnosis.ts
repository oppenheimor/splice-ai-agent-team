import { CREDIT_TASK_COSTS } from "./credits";

export const DEEP_DIAGNOSIS_EMPTY_CONVERSATION_PROMPTS = [
  {
    title: "我有一堆问题，想先理清主线",
    description: "适合还没确定入口时，让我帮你判断该全局盘点还是聚焦单点深挖。",
    prompt: "我有多个问题想咨询，请先帮我判断该全局盘点还是聚焦单点深挖。",
  },
  {
    title: "先扫一遍业务流程",
    description: "快速看清哪些环节值得 AI 改造，哪些地方暂时不值得投入。",
    prompt: "先快速横向扫描我的业务流程，判断哪些环节值得 AI 改造、哪些不值得。",
  },
  {
    title: "评估一个 AI 自动化想法",
    description: "把价值、落地难度、数据依赖和隐性风险先摊开，不急着开工。",
    prompt: "我有一个 AI 自动化想法，帮我评估它值不值得做、风险在哪里。",
  },
] as const;

export const DEEP_DIAGNOSIS_PORTABLE_REPORT_CREDIT_COST =
  CREDIT_TASK_COSTS.requirementsDiagnosis;

export const DEEP_DIAGNOSIS_PORTABLE_REPORT_REQUEST =
  "我想生成一份可以分享给别人看的方案链接。请进入「生成链接准备模式」：先判断当前信息能生成哪一级交付物（假设简报 / 本轮专项方案 / 完整诊断报告）。如果信息不足，不要只说不能生成，请只问最关键的 1-2 个补充问题；如果已经足够，请先给出对话内文本版本，并用确认卡片让我选择是否发布为 HTML 链接。发布前必须明确说明当前交付物边界，不要把假设简报包装成完整诊断书。";
