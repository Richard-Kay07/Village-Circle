import { AuditLogService, SupportAccessReasonRequiredError } from './audit-log.service';

describe('AuditLogService', () => {
  describe('logSupportAccess', () => {
    const mockPrisma = {
      auditLog: { create: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([{ nextValue: 1 }]),
    };

    it('throws SupportAccessReasonRequiredError when reasonCode is missing', async () => {
      const service = new AuditLogService(mockPrisma as any);
      await expect(
        service.logSupportAccess({
          supportCaseOrIncidentId: 'case-1',
          reasonCode: '',
          actorUserId: 'u1',
          tenantGroupId: 'g1',
          channel: 'ADMIN_PORTAL' as any,
        }),
      ).rejects.toThrow(SupportAccessReasonRequiredError);
    });

    it('throws when supportCaseOrIncidentId is missing', async () => {
      const service = new AuditLogService(mockPrisma as any);
      await expect(
        service.logSupportAccess({
          supportCaseOrIncidentId: '',
          reasonCode: 'CUSTOMER_REQUEST',
          actorUserId: 'u1',
          tenantGroupId: 'g1',
          channel: 'ADMIN_PORTAL' as any,
        }),
      ).rejects.toThrow(SupportAccessReasonRequiredError);
    });

    it('calls append when reason code and case id provided', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });
      const service = new AuditLogService(mockPrisma as any);
      const id = await service.logSupportAccess({
        supportCaseOrIncidentId: 'case-1',
        reasonCode: 'CUSTOMER_REQUEST',
        actorUserId: 'u1',
        tenantGroupId: 'g1',
        channel: 'ADMIN_PORTAL' as any,
      });
      expect(id).toBe('log-1');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
