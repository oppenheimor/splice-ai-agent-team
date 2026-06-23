import { readFileSync } from "node:fs";

const conversationsSource = readFileSync(
  new URL("../lib/agent-team/conversations/database-conversations.ts", import.meta.url),
  "utf8",
);
const conversationRouteSource = readFileSync(
  new URL("../app/api/agent-team/conversations/[conversationId]/route.ts", import.meta.url),
  "utf8",
);
const dashboardSource = readFileSync(
  new URL("../lib/agent-team/evaluation/dashboard.ts", import.meta.url),
  "utf8",
);

const softDeleteBlock = extractFunctionBlock(conversationsSource, "softDeleteAgentConversation");
const userListBlock = extractFunctionBlock(conversationsSource, "listAgentConversationSummaries");
const userDetailBlock = extractFunctionBlock(conversationsSource, "getAgentConversationDetail");
const userRenameBlock = extractFunctionBlock(conversationsSource, "updateAgentConversationTitle");
const dashboardBlock = extractFunctionBlock(dashboardSource, "getAgentEvalDashboard");
const dashboardDetailBlock = extractFunctionBlock(dashboardSource, "getAgentEvalConversationDetail");

const checks = [
  {
    name: "用户 DELETE 路由调用软删除语义",
    passed: conversationRouteSource.includes("softDeleteAgentConversation")
      && !conversationRouteSource.includes("deleteAgentConversation"),
    missing: ["softDeleteAgentConversation"],
  },
  {
    name: "用户侧删除只标记 deleted",
    passed: conversationsSource.includes("softDeleteAgentConversation")
      && conversationsSource.includes("status: \"deleted\"")
      && conversationsSource.includes("agentConversation.update"),
    missing: ["status: \"deleted\"", "agentConversation.update"],
  },
  {
    name: "软删除不清除 eval 留存数据",
    passed: lacksAll(conversationsSource, [
      "agentRun.deleteMany",
      "agentMessage.deleteMany",
      "agentConversation.delete",
      "treasureChatMessage.deleteMany",
    ]),
    missing: ["软删除函数不能包含 delete/deleteMany"],
  },
  {
    name: "用户侧读取只展示 active 会话",
    passed: [userListBlock, userDetailBlock, userRenameBlock].every((block) => block
      && block.includes("where:")
      && block.includes("status: \"active\""),
    ),
    missing: ["用户列表/详情/改名必须过滤 active"],
  },
  {
    name: "admin/agent-evals 保留 deleted 会话",
    passed: dashboardBlock.includes("const where = { agentId }")
      && lacksAll(dashboardBlock, ["status: \"active\"", "status: \"deleted\""])
      && lacksAll(dashboardDetailBlock, ["status: \"active\"", "status: \"deleted\""]),
    missing: ["后台 eval 查询不能按 status 过滤"],
  },
];

for (const check of checks) {
  if (check.passed) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ ${check.name}：缺少 ${check.missing.join("、")}`);
  }
}

if (checks.some((check) => !check.passed)) {
  process.exitCode = 1;
}

function lacksAll(source, forbidden) {
  return forbidden.every((item) => !source.includes(item));
}

function extractFunctionBlock(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start === -1) return "";

  let bodyStart = -1;
  let parenthesesDepth = 0;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (character === "(") parenthesesDepth += 1;
    if (character === ")") parenthesesDepth -= 1;
    if (character === "{" && parenthesesDepth === 0) {
      bodyStart = index;
      break;
    }
  }

  if (bodyStart === -1) return "";

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  return source.slice(start);
}
