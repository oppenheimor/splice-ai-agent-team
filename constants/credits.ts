export const CREDIT_RECHARGE_PACKAGE = {
  priceCents: 6900,
  credits: 6900,
} as const;

export const CREDIT_TASK_COSTS = {
  normalChat: 20,
  lightAnalysis: 80,
  deepAnalysis: 200,
  fullReport: 600,
  revision: 120,
  requirementsDiagnosis: 800,
  treasureHuntPlan: 1000,
} as const;

export const CREDIT_EXTRA_COSTS = {
  extraInputTokensBlock: 100,
  extraOutputTokensBlock: 80,
  fileParsing: 100,
  webSearch: 50,
  webPageRead: 30,
  lowCostToolCall: 20,
  highCostToolCall: 100,
  agentToolLoop: 100,
} as const;

export const CREDIT_LIMITS = {
  normalChatInputTokens: 3000,
  lightAnalysisInputTokens: 8000,
  deepAnalysisInputTokens: 20000,
  fullReportInputTokens: 35000,
  extraInputTokenBlockSize: 10000,
  extraOutputTokenBlockSize: 2000,
  maxAdminGrantCredits: 1_000_000,
} as const;

export const CREDIT_ADMIN_USERNAMES_ENV = "CREDIT_ADMIN_USERNAMES";
