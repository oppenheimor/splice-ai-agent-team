import type { AgentManifest } from "./types";

export const AGENTS: AgentManifest[] = [
  {
    id: "requirements-diagnosis",
    name: "需求诊断 Agent",
    route: "/requirements-diagnosis",
    category: "diagnosis",
    description: "通过多轮问卷式对话收集用户信息，完成需求分析与诊断。",
    version: "0.1.0",
    starterPrompts: [
      "我有一个产品想法，帮我判断需求是否成立。",
      "请先问我几个问题，再帮我整理需求。",
      "我想把一个模糊想法变成可执行需求。",
    ],
    tools: ["askUserChoice", "showChecklist", "showScorecard"],
    rendererProfile: "default",
    promptBuilder: "generic",
    memoryPolicy: { mode: "session" },
  },
  {
    id: "treasure-hunt",
    name: "大喜",
    route: "/treasure/hunt",
    category: "surprise",
    description: "把心里的惊喜变成能照着做的寻宝活动方案包。",
    version: "1.0.0",
    starterPrompts: [
      "我想给对象策划一个生日惊喜。",
      "帮我设计一个亲子寻宝游戏。",
      "我想求婚，但不想太俗。",
      "约朋友聚会，别让大家各刷手机。",
    ],
    tools: [
      "askUserChoice",
      "showCards",
      "showComparison",
      "showChecklist",
      "showTimeline",
      "showScorecard",
      "showGiftList",
      "showWishCard",
      "showVideoScript",
    ],
    rendererProfile: "treasure-hunt",
    promptBuilder: "treasureHunt",
    memoryPolicy: { mode: "session" },
  },
];

export function getAgentById(agentId: string | undefined | null): AgentManifest | undefined {
  return AGENTS.find((agent) => agent.id === agentId);
}
