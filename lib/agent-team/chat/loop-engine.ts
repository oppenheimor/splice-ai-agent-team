import { stepCountIs } from "ai";

export type AgentLoopConfig = {
  maxTurns: number;
  contextManagement: boolean;
  reportQualityGate: boolean;
};

const DEFAULT_LOOP_CONFIG: AgentLoopConfig = {
  maxTurns: 4,
  contextManagement: false,
  reportQualityGate: false,
};

const DEEP_DIAGNOSIS_LOOP_CONFIG: AgentLoopConfig = {
  maxTurns: 10,
  contextManagement: true,
  reportQualityGate: true,
};

export function resolveAgentLoopConfig(agentId: string | undefined): AgentLoopConfig {
  if (agentId === "deep-diagnosis") {
    return DEEP_DIAGNOSIS_LOOP_CONFIG;
  }

  return DEFAULT_LOOP_CONFIG;
}

export function buildAgentStopCondition(agentId: string | undefined) {
  return stepCountIs(resolveAgentLoopConfig(agentId).maxTurns);
}
