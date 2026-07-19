import type { UIMessage } from "ai";

export type AgentToolName =
  | "askUserChoice"
  | "showCards"
  | "showChart"
  | "showComparison"
  | "showChecklist"
  | "showTimeline"
  | "showScorecard"
  | "showDataTable"
  | "showFramework"
  | "showGiftList"
  | "showWishCard"
  | "showVideoScript";

export type RendererProfile = "default" | "treasure-hunt";

export type PromptBuilderName =
  | "generic"
  | "deepDiagnosis"
  | "treasureHunt"
  | "wishIntake"
  | "requirementsDiagnosis";

/** 外部能力工具名称（区别于 AGUI 交互工具） */
export type ExternalToolName =
  | "webSearch"
  | "publishHtmlReport"; // 未来可扩展：industryReport, competitorAnalysis 等

export type MemoryPolicy = {
  mode: "session" | "none";
};

export type EvalCase = {
  id: string;
  input: string;
  expectedSignals: string[];
};

export type AgentManifest = {
  id: string;
  name: string;
  route: string;
  category: string;
  description: string;
  version: string;
  starterPrompts: string[];
  tools: AgentToolName[];
  /** 外部能力工具（webSearch 等），由后端注册到 AI SDK tool 集合 */
  externalTools?: ExternalToolName[];
  rendererProfile: RendererProfile;
  promptBuilder: PromptBuilderName;
  billingPolicy?: "metered" | "free";
  memoryPolicy?: MemoryPolicy;
  evalCases?: EvalCase[];
};

export type AgentConversation = {
  id: string;
  agentId: string;
  title: string;
  messages: UIMessage[];
  createdAt: string;
  updatedAt: string;
  agentVersion?: string;
  metadata?: Record<string, unknown>;
};

export type ConversationStore = {
  conversations: AgentConversation[];
};
