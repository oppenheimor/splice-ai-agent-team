import type { UIMessage } from "ai";

export type AgentToolName =
  | "askUserChoice"
  | "showCards"
  | "showChart"
  | "showComparison"
  | "showChecklist"
  | "showTimeline"
  | "showScorecard"
  | "showGiftList"
  | "showWishCard"
  | "showVideoScript";

export type RendererProfile = "default" | "treasure-hunt";

export type PromptBuilderName = "generic" | "treasureHunt";

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
  rendererProfile: RendererProfile;
  promptBuilder: PromptBuilderName;
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
