import { prisma } from "@/lib/db/prisma";

export const DEFAULT_AGENT_EVAL_AGENT_ID = "deep-diagnosis";
export const AGENT_EVAL_PAGE_SIZE = 10;

type AgentEvalDashboardInput = {
  agentId?: string;
  runsPage?: number;
  conversationsPage?: number;
  pageSize?: number;
};

export async function getAgentEvalDashboard(input: AgentEvalDashboardInput = {}) {
  const agentId = input.agentId || DEFAULT_AGENT_EVAL_AGENT_ID;
  const pageSize = input.pageSize || AGENT_EVAL_PAGE_SIZE;
  const runsPage = normalizePage(input.runsPage);
  const conversationsPage = normalizePage(input.conversationsPage);
  const where = { agentId };

  const [
    conversationCount,
    messageCount,
    runCount,
    completedRunCount,
    failedRunCount,
    latencyAggregate,
    recentRuns,
    conversations,
  ] = await Promise.all([
    prisma.agentConversation.count({ where }),
    prisma.agentMessage.count({ where }),
    prisma.agentRun.count({ where }),
    prisma.agentRun.count({ where: { ...where, status: "completed" } }),
    prisma.agentRun.count({ where: { ...where, status: "failed" } }),
    prisma.agentRun.aggregate({
      where: { ...where, latencyMs: { not: null } },
      _avg: { latencyMs: true },
    }),
    prisma.agentRun.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (runsPage - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { username: true, name: true } },
      },
    }),
    prisma.agentConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip: (conversationsPage - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { username: true, name: true } },
        _count: { select: { messages: true, runs: true } },
        runs: {
          orderBy: { startedAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            model: true,
            promptVersion: true,
            inputMessageCount: true,
            outputMessageCount: true,
            latencyMs: true,
            errorMessage: true,
            startedAt: true,
            finishedAt: true,
          },
        },
      },
    }),
  ]);

  const runsTotalPages = getTotalPages(runCount, pageSize);
  const conversationsTotalPages = getTotalPages(conversationCount, pageSize);

  return {
    summary: {
      conversationCount,
      messageCount,
      runCount,
      completedRunCount,
      failedRunCount,
      completionRate: runCount ? Math.round((completedRunCount / runCount) * 100) : 0,
      averageLatencyMs: Math.round(latencyAggregate._avg.latencyMs ?? 0),
    },
    recentRuns: {
      rows: recentRuns,
      page: Math.min(runsPage, runsTotalPages),
      pageSize,
      total: runCount,
      totalPages: runsTotalPages,
    },
    conversations: {
      rows: conversations,
      page: Math.min(conversationsPage, conversationsTotalPages),
      pageSize,
      total: conversationCount,
      totalPages: conversationsTotalPages,
    },
  };
}

export async function getAgentEvalConversationDetail(conversationId: string) {
  return prisma.agentConversation.findUnique({
    where: { conversationId },
    include: {
      user: { select: { username: true, name: true } },
      messages: {
        orderBy: [{ messageIndex: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          messageId: true,
          messageIndex: true,
          role: true,
          text: true,
          parts: true,
          createdAt: true,
          metadata: true,
        },
      },
      runs: {
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          status: true,
          model: true,
          promptVersion: true,
          inputMessageCount: true,
          outputMessageCount: true,
          latencyMs: true,
          errorMessage: true,
          decision: true,
          metadata: true,
          startedAt: true,
          finishedAt: true,
        },
      },
    },
  });
}

function normalizePage(page: number | undefined) {
  if (!page || Number.isNaN(page) || page < 1) return 1;
  return Math.floor(page);
}

function getTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}
