CREATE TABLE "diagnosis_chat_messages" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "chat_session_id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "message_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "text" TEXT,
  "parts" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "diagnosis_chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "diagnosis_chat_messages_conversation_id_message_id_key" ON "diagnosis_chat_messages"("conversation_id", "message_id");
CREATE INDEX "diagnosis_chat_messages_user_id_created_at_idx" ON "diagnosis_chat_messages"("user_id", "created_at");
CREATE INDEX "diagnosis_chat_messages_chat_session_id_created_at_idx" ON "diagnosis_chat_messages"("chat_session_id", "created_at");
CREATE INDEX "diagnosis_chat_messages_conversation_id_created_at_idx" ON "diagnosis_chat_messages"("conversation_id", "created_at");

ALTER TABLE "diagnosis_chat_messages"
  ADD CONSTRAINT "diagnosis_chat_messages_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "diagnosis_chat_messages"
  ADD CONSTRAINT "diagnosis_chat_messages_chat_session_id_fkey"
  FOREIGN KEY ("chat_session_id") REFERENCES "diagnosis_chat_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
