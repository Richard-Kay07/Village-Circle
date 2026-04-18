import { RbacService } from './rbac.service';
import { Permission } from '../domain/enums';
import { ForbiddenError } from '../domain/errors';

describe('RbacService', () => {
  describe('assertSegregation', () => {
    let service: RbacService;
    const mockPrisma = {
      member: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    beforeEach(() => {
      service = new RbacService(mockPrisma as any);
    });

    it('allows when creator and actor differ for dual-control permission', () => {
      expect(() =>
        service.assertSegregation(Permission.LOAN_APPROVE, 'user-a', 'user-b'),
      ).not.toThrow();
    });

    it('throws ForbiddenError when same user creates and approves', () => {
      expect(() =>
        service.assertSegregation(Permission.LOAN_APPROVE, 'user-a', 'user-a'),
      ).toThrow(ForbiddenError);
      try {
        service.assertSegregation(Permission.LOAN_APPROVE, 'user-a', 'user-a');
      } catch (e: any) {
        expect(e.message).toContain('Segregation of duties');
      }
    });

    it('does not throw for non-dual-control permission even when same user', () => {
      expect(() =>
        service.assertSegregation(Permission.CONTRIBUTION_RECORD, 'user-a', 'user-a'),
      ).not.toThrow();
    });
  });
});
