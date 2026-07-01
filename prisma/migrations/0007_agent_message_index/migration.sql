ALTER TABLE "agent_messages"
  ADD COLUMN "message_index" INTEGER NOT NULL DEFAULT 0;

WITH ranked_messages AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "conversation_id"
      ORDER BY "created_at" ASC, "id" ASC
    ) - 1 AS "derived_message_index"
  FROM "agent_messages"
)
UPDATE "agent_messages"
SET "message_index" = ranked_messages."derived_message_index"
FROM ranked_messages
WHERE "agent_messages"."id" = ranked_messages."id";

CREATE INDEX "agent_messages_conversation_id_message_index_idx"
  ON "agent_messages"("conversation_id", "message_index");
