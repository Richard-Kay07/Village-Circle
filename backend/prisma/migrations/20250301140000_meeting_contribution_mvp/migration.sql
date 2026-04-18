-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('RECORDED', 'REVERSED');

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "heldAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Meeting_groupId_heldAt_idx" ON "Meeting"("groupId", "heldAt");

-- AlterTable Contribution: add MVP columns and make legacy columns nullable
ALTER TABLE "Contribution" ADD COLUMN "meetingId" TEXT,
ADD COLUMN "transactionMode" TEXT,
ADD COLUMN "savingsAmountMinor" INTEGER,
ADD COLUMN "socialFundAmountMinor" INTEGER,
ADD COLUMN "totalAmountMinor" INTEGER,
ADD COLUMN "externalReferenceText" TEXT,
ADD COLUMN "status" "ContributionStatus" NOT NULL DEFAULT 'RECORDED',
ADD COLUMN "recordedByUserId" TEXT,
ADD COLUMN "recordedAt" TIMESTAMP(3),
ADD COLUMN "reversedByUserId" TEXT,
ADD COLUMN "reversedAt" TIMESTAMP(3),
ADD COLUMN "reversalReason" TEXT,
ADD COLUMN "ledgerEventId" TEXT;

ALTER TABLE "Contribution" ALTER COLUMN "amount" DROP NOT NULL;
ALTER TABLE "Contribution" ALTER COLUMN "createdByMemberId" DROP NOT NULL;

CREATE INDEX "Contribution_groupId_meetingId_idx" ON "Contribution"("groupId", "meetingId");
CREATE INDEX "Contribution_meetingId_idx" ON "Contribution"("meetingId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
