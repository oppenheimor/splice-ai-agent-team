-- CreateTable
CREATE TABLE "wish_creator_publications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agent_conversation_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "artifact_path" TEXT NOT NULL,
    "publish_path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "verification" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wish_creator_publications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wish_creator_publications_user_id_created_at_idx"
ON "wish_creator_publications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "wish_creator_publications_conversation_id_created_at_idx"
ON "wish_creator_publications"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "wish_creator_publications_agent_conversation_id_created_at_idx"
ON "wish_creator_publications"("agent_conversation_id", "created_at");

-- AddForeignKey
ALTER TABLE "wish_creator_publications"
ADD CONSTRAINT "wish_creator_publications_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_creator_publications"
ADD CONSTRAINT "wish_creator_publications_agent_conversation_id_fkey"
FOREIGN KEY ("agent_conversation_id") REFERENCES "agent_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
