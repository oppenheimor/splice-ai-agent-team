CREATE TABLE "verification_codes" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "ip_address" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "consumed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "verification_codes_phone_created_at_idx" ON "verification_codes"("phone", "created_at");
CREATE INDEX "verification_codes_ip_address_created_at_idx" ON "verification_codes"("ip_address", "created_at");
CREATE INDEX "verification_codes_expires_at_idx" ON "verification_codes"("expires_at");

CREATE TABLE "sms_send_logs" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sms_send_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sms_send_logs_phone_created_at_idx" ON "sms_send_logs"("phone", "created_at");
CREATE INDEX "sms_send_logs_ip_address_created_at_idx" ON "sms_send_logs"("ip_address", "created_at");
