import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationTriggerService } from './notification-trigger.service';

describe('NotificationTriggerService', () => {
  let service: NotificationTriggerService;
  let notificationService: { queue: jest.Mock };
  let prisma: {
    group: { findUnique: jest.Mock };
    member: { findUnique: jest.Mock };
    roleAssignment: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    notificationService = { queue: jest.fn().mockResolvedValue({ id: 'n1', status: 'SENT' }) };
    prisma = {
      group: { findUnique: jest.fn().mockResolvedValue({ name: 'Test Group' }) },
      member: { findUnique: jest.fn().mockResolvedValue({ userId: 'u1' }), findFirst: jest.fn().mockResolvedValue({ id: 'm1' }) },
      roleAssignment: { findMany: jest.fn().mockResolvedValue([{ userId: 'chair-1' }, { userId: 'treasurer-1' }]) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTriggerService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();
    service = module.get(NotificationTriggerService);
  });

  describe('contributionReceipt', () => {
    it('queues in-app and SMS notification without throwing', async () => {
      await service.contributionReceipt({
        tenantGroupId: 'g1',
        memberId: 'm1',
        contributionId: 'c1',
        recordType: 'contribution',
      });
      expect(notificationService.queue).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantGroupId: 'g1',
          recipientMemberId: 'm1',
          channel: 'IN_APP',
          templateKey: 'receipt_confirmation',
          payload: expect.objectContaining({ groupName: 'Test Group', recordType: 'contribution' }),
        }),
        expect.any(Object),
      );
      expect(notificationService.queue).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'SMS',
          templateKey: 'receipt_confirmation',
        }),
        expect.any(Object),
      );
    });

    it('does not throw when queue throws (logs and swallows)', async () => {
      notificationService.queue.mockRejectedValueOnce(new Error('Provider down'));
      await expect(
        service.contributionReceipt({ tenantGroupId: 'g1', memberId: 'm1', contributionId: 'c1' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('approvalRequired', () => {
    it('queues notifications for approvers', async () => {
      prisma.roleAssignment.findMany.mockResolvedValue([{ userId: 'u-chair' }]);
      prisma.member.findFirst = jest.fn().mockResolvedValue({ id: 'm-chair' });
      await service.approvalRequired({
        tenantGroupId: 'g1',
        applicationId: 'app-1',
        memberDisplayName: 'Alice',
      });
      expect(notificationService.queue).toHaveBeenCalledWith(
        expect.objectContaining({
          templateKey: 'approval_required',
          payload: expect.objectContaining({ actionSummary: expect.stringContaining('Alice') }),
        }),
        expect.any(Object),
      );
    });
  });
});
