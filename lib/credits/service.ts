import type { UIMessage } from "ai";
import { Prisma } from "@prisma/client";
import {
  CREDIT_ADMIN_USERNAMES_ENV,
  CREDIT_EXTRA_COSTS,
  CREDIT_LIMITS,
  CREDIT_TASK_COSTS,
} from "@/constants/credits";
import type { AuthUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { normalizeUsername } from "@/lib/users/username";

export class InsufficientCreditsError extends Error {
  constructor(
    public readonly requiredCredits: number,
    public readonly currentBalance: number,
  ) {
    super("INSUFFICIENT_CREDITS");
  }
}

export type CreditEstimate = {
  taskType: string;
  estimatedCredits: number;
  inputTokensEstimate: number;
  outputTokensEstimate: number;
  hasDeliverable: boolean;
  breakdown: Array<{
    label: string;
    credits: number;
  }>;
};

export type ChargedCreditUsage = {
  ledgerEntryId: string;
  usageRecordId: string;
  chargedCredits: number;
  balanceAfter: number;
  estimate: CreditEstimate;
};

export async function getCreditDashboard(
  userId: string,
  options: {
    page?: number;
    pageSize?: number;
  } = {},
) {
  const pageSize = normalizePageSize(options.pageSize);
  const page = normalizePage(options.page);
  const account = await getOrCreateCreditAccount(userId);
  const [ledgerEntries, ledgerEntryCount] = await Promise.all([
    prisma.creditLedgerEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.creditLedgerEntry.count({ where: { userId } }),
  ]);

  return {
    account,
    ledgerEntries,
    ledgerPagination: {
      page,
      pageSize,
      total: ledgerEntryCount,
      pageCount: Math.max(1, Math.ceil(ledgerEntryCount / pageSize)),
    },
  };
}

export async function getCreditAdminDashboard(adminUser: AuthUser) {
  assertCreditAdmin(adminUser);

  const [accounts, recentEntries] = await Promise.all([
    prisma.creditAccount.findMany({
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.creditLedgerEntry.findMany({
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return {
    accounts,
    recentEntries,
  };
}

export async function getOrCreateCreditAccount(userId: string) {
  return prisma.creditAccount.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function grantCreditsToUsername(input: {
  targetUsername: string;
  credits: number;
  reason?: string;
  adminUser: AuthUser;
}) {
  assertCreditAdmin(input.adminUser);

  const username = normalizeUsername(input.targetUsername);
  const credits = normalizeGrantCredits(input.credits);
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, name: true },
  });

  if (!targetUser) {
    throw new Error("TARGET_USER_NOT_FOUND");
  }

  const reason = input.reason?.trim() || "后台加积分";

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.creditAccount.upsert({
      where: { userId: targetUser.id },
      create: {
        userId: targetUser.id,
        balance: credits,
        totalGranted: credits,
      },
      update: {
        balance: { increment: credits },
        totalGranted: { increment: credits },
      },
    });

    const ledgerEntry = await tx.creditLedgerEntry.create({
      data: {
        userId: targetUser.id,
        accountId: account.id,
        type: "grant",
        amount: credits,
        balanceAfter: account.balance,
        reason,
        source: "admin",
        metadata: {
          adminUserId: input.adminUser.id,
          adminUsername: input.adminUser.username,
        },
      },
    });

    return { account, ledgerEntry };
  });

  return {
    user: targetUser,
    account: result.account,
    ledgerEntry: result.ledgerEntry,
  };
}

export async function chargeCreditsForAgentRequest(input: {
  userId: string;
  agentId: string;
  conversationId?: string;
  model?: string;
  messages: UIMessage[];
}): Promise<ChargedCreditUsage> {
  const estimate = estimateAgentRequestCredits({
    agentId: input.agentId,
    messages: input.messages,
  });

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.creditAccount.upsert({
      where: { userId: input.userId },
      create: { userId: input.userId },
      update: {},
    });

    const updateResult = await tx.creditAccount.updateMany({
      where: {
        userId: input.userId,
        balance: { gte: estimate.estimatedCredits },
      },
      data: {
        balance: { decrement: estimate.estimatedCredits },
        totalConsumed: { increment: estimate.estimatedCredits },
      },
    });

    if (updateResult.count === 0) {
      throw new InsufficientCreditsError(estimate.estimatedCredits, account.balance);
    }

    const updatedAccount = await tx.creditAccount.findUniqueOrThrow({
      where: { userId: input.userId },
    });

    const ledgerEntry = await tx.creditLedgerEntry.create({
      data: {
        userId: input.userId,
        accountId: updatedAccount.id,
        type: "consume",
        amount: -estimate.estimatedCredits,
        balanceAfter: updatedAccount.balance,
        reason: getTaskTypeLabel(estimate.taskType),
        source: "agent_chat",
        relatedConversationId: input.conversationId,
        metadata: estimate.breakdown as unknown as Prisma.InputJsonValue,
      },
    });

    const usageRecord = await tx.agentUsageRecord.create({
      data: {
        userId: input.userId,
        agentId: input.agentId,
        conversationId: input.conversationId,
        taskType: estimate.taskType,
        estimatedCredits: estimate.estimatedCredits,
        chargedCredits: estimate.estimatedCredits,
        inputTokensEstimate: estimate.inputTokensEstimate,
        outputTokensEstimate: estimate.outputTokensEstimate,
        model: input.model,
        hasDeliverable: estimate.hasDeliverable,
        metadata: {
          breakdown: estimate.breakdown,
        },
      },
    });

    return {
      ledgerEntry,
      usageRecord,
      updatedAccount,
    };
  });

  return {
    ledgerEntryId: result.ledgerEntry.id,
    usageRecordId: result.usageRecord.id,
    chargedCredits: estimate.estimatedCredits,
    balanceAfter: result.updatedAccount.balance,
    estimate,
  };
}

export async function attachRunToCreditCharge(input: {
  usageRecordId: string;
  ledgerEntryId: string;
  agentRunId: string;
}) {
  await prisma.$transaction([
    prisma.agentUsageRecord.update({
      where: { id: input.usageRecordId },
      data: { agentRunId: input.agentRunId },
    }),
    prisma.creditLedgerEntry.update({
      where: { id: input.ledgerEntryId },
      data: { relatedAgentRunId: input.agentRunId },
    }),
  ]);
}

export async function markCreditChargeCompleted(usageRecordId: string) {
  await prisma.agentUsageRecord
    .update({
      where: { id: usageRecordId },
      data: { status: "completed" },
    })
    .catch(() => undefined);
}

export async function refundCreditCharge(input: {
  userId: string;
  ledgerEntryId: string;
  usageRecordId: string;
  reason: string;
}) {
  await prisma.$transaction(async (tx) => {
    const originalEntry = await tx.creditLedgerEntry.findUnique({
      where: { id: input.ledgerEntryId },
    });

    if (!originalEntry || originalEntry.userId !== input.userId || originalEntry.amount >= 0) {
      return;
    }

    const refundCredits = Math.abs(originalEntry.amount);
    const account = await tx.creditAccount.update({
      where: { userId: input.userId },
      data: {
        balance: { increment: refundCredits },
        totalConsumed: { decrement: refundCredits },
      },
    });

    await tx.creditLedgerEntry.create({
      data: {
        userId: input.userId,
        accountId: account.id,
        type: "refund",
        amount: refundCredits,
        balanceAfter: account.balance,
        reason: input.reason,
        source: "agent_chat_failure",
        relatedConversationId: originalEntry.relatedConversationId,
        relatedAgentRunId: originalEntry.relatedAgentRunId,
        metadata: {
          originalLedgerEntryId: originalEntry.id,
          usageRecordId: input.usageRecordId,
        },
      },
    });

    await tx.agentUsageRecord.update({
      where: { id: input.usageRecordId },
      data: {
        status: "refunded",
        chargedCredits: 0,
      },
    });
  });
}

export function estimateAgentRequestCredits(input: {
  agentId: string;
  messages: UIMessage[];
}): CreditEstimate {
  const inputTokensEstimate = estimateInputTokens(input.messages);
  const latestUserText = getLatestUserText(input.messages);
  const userMessageCount = input.messages.filter((message) => message.role === "user").length;
  const hasAssistantMessage = input.messages.some((message) => message.role === "assistant");
  const isFirstUserTurn = userMessageCount <= 1 && !hasAssistantMessage;
  const wantsReport = /报告|方案|计划|清单|生成|发布|HTML/i.test(latestUserText);
  const wantsRequirementsDiagnosisDeliverable =
    input.agentId === "deep-diagnosis"
    && /(完整.*诊断|诊断.*报告|需求诊断.*报告|生成.*诊断|发布.*诊断|诊断.*HTML|HTML.*诊断)/i.test(latestUserText);
  const breakdown: CreditEstimate["breakdown"] = [];
  let taskType = "normal_chat";
  let baseCredits: number = CREDIT_TASK_COSTS.normalChat;
  let includedInputTokens: number = CREDIT_LIMITS.normalChatInputTokens;
  let hasDeliverable = false;

  if (isFirstUserTurn && input.agentId === "treasure-hunt") {
    taskType = "treasure_hunt_plan";
    baseCredits = CREDIT_TASK_COSTS.treasureHuntPlan;
    includedInputTokens = CREDIT_LIMITS.fullReportInputTokens;
    hasDeliverable = true;
  } else if (wantsRequirementsDiagnosisDeliverable) {
    taskType = "requirements_diagnosis";
    baseCredits = CREDIT_TASK_COSTS.requirementsDiagnosis;
    includedInputTokens = CREDIT_LIMITS.fullReportInputTokens;
    hasDeliverable = true;
  } else if (wantsReport) {
    taskType = "full_report";
    baseCredits = CREDIT_TASK_COSTS.fullReport;
    includedInputTokens = CREDIT_LIMITS.fullReportInputTokens;
    hasDeliverable = true;
  } else if (inputTokensEstimate > CREDIT_LIMITS.lightAnalysisInputTokens || latestUserText.length > 600) {
    taskType = "deep_analysis";
    baseCredits = CREDIT_TASK_COSTS.deepAnalysis;
    includedInputTokens = CREDIT_LIMITS.deepAnalysisInputTokens;
  } else if (hasAssistantMessage) {
    taskType = "revision";
    baseCredits = CREDIT_TASK_COSTS.revision;
    includedInputTokens = CREDIT_LIMITS.lightAnalysisInputTokens;
  } else if (latestUserText.length > 120) {
    taskType = "light_analysis";
    baseCredits = CREDIT_TASK_COSTS.lightAnalysis;
    includedInputTokens = CREDIT_LIMITS.lightAnalysisInputTokens;
  }

  breakdown.push({ label: getTaskTypeLabel(taskType), credits: baseCredits });

  const extraInputBlocks = Math.max(
    0,
    Math.ceil((inputTokensEstimate - includedInputTokens) / CREDIT_LIMITS.extraInputTokenBlockSize),
  );
  const extraInputCredits = extraInputBlocks * CREDIT_EXTRA_COSTS.extraInputTokensBlock;

  if (extraInputCredits > 0) {
    breakdown.push({ label: "超长上下文", credits: extraInputCredits });
  }

  const estimatedCredits = breakdown.reduce((total, item) => total + item.credits, 0);

  return {
    taskType,
    estimatedCredits,
    inputTokensEstimate,
    outputTokensEstimate: 0,
    hasDeliverable,
    breakdown,
  };
}

export function assertCreditAdmin(user: AuthUser) {
  const configuredUsernames = (process.env[CREDIT_ADMIN_USERNAMES_ENV] || "")
    .split(",")
    .map((username) => normalizeUsername(username))
    .filter(Boolean);

  if (configuredUsernames.length > 0) {
    if (configuredUsernames.includes(user.username)) return;
    throw new Error("FORBIDDEN");
  }

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  throw new Error("FORBIDDEN");
}

function normalizeGrantCredits(credits: number): number {
  if (!Number.isInteger(credits) || credits <= 0 || credits > CREDIT_LIMITS.maxAdminGrantCredits) {
    throw new Error("INVALID_CREDITS");
  }

  return credits;
}

function normalizePage(page: number | undefined): number {
  if (typeof page !== "number" || !Number.isInteger(page) || page < 1) return 1;
  return page;
}

function normalizePageSize(pageSize: number | undefined): number {
  if (typeof pageSize !== "number" || !Number.isInteger(pageSize) || pageSize < 1) return 20;
  return Math.min(pageSize, 100);
}

function estimateInputTokens(messages: UIMessage[]): number {
  const textLength = messages.reduce((total, message) => total + getMessageText(message).length, 0);
  return Math.ceil(textLength / 1.7);
}

function getLatestUserText(messages: UIMessage[]): string {
  const latestUserMessage = messages.findLast((message) => message.role === "user");
  return latestUserMessage ? getMessageText(latestUserMessage) : "";
}

function getMessageText(message: UIMessage): string {
  return (message.parts || [])
    .map((part) => {
      if (part.type === "text") return part.text || "";
      return "";
    })
    .join("\n");
}

function getTaskTypeLabel(taskType: string): string {
  const labels: Record<string, string> = {
    normal_chat: "普通对话",
    light_analysis: "轻量分析",
    deep_analysis: "深度分析",
    full_report: "完整方案 / 报告",
    revision: "修改细化",
    requirements_diagnosis: "需求诊断 Agent",
    treasure_hunt_plan: "寻宝游戏 Agent",
  };

  return labels[taskType] || "Agent 使用";
}
