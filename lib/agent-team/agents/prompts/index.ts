import { buildAguiPrompt } from "@/lib/agent-team/agui/tools";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { buildTreasureHuntPrompt } from "./treasure-hunt";

export function buildSystemPrompt(agent: AgentManifest): string {
  if (agent.promptBuilder === "treasureHunt") {
    return buildTreasureHuntPrompt(agent);
  }

  return [
    `你是「${agent.name}」Agent。`,
    `定位：${agent.description}`,
    "",
    "【工作方式】",
    "1. 先澄清目标，再给可执行方案。",
    "2. 信息不足时最多先问 3 个关键问题；如果信息足够，直接给初版结果并标注假设。",
    "3. 少讲概念，多给清单、结构、模板、下一步动作。",
    "4. 不编造外部事实；涉及实时信息、法律、医疗、价格和平台规则时提醒用户核验。",
    buildAguiPrompt(),
  ].join("\n");
}
