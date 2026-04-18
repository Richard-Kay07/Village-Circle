-- CreateEnum
CREATE TYPE "RoleAssignmentStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "RoleAssignment" (
    "id" TEXT NOT NULL,
    "tenantGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupRole" NOT NULL,
    "status" "RoleAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedByUserId" TEXT,

    CONSTRAINT "RoleAssignment_pkey" PRIMARY KEY ("id")
);

-- Partial unique index: at most one ACTIVE assignment per (tenantGroupId, userId, role)
CREATE UNIQUE INDEX "RoleAssignment_tenantGroupId_userId_role_active_key"
ON "RoleAssignment"("tenantGroupId", "userId", "role")
WHERE "status" = 'ACTIVE';

CREATE INDEX "RoleAssignment_tenantGroupId_userId_role_status_idx" ON "RoleAssignment"("tenantGroupId", "userId", "role", "status");
CREATE INDEX "RoleAssignment_tenantGroupId_status_idx" ON "RoleAssignment"("tenantGroupId", "status");
CREATE INDEX "RoleAssignment_userId_tenantGroupId_idx" ON "RoleAssignment"("userId", "tenantGroupId");

-- AddForeignKey
ALTER TABLE "RoleAssignment" ADD CONSTRAINT "RoleAssignment_tenantGroupId_fkey" FOREIGN KEY ("tenantGroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
