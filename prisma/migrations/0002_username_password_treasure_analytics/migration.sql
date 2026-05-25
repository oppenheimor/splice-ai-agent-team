ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT;

UPDATE "users"
SET
  "username" = COALESCE(NULLIF("name", ''), NULLIF("phone", ''), "id"),
  "passwordHash" = 'legacy-disabled'
WHERE "username" IS NULL OR "passwordHash" IS NULL;

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

CREATE TABLE "treasure_analytics_events" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT,
  "visitorId" TEXT,
  "conversationId" TEXT,
  "type" TEXT NOT NULL,
  "pagePath" TEXT NOT NULL,
  "target" TEXT,
  "payload" JSONB,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "treasure_analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "treasure_chat_messages" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT,
  "visitorId" TEXT,
  "conversationId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "text" TEXT,
  "parts" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "treasure_chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "treasure_analytics_events_type_occurredAt_idx" ON "treasure_analytics_events"("type", "occurredAt");
CREATE INDEX "treasure_analytics_events_userId_occurredAt_idx" ON "treasure_analytics_events"("userId", "occurredAt");
CREATE INDEX "treasure_analytics_events_sessionId_occurredAt_idx" ON "treasure_analytics_events"("sessionId", "occurredAt");
CREATE INDEX "treasure_analytics_events_visitorId_occurredAt_idx" ON "treasure_analytics_events"("visitorId", "occurredAt");
CREATE INDEX "treasure_analytics_events_conversationId_occurredAt_idx" ON "treasure_analytics_events"("conversationId", "occurredAt");
CREATE UNIQUE INDEX "treasure_chat_messages_conversationId_messageId_key" ON "treasure_chat_messages"("conversationId", "messageId");
CREATE INDEX "treasure_chat_messages_userId_createdAt_idx" ON "treasure_chat_messages"("userId", "createdAt");
CREATE INDEX "treasure_chat_messages_sessionId_createdAt_idx" ON "treasure_chat_messages"("sessionId", "createdAt");
CREATE INDEX "treasure_chat_messages_visitorId_createdAt_idx" ON "treasure_chat_messages"("visitorId", "createdAt");
CREATE INDEX "treasure_chat_messages_conversationId_createdAt_idx" ON "treasure_chat_messages"("conversationId", "createdAt");

ALTER TABLE "treasure_analytics_events"
  ADD CONSTRAINT "treasure_analytics_events_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "treasure_chat_messages"
  ADD CONSTRAINT "treasure_chat_messages_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
