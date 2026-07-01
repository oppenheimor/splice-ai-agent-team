import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const args = parseArgs(process.argv.slice(2));
const agentId = args.agent || "deep-diagnosis";
const limit = Number(args.limit || 50);
const outputPath = resolve(
  args.out || `scripts/fixtures/${agentId}/real-cases/export-${new Date().toISOString().slice(0, 10)}.jsonl`,
);
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/splice_agent_team_missing_database_url?schema=public";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

try {
  const conversations = await prisma.agentConversation.findMany({
    where: { agentId },
    orderBy: { lastMessageAt: "desc" },
    take: limit,
    include: {
      messages: {
        orderBy: [{ messageIndex: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: {
          messageId: true,
          messageIndex: true,
          role: true,
          text: true,
          parts: true,
          metadata: true,
          createdAt: true,
        },
      },
      runs: {
        orderBy: { startedAt: "asc" },
        select: {
          id: true,
          agentVersion: true,
          promptVersion: true,
          model: true,
          status: true,
          inputMessageCount: true,
          outputMessageCount: true,
          latencyMs: true,
          decision: true,
          errorMessage: true,
          startedAt: true,
          finishedAt: true,
        },
      },
    },
  });

  const lines = conversations
    .filter((conversation) => conversation.messages.some((message) => message.role === "user"))
    .map((conversation) =>
      JSON.stringify({
        schemaVersion: 1,
        conversationId: conversation.conversationId,
        agentId: conversation.agentId,
        agentVersion: conversation.agentVersion,
        promptVersion: conversation.promptVersion,
        model: conversation.model,
        title: conversation.title,
        firstUserText: conversation.firstUserText,
        lastMessageAt: conversation.lastMessageAt,
        messages: conversation.messages,
        runs: conversation.runs,
        labels: [],
        notes: "",
      }),
    );

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${lines.join("\n")}${lines.length ? "\n" : ""}`, "utf8");
  console.log(`Exported ${lines.length} ${agentId} conversations to ${outputPath}`);
} catch (error) {
  if (error?.code === "P2021") {
    console.error("Agent evaluation tables are missing. Run `pnpm db:migrate` before exporting eval cases.");
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  await prisma.$disconnect();
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = "true";
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}
