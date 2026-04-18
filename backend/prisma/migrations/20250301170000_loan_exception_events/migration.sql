-- Loan exception events: waiver, reschedule, write-off (explicit event records; reason + approver required).
-- Create LoanRescheduleEvent first so LoanScheduleItem can reference it.

-- CreateTable LoanRescheduleEvent
CREATE TABLE "LoanRescheduleEvent" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedByUserId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousTermPeriods" INTEGER,
    "newTermPeriods" INTEGER,
    "firstDueDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanRescheduleEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoanRescheduleEvent_loanId_idx" ON "LoanRescheduleEvent"("loanId");
CREATE INDEX "LoanRescheduleEvent_groupId_idx" ON "LoanRescheduleEvent"("groupId");

-- AlterTable LoanScheduleItem: add supersededByRescheduleEventId
ALTER TABLE "LoanScheduleItem" ADD COLUMN "supersededByRescheduleEventId" TEXT;
CREATE INDEX "LoanScheduleItem_supersededByRescheduleEventId_idx" ON "LoanScheduleItem"("supersededByRescheduleEventId");

-- CreateTable LoanWaiverEvent
CREATE TABLE "LoanWaiverEvent" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedByUserId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleItemId" TEXT,
    "amountMinorWaived" INTEGER NOT NULL DEFAULT 0,
    "waiverType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanWaiverEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoanWaiverEvent_loanId_idx" ON "LoanWaiverEvent"("loanId");
CREATE INDEX "LoanWaiverEvent_groupId_idx" ON "LoanWaiverEvent"("groupId");

-- CreateTable LoanWriteOffEvent
CREATE TABLE "LoanWriteOffEvent" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedByUserId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountMinorWrittenOff" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanWriteOffEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LoanWriteOffEvent_loanId_idx" ON "LoanWriteOffEvent"("loanId");
CREATE INDEX "LoanWriteOffEvent_groupId_idx" ON "LoanWriteOffEvent"("groupId");

-- AddForeignKey
ALTER TABLE "LoanRescheduleEvent" ADD CONSTRAINT "LoanRescheduleEvent_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoanRescheduleEvent" ADD CONSTRAINT "LoanRescheduleEvent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoanScheduleItem" ADD CONSTRAINT "LoanScheduleItem_supersededByRescheduleEventId_fkey" FOREIGN KEY ("supersededByRescheduleEventId") REFERENCES "LoanRescheduleEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LoanWaiverEvent" ADD CONSTRAINT "LoanWaiverEvent_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoanWaiverEvent" ADD CONSTRAINT "LoanWaiverEvent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoanWriteOffEvent" ADD CONSTRAINT "LoanWriteOffEvent_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoanWriteOffEvent" ADD CONSTRAINT "LoanWriteOffEvent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
