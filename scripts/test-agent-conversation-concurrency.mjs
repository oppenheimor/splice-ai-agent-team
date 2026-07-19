import assert from "node:assert/strict";
import { fork } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { fileURLToPath, pathToFileURL } from "node:url";
import { register } from "node:module";

const projectRootUrl = pathToFileURL(`${process.cwd()}/`).href;

// Node 原生运行 TypeScript 时不解析 tsconfig 路径别名；这里只补齐测试需要的数据库别名。
register(
  `data:text/javascript,${encodeURIComponent(`
    export async function resolve(specifier, context, nextResolve) {
      if (specifier === "@/lib/db/prisma") {
        return { url: new URL("lib/db/prisma.ts", ${JSON.stringify(projectRootUrl)}).href, shortCircuit: true };
      }

      return nextResolve(specifier, context);
    }
  `)}`,
  import.meta.url,
);

const [{ createAgentConversation }, { prisma }] = await Promise.all([
  import("../lib/agent-team/conversations/database-conversations.ts"),
  import("../lib/db/prisma.ts"),
]);

async function runWorker() {
  const userId = process.env.CONVERSATION_TEST_USER_ID;
  const conversationId = process.env.CONVERSATION_TEST_ID;
  assert.ok(userId && conversationId, "并发测试子进程缺少会话参数");

  process.send?.({ type: "ready" });
  await once(process, "message");

  try {
    await createAgentConversation({
      userId,
      agentId: "wish-intake",
      conversationId,
      title: "跨进程并发创建测试",
    });
    process.send?.({ type: "result", ok: true });
  } catch (error) {
    process.send?.({ type: "result", ok: false, error: String(error) });
  } finally {
    await prisma.$disconnect();
  }
}

function spawnConversationWorker(userId, conversationId) {
  const child = fork(fileURLToPath(import.meta.url), ["--worker"], {
    env: {
      ...process.env,
      CONVERSATION_TEST_USER_ID: userId,
      CONVERSATION_TEST_ID: conversationId,
    },
    silent: true,
  });
  let stderr = "";
  child.stderr?.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const ready = new Promise((resolve, reject) => {
    child.on("message", (message) => {
      if (message?.type === "ready") resolve();
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code !== 0) reject(new Error(`并发测试子进程提前退出 (${code})：${stderr}`));
    });
  });
  const result = new Promise((resolve, reject) => {
    child.on("message", (message) => {
      if (message?.type === "result") resolve(message);
    });
    child.once("error", reject);
  });

  return { child, ready, result };
}

async function runParent() {
  const user = await prisma.user.findFirst({ select: { id: true } });
  assert.ok(user, "本地数据库至少需要一个用户才能运行并发测试");

  const conversationId = `test-conversation-race-${randomUUID()}`;

  try {
    const workers = Array.from(
      { length: 12 },
      () => spawnConversationWorker(user.id, conversationId),
    );
    await Promise.all(workers.map((worker) => worker.ready));

    const results = workers.map((worker) => worker.result);
    workers.forEach((worker) => worker.child.send({ type: "start" }));
    const settledResults = await Promise.all(results);
    const failures = settledResults.filter((result) => !result.ok);

    assert.equal(
      failures.length,
      0,
      `独立 Prisma 进程并发创建出现 ${failures.length} 次失败：${failures
        .map((result) => result.error)
        .join(" | ")}`,
    );

    await assert.rejects(
      createAgentConversation({
        userId: user.id,
        agentId: "other-agent",
        conversationId,
        title: "不应覆盖原标题",
      }),
      /会话已存在或无权访问/,
    );

    const persistedConversation = await prisma.agentConversation.findUniqueOrThrow({
      where: { conversationId },
      select: { agentId: true, title: true },
    });
    assert.deepEqual(persistedConversation, {
      agentId: "wish-intake",
      title: "跨进程并发创建测试",
    });
  } finally {
    await prisma.agentConversation.deleteMany({ where: { conversationId } });
    await prisma.$disconnect();
  }
}

if (process.argv.includes("--worker")) {
  await runWorker();
} else {
  await runParent();
}
