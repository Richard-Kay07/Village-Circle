-- Tenant receipt confirmation default and member SMS opt-out
ALTER TABLE "RuleVersion" ADD COLUMN IF NOT EXISTS "smsReceiptConfirmationEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "smsOptOut" BOOLEAN NOT NULL DEFAULT false;
