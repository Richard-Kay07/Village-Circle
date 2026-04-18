import { NotFoundError, ValidationError, DomainRuleError } from '../domain/errors';

export class ContributionNotFoundError extends NotFoundError {
  constructor(contributionId: string) {
    super(`Contribution not found: ${contributionId}`, { contributionId });
  }
}

export class ContributionAlreadyReversedError extends DomainRuleError {
  constructor(contributionId: string) {
    super(`Contribution already reversed: ${contributionId}`, { contributionId });
  }
}

export class EvidenceNotFoundOrWrongGroupError extends ValidationError {
  constructor(evidenceFileId: string, groupId: string) {
    super('Evidence file not found or does not belong to group', {
      evidenceFileId,
      groupId,
    });
  }
}
