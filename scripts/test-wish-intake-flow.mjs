import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
assert.ok(connectionString, "缺少 DATABASE_URL，无法运行验证。");

const baseUrl = process.env.WISH_TEST_BASE_URL || "http://localhost:3001/agent-team";
const pool = new pg.Pool({ connectionString });
const username = `w${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
const password = "Test_pass_123";
const conversationId = `wish-flow-${randomUUID()}`;
const agentConversationId = `agent-flow-${randomUUID()}`;
const wishId = `wish-flow-${randomUUID()}`;
let userId;

try {
  const body = new FormData();
  body.set("username", username);
  body.set("password", password);
  body.set("confirm_password", password);
  body.set("redirect_url", "/wish-creator/wishes");

  const registration = await fetch(`${baseUrl}/api/auth/password/register`, {
    method: "POST",
    body,
    redirect: "manual",
  });
  assert.ok([302, 303, 307, 308].includes(registration.status));
  const cookie = registration.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "注册后没有取得会话 Cookie。");

  const userResult = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
  userId = userResult.rows[0]?.id;
  assert.ok(userId, "没有找到验证用户。");

  await pool.query(
    `INSERT INTO agent_conversations (
      id, user_id, conversation_id, agent_id, title, status,
      first_user_text, last_message_at, created_at, updated_at
    ) VALUES ($1, $2, $3, 'wish-intake', $4, 'active', $5, NOW(), NOW(), NOW())`,
    [agentConversationId, userId, conversationId, "报销管理", "我想做一个报销管理工具"],
  );

  let html = await readPage("/wish-creator/wishes", cookie);
  assert.match(html, /继续说清楚/);
  assert.match(html, /报销管理/);
  assert.ok(html.includes(`/wish-creator/wish/session/${conversationId}`));

  await pool.query(
    `INSERT INTO wish_creator_wishes (
      id, user_id, agent_conversation_id, conversation_id, title, goal,
      usage_scenario, current_problem, ideal_result, constraints,
      capability_gaps, analysis_rationale, analysis_version,
      submitted_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, NULL,
      $10::jsonb, $11, $12, NOW(), NOW(), NOW()
    )`,
    [
      wishId, userId, agentConversationId, conversationId,
      "团队报销管理", "集中管理报销记录", "小团队共同使用",
      "记录分散", "可以统一查询和统计", JSON.stringify(["backend_data"]),
      "端到端验证", "test-v1",
    ],
  );

  html = await readPage("/wish-creator/wishes", cookie);
  assert.match(html, /查看愿望/);
  assert.match(html, /团队报销管理/);
  assert.doesNotMatch(html, /继续说清楚/);
  assert.ok(html.includes(`/wish-creator/wishes/${wishId}`));

  const removal = await fetch(`${baseUrl}/api/wish-creator/wishes/${wishId}`, {
    method: "DELETE",
    headers: { cookie },
  });
  assert.equal(removal.status, 200);

  html = await readPage("/wish-creator/wishes", cookie);
  assert.doesNotMatch(html, /团队报销管理/);

  const retained = await pool.query(
    `SELECT
      w.user_removed_at IS NOT NULL AS wish_hidden,
      c.id IS NOT NULL AS conversation_retained
    FROM wish_creator_wishes w
    JOIN agent_conversations c ON c.id = w.agent_conversation_id
    WHERE w.id = $1`,
    [wishId],
  );
  assert.deepEqual(retained.rows[0], { wish_hidden: true, conversation_retained: true });
  console.log("愿望保留流程端到端验证通过。");
} finally {
  if (userId) await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  await pool.end();
}

async function readPage(path, cookie) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { cookie } });
  assert.equal(response.status, 200, `${path} 返回 ${response.status}`);
  return response.text();
}
