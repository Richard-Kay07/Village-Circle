-- Notifications: entity, template (MVP simple), delivery status
-- Enums
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS');
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- NotificationTemplate: simple per-group or global (groupId null)
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "groupId" TEXT,
    "templateKey" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NotificationTemplate_groupId_templateKey_channel_key" ON "NotificationTemplate"("groupId", "templateKey", "channel");
CREATE INDEX "NotificationTemplate_templateKey_channel_idx" ON "NotificationTemplate"("templateKey", "channel");

-- Notification: queue, status, timestamps, retry
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantGroupId" TEXT NOT NULL,
    "recipientUserId" TEXT,
    "recipientMemberId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "templateKey" TEXT NOT NULL,
    "payload" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "mandatory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_tenantGroupId_status_idx" ON "Notification"("tenantGroupId", "status");
CREATE INDEX "Notification_recipientUserId_createdAt_idx" ON "Notification"("recipientUserId", "createdAt");
CREATE INDEX "Notification_recipientMemberId_createdAt_idx" ON "Notification"("recipientMemberId", "createdAt");
CREATE INDEX "Notification_status_retryCount_idx" ON "Notification"("status", "retryCount");

-- FKs
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantGroupId_fkey" FOREIGN KEY ("tenantGroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientMemberId_fkey" FOREIGN KEY ("recipientMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
