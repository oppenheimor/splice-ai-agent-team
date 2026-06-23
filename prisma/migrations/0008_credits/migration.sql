CREATE TABLE "credit_accounts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "total_granted" INTEGER NOT NULL DEFAULT 0,
  "total_consumed" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "credit_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "credit_ledger_entries" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "account_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "balance_after" INTEGER NOT NULL,
  "reason" TEXT,
  "source" TEXT,
  "related_conversation_id" TEXT,
  "related_agent_run_id" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "credit_ledger_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_usage_records" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "conversation_id" TEXT,
  "agent_run_id" TEXT,
  "task_type" TEXT NOT NULL,
  "estimated_credits" INTEGER NOT NULL,
  "charged_credits" INTEGER NOT NULL DEFAULT 0,
  "input_tokens_estimate" INTEGER NOT NULL DEFAULT 0,
  "output_tokens_estimate" INTEGER NOT NULL DEFAULT 0,
  "model" TEXT,
  "tool_call_count" INTEGER NOT NULL DEFAULT 0,
  "web_search_count" INTEGER NOT NULL DEFAULT 0,
  "file_count" INTEGER NOT NULL DEFAULT 0,
  "has_deliverable" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'charged',
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "agent_usage_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "credit_accounts_user_id_key"
  ON "credit_accounts"("user_id");

CREATE INDEX "credit_ledger_entries_user_id_created_at_idx"
  ON "credit_ledger_entries"("user_id", "created_at");

CREATE INDEX "credit_ledger_entries_account_id_created_at_idx"
  ON "credit_ledger_entries"("account_id", "created_at");

CREATE INDEX "credit_ledger_entries_type_created_at_idx"
  ON "credit_ledger_entries"("type", "created_at");

CREATE INDEX "credit_ledger_entries_related_conversation_id_idx"
  ON "credit_ledger_entries"("related_conversation_id");

CREATE INDEX "agent_usage_records_user_id_created_at_idx"
  ON "agent_usage_records"("user_id", "created_at");

CREATE INDEX "agent_usage_records_agent_id_created_at_idx"
  ON "agent_usage_records"("agent_id", "created_at");

CREATE INDEX "agent_usage_records_conversation_id_created_at_idx"
  ON "agent_usage_records"("conversation_id", "created_at");

CREATE INDEX "agent_usage_records_agent_run_id_idx"
  ON "agent_usage_records"("agent_run_id");

CREATE INDEX "agent_usage_records_status_created_at_idx"
  ON "agent_usage_records"("status", "created_at");

ALTER TABLE "credit_accounts"
  ADD CONSTRAINT "credit_accounts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "credit_ledger_entries"
  ADD CONSTRAINT "credit_ledger_entries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "credit_ledger_entries"
  ADD CONSTRAINT "credit_ledger_entries_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "credit_accounts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_usage_records"
  ADD CONSTRAINT "agent_usage_records_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
