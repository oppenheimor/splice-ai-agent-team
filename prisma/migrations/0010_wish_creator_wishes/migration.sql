CREATE TABLE "wish_creator_wishes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agent_conversation_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "usage_scenario" TEXT NOT NULL,
    "current_problem" TEXT NOT NULL,
    "ideal_result" TEXT NOT NULL,
    "constraints" TEXT,
    "capability_gaps" JSONB NOT NULL,
    "analysis_rationale" TEXT NOT NULL,
    "analysis_version" TEXT NOT NULL,
    "contact_click_count" INTEGER NOT NULL DEFAULT 0,
    "last_contact_clicked_at" TIMESTAMP(3),
    "user_removed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wish_creator_wishes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wish_creator_wishes_agent_conversation_id_key"
ON "wish_creator_wishes"("agent_conversation_id");

CREATE UNIQUE INDEX "wish_creator_wishes_conversation_id_key"
ON "wish_creator_wishes"("conversation_id");

CREATE INDEX "wish_creator_wishes_user_id_submitted_at_idx"
ON "wish_creator_wishes"("user_id", "submitted_at");

CREATE INDEX "wish_creator_wishes_user_removed_at_submitted_at_idx"
ON "wish_creator_wishes"("user_removed_at", "submitted_at");

CREATE INDEX "wish_creator_wishes_submitted_at_idx"
ON "wish_creator_wishes"("submitted_at");

ALTER TABLE "wish_creator_wishes"
ADD CONSTRAINT "wish_creator_wishes_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wish_creator_wishes"
ADD CONSTRAINT "wish_creator_wishes_agent_conversation_id_fkey"
FOREIGN KEY ("agent_conversation_id") REFERENCES "agent_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
