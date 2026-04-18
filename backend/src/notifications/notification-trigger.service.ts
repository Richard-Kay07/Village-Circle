import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationChannel } from './notification.types';
import type {
  INotificationTriggerService,
  ContributionReceiptTriggerPayload,
  ApprovalRequiredTriggerPayload,
  ApprovalDecisionTriggerPayload,
  OverdueReminderTriggerOptions,
  MeetingReminderTriggerOptions,
} from './notification-trigger.interface';
import { GroupRole } from '@prisma/client';

const APP_LINK = process.env.APP_LINK ?? 'https://app.villagecircle360.example';

@Injectable()
export class NotificationTriggerService implements INotificationTriggerService {
  private readonly logger = new Logger(NotificationTriggerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Queue contribution receipt confirmation: in-app (on), SMS (tenant-configurable).
   * Do not block or throw; log failures.
   */
  async contributionReceipt(payload: ContributionReceiptTriggerPayload): Promise<void> {
    try {
      const group = await this.prisma.group.findUnique({
        where: { id: payload.tenantGroupId },
        select: { name: true },
      });
      const groupName = group?.name ?? 'Your group';
      const recordType = payload.recordType ?? 'contribution';
      const templatePayload = {
        groupName,
        appLink: APP_LINK,
        recordType,
        contributionId: payload.contributionId,
      };

      const member = await this.prisma.member.findUnique({
        where: { id: payload.memberId },
        select: { userId: true },
      });
      const recipientUserId = member?.userId ?? null;

      if (recipientUserId) {
        await this.notificationService.queue(
          {
            tenantGroupId: payload.tenantGroupId,
            recipientUserId,
            recipientMemberId: payload.memberId,
            channel: NotificationChannel.IN_APP,
            templateKey: 'receipt_confirmation',
            payload: templatePayload,
            mandatory: false,
          },
          { sendImmediately: true },
        );
      }

      await this.notificationService.queue(
        {
          tenantGroupId: payload.tenantGroupId,
          recipientUserId: recipientUserId ?? undefined,
          recipientMemberId: payload.memberId,
          channel: NotificationChannel.SMS,
          templateKey: 'receipt_confirmation',
          payload: templatePayload,
          mandatory: false,
        },
        { sendImmediately: true },
      );
    } catch (err) {
      this.logger.warn(`Contribution receipt notification failed: ${(err as Error)?.message}`, {
        contributionId: payload.contributionId,
        memberId: payload.memberId,
      });
    }
  }

  /**
   * Notify approvers (chair/treasurer) that a loan application needs approval. IN_APP + SMS.
   */
  async approvalRequired(payload: ApprovalRequiredTriggerPayload): Promise<void> {
    try {
      const group = await this.prisma.group.findUnique({
        where: { id: payload.tenantGroupId },
        select: { name: true },
      });
      const groupName = group?.name ?? 'Group';
      const actionSummary = payload.memberDisplayName
        ? `Loan application from ${payload.memberDisplayName}`
        : 'Loan application pending approval';
      const templatePayload = {
        groupName,
        appLink: APP_LINK,
        actionSummary,
        applicationId: payload.applicationId,
      };

      const approverUserIds = await this.getApproverUserIds(payload.tenantGroupId);
      for (const { userId, memberId } of approverUserIds) {
        if (userId) {
          await this.notificationService.queue(
            {
              tenantGroupId: payload.tenantGroupId,
              recipientUserId: userId,
              recipientMemberId: memberId ?? undefined,
              channel: NotificationChannel.IN_APP,
              templateKey: 'approval_required',
              payload: templatePayload,
              mandatory: false,
            },
            { sendImmediately: true },
          );
        }
        if (memberId) {
          await this.notificationService.queue(
            {
              tenantGroupId: payload.tenantGroupId,
              recipientUserId: userId ?? undefined,
              recipientMemberId: memberId,
              channel: NotificationChannel.SMS,
              templateKey: 'approval_required',
              payload: templatePayload,
              mandatory: false,
            },
            { sendImmediately: true },
          );
        }
      }
    } catch (err) {
      this.logger.warn(`Approval required notification failed: ${(err as Error)?.message}`, {
        applicationId: payload.applicationId,
      });
    }
  }

  /**
   * Notify member of approval decision (approved or rejected). IN_APP + optional SMS.
   */
  async approvalDecision(payload: ApprovalDecisionTriggerPayload): Promise<void> {
    try {
      const group = await this.prisma.group.findUnique({
        where: { id: payload.tenantGroupId },
        select: { name: true },
      });
      const groupName = group?.name ?? 'Group';
      const decision = payload.approved ? 'approved' : 'rejected';
      const templatePayload = {
        groupName,
        appLink: APP_LINK,
        decision,
        applicationId: payload.applicationId,
      };

      const member = await this.prisma.member.findUnique({
        where: { id: payload.memberId },
        select: { userId: true },
      });
      const recipientUserId = member?.userId ?? null;

      if (recipientUserId) {
        await this.notificationService.queue(
          {
            tenantGroupId: payload.tenantGroupId,
            recipientUserId,
            recipientMemberId: payload.memberId,
            channel: NotificationChannel.IN_APP,
            templateKey: 'approval_decision',
            payload: templatePayload,
            mandatory: false,
          },
          { sendImmediately: true },
        );
      }

      await this.notificationService.queue(
        {
          tenantGroupId: payload.tenantGroupId,
          recipientUserId: recipientUserId ?? undefined,
          recipientMemberId: payload.memberId,
          channel: NotificationChannel.SMS,
          templateKey: 'approval_decision',
          payload: templatePayload,
          mandatory: false,
        },
        { sendImmediately: true },
      );
    } catch (err) {
      this.logger.warn(`Approval decision notification failed: ${(err as Error)?.message}`, {
        applicationId: payload.applicationId,
        memberId: payload.memberId,
      });
    }
  }

  /**
   * Enqueue overdue repayment reminders. Scheduler or manual. Returns count enqueued.
   */
  async enqueueOverdueReminders(options?: OverdueReminderTriggerOptions): Promise<{ enqueued: number }> {
    let enqueued = 0;
    try {
      const now = new Date();
      const where: { loanId?: string; loan?: { groupId?: string }; dueDate?: { lt: Date }; supersededByRescheduleEventId: null; status: string } = {
        dueDate: { lt: now },
        supersededByRescheduleEventId: null,
        status: 'DUE',
      };
      if (options?.loanId) {
        where.loanId = options.loanId;
      } else if (options?.tenantGroupId) {
        where.loan = { groupId: options.tenantGroupId };
      }

      const items = await this.prisma.loanScheduleItem.findMany({
        where,
        include: {
          loan: {
            select: { id: true, groupId: true, borrowerId: true },
          },
        },
      });

      const seenLoans = new Set<string>();
      for (const item of items) {
        if (item.status !== 'DUE' && item.status !== 'OVERDUE') continue;
        if (seenLoans.has(item.loan.id)) continue;
        seenLoans.add(item.loan.id);

        const group = await this.prisma.group.findUnique({
          where: { id: item.loan.groupId },
          select: { name: true },
        });
        const groupName = group?.name ?? 'Your group';
        const templatePayload = { groupName, appLink: APP_LINK, loanId: item.loan.id };

        const member = await this.prisma.member.findUnique({
          where: { id: item.loan.borrowerId },
          select: { userId: true },
        });
        const recipientUserId = member?.userId ?? null;

        if (recipientUserId) {
          await this.notificationService.queue(
            {
              tenantGroupId: item.loan.groupId,
              recipientUserId,
              recipientMemberId: item.loan.borrowerId,
              channel: NotificationChannel.IN_APP,
              templateKey: 'overdue_repayment_reminder',
              payload: templatePayload,
              mandatory: false,
            },
            { sendImmediately: true },
          );
        }
        await this.notificationService.queue(
          {
            tenantGroupId: item.loan.groupId,
            recipientUserId: recipientUserId ?? undefined,
            recipientMemberId: item.loan.borrowerId,
            channel: NotificationChannel.SMS,
            templateKey: 'overdue_repayment_reminder',
            payload: templatePayload,
            mandatory: false,
          },
          { sendImmediately: true },
        );
        enqueued++;
      }
    } catch (err) {
      this.logger.warn(`Overdue reminder enqueue failed: ${(err as Error)?.message}`, options);
    }
    return { enqueued };
  }

  /**
   * Enqueue meeting reminders. Scheduler (upcoming meetings) or manual (by meetingId).
   */
  async enqueueMeetingReminders(options?: MeetingReminderTriggerOptions): Promise<{ enqueued: number }> {
    let enqueued = 0;
    try {
      let meetings: { id: string; groupId: string; heldAt: Date; name: string | null }[] = [];

      if (options?.meetingId) {
        const m = await this.prisma.meeting.findUnique({
          where: { id: options.meetingId },
        });
        if (m) meetings = [m];
      } else {
        const withinHours = options?.withinHours ?? 24;
        const from = new Date();
        const to = new Date(from.getTime() + withinHours * 60 * 60 * 1000);
        meetings = await this.prisma.meeting.findMany({
          where: {
            heldAt: { gte: from, lte: to },
            ...(options?.tenantGroupId && { groupId: options.tenantGroupId }),
          },
        });
      }

      for (const meeting of meetings) {
        const group = await this.prisma.group.findUnique({
          where: { id: meeting.groupId },
          select: { name: true },
        });
        const groupName = group?.name ?? 'Your group';
        const meetingDate = meeting.heldAt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const templatePayload = { groupName, appLink: APP_LINK, meetingDate, meetingName: meeting.name ?? 'Meeting' };

        const members = await this.prisma.member.findMany({
          where: { groupId: meeting.groupId, status: 'ACTIVE' },
          select: { id: true, userId: true },
        });

        for (const member of members) {
          if (member.userId) {
            await this.notificationService.queue(
              {
                tenantGroupId: meeting.groupId,
                recipientUserId: member.userId,
                recipientMemberId: member.id,
                channel: NotificationChannel.IN_APP,
                templateKey: 'meeting_reminder',
                payload: templatePayload,
                mandatory: false,
              },
              { sendImmediately: true },
            );
          }
          await this.notificationService.queue(
            {
              tenantGroupId: meeting.groupId,
              recipientUserId: member.userId ?? undefined,
              recipientMemberId: member.id,
              channel: NotificationChannel.SMS,
              templateKey: 'meeting_reminder',
              payload: templatePayload,
              mandatory: false,
            },
            { sendImmediately: true },
          );
          enqueued++;
        }
      }
    } catch (err) {
      this.logger.warn(`Meeting reminder enqueue failed: ${(err as Error)?.message}`, options);
    }
    return { enqueued };
  }

  private async getApproverUserIds(tenantGroupId: string): Promise<{ userId: string; memberId: string | null }[]> {
    const assignments = await this.prisma.roleAssignment.findMany({
      where: {
        tenantGroupId,
        status: 'ACTIVE',
        role: { in: [GroupRole.GROUP_CHAIR, GroupRole.GROUP_TREASURER] },
      },
      select: { userId: true },
    });
    const result: { userId: string; memberId: string | null }[] = [];
    for (const a of assignments) {
      const member = await this.prisma.member.findFirst({
        where: { groupId: tenantGroupId, userId: a.userId, status: 'ACTIVE' },
        select: { id: true },
      });
      result.push({ userId: a.userId, memberId: member?.id ?? null });
    }
    return result;
  }
}
