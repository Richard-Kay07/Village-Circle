-- CreateEnum
CREATE TYPE "LedgerFundBucket" AS ENUM ('SAVINGS', 'SOCIAL_FUND', 'LOAN_PRINCIPAL', 'LOAN_INTEREST', 'PENALTY', 'WAIVER_ADJUSTMENT');

-- CreateTable LedgerEvent
CREATE TABLE "LedgerEvent" (
    "id" TEXT NOT NULL,
    "tenantGroupId" TEXT NOT NULL,
    "sourceEventType" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "transactionMode" TEXT,
    "eventTimestamp" TIMESTAMP(3) NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "reversalOfLedgerEventId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LedgerEvent_idempotencyKey_key" ON "LedgerEvent"("idempotencyKey");
CREATE INDEX "LedgerEvent_tenantGroupId_eventTimestamp_idx" ON "LedgerEvent"("tenantGroupId", "eventTimestamp");
CREATE INDEX "LedgerEvent_tenantGroupId_sourceEventType_sourceEventId_idx" ON "LedgerEvent"("tenantGroupId", "sourceEventType", "sourceEventId");

-- CreateTable LedgerLine
CREATE TABLE "LedgerLine" (
    "id" TEXT NOT NULL,
    "ledgerEventId" TEXT NOT NULL,
    "tenantGroupId" TEXT NOT NULL,
    "memberId" TEXT,
    "fundBucket" "LedgerFundBucket" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'GBP',
    "runningBalanceSnapshot" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerLine_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LedgerLine_tenantGroupId_memberId_fundBucket_idx" ON "LedgerLine"("tenantGroupId", "memberId", "fundBucket");
CREATE INDEX "LedgerLine_ledgerEventId_idx" ON "LedgerLine"("ledgerEventId");

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_tenantGroupId_fkey" FOREIGN KEY ("tenantGroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_reversalOfLedgerEventId_fkey" FOREIGN KEY ("reversalOfLedgerEventId") REFERENCES "LedgerEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LedgerLine" ADD CONSTRAINT "LedgerLine_ledgerEventId_fkey" FOREIGN KEY ("ledgerEventId") REFERENCES "LedgerEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerLine" ADD CONSTRAINT "LedgerLine_tenantGroupId_fkey" FOREIGN KEY ("tenantGroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerLine" ADD CONSTRAINT "LedgerLine_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
