CREATE TABLE "agent_conversations" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "session_id" TEXT,
  "visitor_id" TEXT,
  "conversation_id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "agent_version" TEXT,
  "prompt_version" TEXT,
  "model" TEXT,
  "title" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "first_user_text" TEXT,
  "metadata" JSONB,
  "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "agent_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_messages" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "agent_conversation_id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "message_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "text" TEXT,
  "parts" JSONB,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "agent_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_runs" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "agent_conversation_id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "agent_version" TEXT,
  "prompt_version" TEXT,
  "model" TEXT,
  "status" TEXT NOT NULL DEFAULT 'started',
  "input_message_count" INTEGER NOT NULL DEFAULT 0,
  "output_message_count" INTEGER NOT NULL DEFAULT 0,
  "latency_ms" INTEGER,
  "error_message" TEXT,
  "decision" JSONB,
  "metadata" JSONB,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finished_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "agent_conversations_conversation_id_key" ON "agent_conversations"("conversation_id");
CREATE INDEX "agent_conversations_user_id_last_message_at_idx" ON "agent_conversations"("user_id", "last_message_at");
CREATE INDEX "agent_conversations_agent_id_last_message_at_idx" ON "agent_conversations"("agent_id", "last_message_at");
CREATE INDEX "agent_conversations_session_id_last_message_at_idx" ON "agent_conversations"("session_id", "last_message_at");
CREATE INDEX "agent_conversations_visitor_id_last_message_at_idx" ON "agent_conversations"("visitor_id", "last_message_at");

CREATE UNIQUE INDEX "agent_messages_conversation_id_message_id_key" ON "agent_messages"("conversation_id", "message_id");
CREATE INDEX "agent_messages_user_id_created_at_idx" ON "agent_messages"("user_id", "created_at");
CREATE INDEX "agent_messages_agent_id_created_at_idx" ON "agent_messages"("agent_id", "created_at");
CREATE INDEX "agent_messages_agent_conversation_id_created_at_idx" ON "agent_messages"("agent_conversation_id", "created_at");
CREATE INDEX "agent_messages_conversation_id_created_at_idx" ON "agent_messages"("conversation_id", "created_at");

CREATE INDEX "agent_runs_user_id_started_at_idx" ON "agent_runs"("user_id", "started_at");
CREATE INDEX "agent_runs_agent_id_started_at_idx" ON "agent_runs"("agent_id", "started_at");
CREATE INDEX "agent_runs_conversation_id_started_at_idx" ON "agent_runs"("conversation_id", "started_at");
CREATE INDEX "agent_runs_status_started_at_idx" ON "agent_runs"("status", "started_at");

ALTER TABLE "agent_conversations"
  ADD CONSTRAINT "agent_conversations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_messages"
  ADD CONSTRAINT "agent_messages_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_messages"
  ADD CONSTRAINT "agent_messages_agent_conversation_id_fkey"
  FOREIGN KEY ("agent_conversation_id") REFERENCES "agent_conversations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_runs"
  ADD CONSTRAINT "agent_runs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_runs"
  ADD CONSTRAINT "agent_runs_agent_conversation_id_fkey"
  FOREIGN KEY ("agent_conversation_id") REFERENCES "agent_conversations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
