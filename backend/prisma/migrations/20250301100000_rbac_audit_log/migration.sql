-- CreateEnum
CREATE TYPE "GroupRole" AS ENUM ('GROUP_CHAIR', 'GROUP_TREASURER', 'GROUP_SECRETARY', 'GROUP_AUDITOR', 'MEMBER');

-- CreateTable (User)
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "platformRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AlterTable Member: add userId, groupRole
ALTER TABLE "Member" ADD COLUMN "userId" TEXT,
ADD COLUMN "groupRole" "GroupRole";

-- AddForeignKey Member -> User
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable AuditSequence
CREATE TABLE "AuditSequence" (
    "id" TEXT NOT NULL,
    "tenantGroupId" TEXT,
    "nextValue" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AuditSequence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuditSequence_tenantGroupId_key" ON "AuditSequence"("tenantGroupId");

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantGroupId" TEXT,
    "actorUserId" TEXT,
    "actingOnBehalfOfUserId" TEXT,
    "channel" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeSnapshot" JSONB,
    "afterSnapshot" JSONB,
    "metadata" JSONB,
    "reasonCode" TEXT,
    "sequenceNo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_tenantGroupId_sequenceNo_idx" ON "AuditLog"("tenantGroupId", "sequenceNo");
