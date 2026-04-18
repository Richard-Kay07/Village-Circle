-- CreateEnum
CREATE TYPE "LoanInterestBasis" AS ENUM ('FLAT', 'SIMPLE_DECLINING');

-- CreateTable
CREATE TABLE "RuleVersion" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "loanInterestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "loanInterestRateBps" INTEGER NOT NULL DEFAULT 0,
    "loanInterestBasis" "LoanInterestBasis" NOT NULL DEFAULT 'FLAT',
    "penaltyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "penaltyRule" JSONB,
    "socialFundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "RuleVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RuleVersion_groupId_effectiveFrom_effectiveTo_idx" ON "RuleVersion"("groupId", "effectiveFrom", "effectiveTo");

-- AddForeignKey
ALTER TABLE "RuleVersion" ADD CONSTRAINT "RuleVersion_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
