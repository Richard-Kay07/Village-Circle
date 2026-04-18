import { Test, TestingModule } from '@nestjs/testing';
import { SupportAccessReasonRequiredError } from '../audit/audit-log.service';
import { AuditLogService } from '../audit/audit-log.service';
import { SupportController } from './support.controller';
import { SupportReadService } from './support-read.service';
import { EntityTraceService } from './entity-trace.service';

describe('SupportController', () => {
  let controller: SupportController;
  let auditLog: { logSupportAccess: jest.Mock };
  let entityTrace: { getTrace: jest.Mock };

  const supportContext = {
    reasonCode: 'CUSTOMER_REQUEST',
    supportCaseOrIncidentId: 'case-1',
    actorUserId: 'u1',
    tenantGroupId: 'g1',
  };

  beforeEach(async () => {
    auditLog = { logSupportAccess: jest.fn().mockResolvedValue('audit-id') };
    entityTrace = { getTrace: jest.fn().mockResolvedValue({ entityType: 'CONTRIBUTION', entity: { id: 'c1' }, auditEvents: [], ledgerEvents: [], ledgerLines: [], evidenceMetadata: [], notifications: [] }) };
    const supportRead = {
      listAuditLogFiltered: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
      listSmsFailures: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
      listEvidenceAccessHistory: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [
        { provide: AuditLogService, useValue: auditLog },
        { provide: SupportReadService, useValue: supportRead },
        { provide: EntityTraceService, useValue: entityTrace },
      ],
    }).compile();
    controller = module.get(SupportController);
  });

  describe('getContributionTrace', () => {
    it('calls logSupportAccess with TRACE_READ then returns trace', async () => {
      const result = await controller.getContributionTrace('c1', supportContext.reasonCode, supportContext.supportCaseOrIncidentId, supportContext.actorUserId, supportContext.tenantGroupId);
      expect(auditLog.logSupportAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'TRACE_READ',
          metadata: { entityType: 'CONTRIBUTION', entityId: 'c1' },
          ...supportContext,
        }),
      );
      expect(entityTrace.getTrace).toHaveBeenCalledWith('CONTRIBUTION', 'c1', supportContext.tenantGroupId);
      expect(result.entityType).toBe('CONTRIBUTION');
    });

    it('blocks when reason code is missing (SupportAccessReasonRequiredError)', async () => {
      auditLog.logSupportAccess.mockRejectedValue(new SupportAccessReasonRequiredError());
      await expect(
        controller.getContributionTrace('c1', '', supportContext.supportCaseOrIncidentId, supportContext.actorUserId, supportContext.tenantGroupId),
      ).rejects.toThrow(SupportAccessReasonRequiredError);
      expect(entityTrace.getTrace).not.toHaveBeenCalled();
    });
  });

  describe('exportContributionTrace', () => {
    it('calls logSupportAccess with TRACE_EXPORT then returns trace', async () => {
      const result = await controller.exportContributionTrace('c1', supportContext.reasonCode, supportContext.supportCaseOrIncidentId, supportContext.actorUserId, supportContext.tenantGroupId);
      expect(auditLog.logSupportAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'TRACE_EXPORT',
          metadata: { entityType: 'CONTRIBUTION', entityId: 'c1' },
          ...supportContext,
        }),
      );
      expect(entityTrace.getTrace).toHaveBeenCalledWith('CONTRIBUTION', 'c1', supportContext.tenantGroupId);
      expect(result.entityType).toBe('CONTRIBUTION');
    });
  });

  describe('getLoanTrace', () => {
    it('emits audit event TRACE_READ for admin trace read', async () => {
      entityTrace.getTrace.mockResolvedValue({ entityType: 'LOAN', entity: { id: 'loan1' }, scheduleItems: [], repayments: [], auditEvents: [], ledgerEvents: [], ledgerLines: [], evidenceMetadata: [], notifications: [] });
      await controller.getLoanTrace('loan1', supportContext.reasonCode, supportContext.supportCaseOrIncidentId, supportContext.actorUserId, supportContext.tenantGroupId);
      expect(auditLog.logSupportAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'TRACE_READ',
          metadata: { entityType: 'LOAN', entityId: 'loan1' },
        }),
      );
    });
  });
});
