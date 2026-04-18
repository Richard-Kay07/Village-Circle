-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'LEFT');

-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('CONTRIBUTION', 'REVERSAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'DISBURSED', 'REPAYING', 'REPAID', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "LoanRepaymentType" AS ENUM ('REPAYMENT', 'REVERSAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "SocialFundEntryType" AS ENUM ('CONTRIBUTION', 'DISBURSEMENT', 'REVERSAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('TEXT_REFERENCE', 'IMAGE_UPLOAD');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('GROUP', 'MEMBER', 'CONTRIBUTION', 'LOAN', 'LOAN_REPAYMENT', 'SOCIAL_FUND_BUCKET', 'SOCIAL_FUND_ENTRY');

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "groupType" "GroupType" NOT NULL,
    "loanInterestRate" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceFile" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" "ContributionType" NOT NULL DEFAULT 'CONTRIBUTION',
    "idempotencyKey" TEXT,
    "evidenceType" "EvidenceType",
    "evidenceReference" TEXT,
    "evidenceFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByMemberId" TEXT NOT NULL,
    "auditEventId" TEXT,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "principalAmount" DECIMAL(14,2) NOT NULL,
    "interestRate" DECIMAL(10,4) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "disbursedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRepayment" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" "LoanRepaymentType" NOT NULL DEFAULT 'REPAYMENT',
    "idempotencyKey" TEXT,
    "evidenceType" "EvidenceType",
    "evidenceReference" TEXT,
    "evidenceFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByMemberId" TEXT NOT NULL,
    "auditEventId" TEXT,

    CONSTRAINT "LoanRepayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialFundBucket" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialFundBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialFundEntry" (
    "id" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "type" "SocialFundEntryType" NOT NULL DEFAULT 'CONTRIBUTION',
    "idempotencyKey" TEXT,
    "evidenceType" "EvidenceType",
    "evidenceReference" TEXT,
    "evidenceFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByMemberId" TEXT NOT NULL,
    "auditEventId" TEXT,

    CONSTRAINT "SocialFundEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_idempotencyKey_key" ON "Contribution"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Contribution_groupId_createdAt_idx" ON "Contribution"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "Contribution_groupId_idempotencyKey_idx" ON "Contribution"("groupId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "LoanRepayment_idempotencyKey_key" ON "LoanRepayment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "LoanRepayment_loanId_createdAt_idx" ON "LoanRepayment"("loanId", "createdAt");

-- CreateIndex
CREATE INDEX "LoanRepayment_loanId_idempotencyKey_idx" ON "LoanRepayment"("loanId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "SocialFundEntry_bucketId_idempotencyKey_key" ON "SocialFundEntry"("bucketId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "SocialFundEntry_bucketId_createdAt_idx" ON "SocialFundEntry"("bucketId", "createdAt");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceFile" ADD CONSTRAINT "EvidenceFile_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_evidenceFileId_fkey" FOREIGN KEY ("evidenceFileId") REFERENCES "EvidenceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_auditEventId_fkey" FOREIGN KEY ("auditEventId") REFERENCES "AuditEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_evidenceFileId_fkey" FOREIGN KEY ("evidenceFileId") REFERENCES "EvidenceFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_auditEventId_fkey" FOREIGN KEY ("auditEventId") REFERENCES "AuditEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialFundBucket" ADD CONSTRAINT "SocialFundBucket_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialFundEntry" ADD CONSTRAINT "SocialFundEntry_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "SocialFundBucket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialFundEntry" ADD CONSTRAINT "SocialFundEntry_auditEventId_fkey" FOREIGN KEY ("auditEventId") REFERENCES "AuditEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
