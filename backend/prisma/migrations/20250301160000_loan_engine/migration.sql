-- CreateEnum
CREATE TYPE "LoanApplicationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "LoanState" AS ENUM ('APPROVED', 'DISBURSEMENT_RECORDED', 'ACTIVE', 'COMPLETED', 'RESCHEDULED', 'WRITTEN_OFF');
CREATE TYPE "LoanScheduleItemStatus" AS ENUM ('DUE', 'PART_PAID', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateTable LoanApplication
CREATE TABLE "LoanApplication" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "requestedAmountMinor" INTEGER NOT NULL,
    "requestedTermPeriods" INTEGER NOT NULL,
    "purpose" TEXT,
    "status" "LoanApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedByUserId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanApplication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoanApplication_groupId_status_idx" ON "LoanApplication"("groupId", "status");
CREATE INDEX "LoanApplication_memberId_idx" ON "LoanApplication"("memberId");

-- CreateTable LoanScheduleItem
CREATE TABLE "LoanScheduleItem" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "principalDueMinor" INTEGER NOT NULL,
    "interestDueMinor" INTEGER NOT NULL DEFAULT 0,
    "penaltyDueMinor" INTEGER NOT NULL DEFAULT 0,
    "totalDueMinor" INTEGER NOT NULL,
    "paidPrincipalMinor" INTEGER NOT NULL DEFAULT 0,
    "paidInterestMinor" INTEGER NOT NULL DEFAULT 0,
    "paidPenaltyMinor" INTEGER NOT NULL DEFAULT 0,
    "status" "LoanScheduleItemStatus" NOT NULL DEFAULT 'DUE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanScheduleItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LoanScheduleItem_loanId_installmentNo_key" ON "LoanScheduleItem"("loanId", "installmentNo");
CREATE INDEX "LoanScheduleItem_loanId_idx" ON "LoanScheduleItem"("loanId");

-- AlterTable Loan: add new columns and rename/keep legacy
ALTER TABLE "Loan" ADD COLUMN "applicationId" TEXT,
ADD COLUMN "principalAmountMinor" INTEGER,
ADD COLUMN "currencyCode" TEXT DEFAULT 'GBP',
ADD COLUMN "interestEnabledSnapshot" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "interestRateBpsSnapshot" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "interestBasisSnapshot" TEXT NOT NULL DEFAULT 'FLAT',
ADD COLUMN "ruleVersionIdSnapshot" TEXT,
ADD COLUMN "termPeriods" INTEGER,
ADD COLUMN "approvedByUserId" TEXT,
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "disbursementRecordedAt" TIMESTAMP(3),
ADD COLUMN "state" "LoanState" NOT NULL DEFAULT 'APPROVED';

-- Backfill principalAmountMinor from principalAmount, then make required
UPDATE "Loan" SET "principalAmountMinor" = COALESCE(ROUND(("principalAmount")::numeric * 100), 0), "currencyCode" = 'GBP', "termPeriods" = 1 WHERE "principalAmountMinor" IS NULL;
-- Map old status to state for existing rows (status column exists from init)
UPDATE "Loan" SET "state" = CASE "status"::text
  WHEN 'PENDING' THEN 'APPROVED'::"LoanState"
  WHEN 'DISBURSED' THEN 'ACTIVE'::"LoanState"
  WHEN 'REPAYING' THEN 'ACTIVE'::"LoanState"
  WHEN 'REPAID' THEN 'COMPLETED'::"LoanState"
  WHEN 'DEFAULTED' THEN 'WRITTEN_OFF'::"LoanState"
  ELSE "state"
END;
ALTER TABLE "Loan" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Loan" ALTER COLUMN "principalAmountMinor" SET NOT NULL;
ALTER TABLE "Loan" ALTER COLUMN "currencyCode" SET DEFAULT 'GBP';

-- approvedByUserId/approvedAt/termPeriods: allow null for existing rows
-- Add unique constraint for applicationId
CREATE UNIQUE INDEX "Loan_applicationId_key" ON "Loan"("applicationId");

-- AlterTable LoanRepayment: add new columns
ALTER TABLE "LoanRepayment" ADD COLUMN "groupId" TEXT,
ADD COLUMN "transactionMode" TEXT DEFAULT 'CASH',
ADD COLUMN "amountMinor" INTEGER,
ADD COLUMN "principalMinor" INTEGER,
ADD COLUMN "interestMinor" INTEGER DEFAULT 0,
ADD COLUMN "penaltyMinor" INTEGER DEFAULT 0,
ADD COLUMN "externalReferenceText" TEXT,
ADD COLUMN "recordedByUserId" TEXT,
ADD COLUMN "recordedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "ledgerEventId" TEXT;

-- Backfill groupId from loan, amountMinor from amount
UPDATE "LoanRepayment" r SET "groupId" = l."groupId", "amountMinor" = COALESCE(ROUND((r."amount")::numeric * 100), 0), "principalMinor" = COALESCE(ROUND((r."amount")::numeric * 100), 0), "recordedByUserId" = r."createdByMemberId", "recordedAt" = r."createdAt"
FROM "Loan" l WHERE r."loanId" = l."id" AND r."groupId" IS NULL;
ALTER TABLE "LoanRepayment" ALTER COLUMN "groupId" SET NOT NULL;
ALTER TABLE "LoanRepayment" ALTER COLUMN "transactionMode" SET NOT NULL;
ALTER TABLE "LoanRepayment" ALTER COLUMN "transactionMode" SET DEFAULT 'CASH';
ALTER TABLE "LoanRepayment" ALTER COLUMN "amountMinor" SET NOT NULL;
ALTER TABLE "LoanRepayment" ALTER COLUMN "principalMinor" SET NOT NULL;
ALTER TABLE "LoanRepayment" ALTER COLUMN "recordedByUserId" SET NOT NULL;
ALTER TABLE "LoanRepayment" ALTER COLUMN "recordedAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoanApplication" ADD CONSTRAINT "LoanApplication_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoanScheduleItem" ADD CONSTRAINT "LoanScheduleItem_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
