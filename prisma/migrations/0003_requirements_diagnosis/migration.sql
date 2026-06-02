CREATE TABLE "diagnosis_quiz_results" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "answers" JSONB NOT NULL,
  "dimension_scores" JSONB NOT NULL,
  "operator_code" TEXT NOT NULL,
  "operator_type_name" TEXT NOT NULL,
  "ai_adoption_stage" TEXT NOT NULL,
  "user_type" TEXT NOT NULL,
  "cognitive_width" TEXT NOT NULL,
  "blind_spots" JSONB NOT NULL,
  "just_need" TEXT NOT NULL,
  "crowd_type" TEXT NOT NULL,
  "enhanced_narrative" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "diagnosis_quiz_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "diagnosis_chat_sessions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "quiz_result_id" TEXT NOT NULL,
  "conversation_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "diagnosis_chat_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "diagnosis_quiz_results_user_id_created_at_idx" ON "diagnosis_quiz_results"("user_id", "created_at");
CREATE UNIQUE INDEX "diagnosis_chat_sessions_quiz_result_id_key" ON "diagnosis_chat_sessions"("quiz_result_id");
CREATE UNIQUE INDEX "diagnosis_chat_sessions_conversation_id_key" ON "diagnosis_chat_sessions"("conversation_id");
CREATE INDEX "diagnosis_chat_sessions_user_id_last_message_at_idx" ON "diagnosis_chat_sessions"("user_id", "last_message_at");

ALTER TABLE "diagnosis_quiz_results"
  ADD CONSTRAINT "diagnosis_quiz_results_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "diagnosis_chat_sessions"
  ADD CONSTRAINT "diagnosis_chat_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "diagnosis_chat_sessions"
  ADD CONSTRAINT "diagnosis_chat_sessions_quiz_result_id_fkey"
  FOREIGN KEY ("quiz_result_id") REFERENCES "diagnosis_quiz_results"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
