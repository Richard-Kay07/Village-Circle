import { PrismaClient } from '@prisma/client';

export interface TestDataIds {
  groupId: string;
  userIds: { chair: string; treasurer: string; member: string };
  memberIds: { chair: string; treasurer: string; memberA: string; memberB: string };
  meetingId: string;
  ruleVersionId: string;
  socialFundBucketId: string;
  evidenceFileId?: string;
}

export interface TestDataFactoryOptions {
  groupName?: string;
  loanInterestEnabled?: boolean;
  loanInterestRateBps?: number;
  smsNotificationsEnabled?: boolean;
  smsReceiptConfirmationEnabled?: boolean;
}

/**
 * Builds deterministic test data: tenant group, users, members, roles, meeting, rule version, social fund bucket.
 * Call teardown() after test to delete in correct order (FK-safe).
 */
export class TestDataFactory {
  private created: {
    notificationIds: string[];
    ledgerLineIds: string[];
    ledgerEventIds: string[];
    contributionIds: string[];
    loanScheduleItemIds: string[];
    loanRepaymentIds: string[];
    loanIds: string[];
    loanApplicationIds: string[];
    ruleVersionIds: string[];
    roleAssignmentIds: string[];
    meetingId?: string;
    evidenceFileIds: string[];
    memberIds: string[];
    socialFundEntryIds: string[];
    socialFundBucketId?: string;
    groupId?: string;
    userIds: string[];
    auditLogIds: string[];
  } = {
    notificationIds: [],
    ledgerLineIds: [],
    ledgerEventIds: [],
    contributionIds: [],
    loanScheduleItemIds: [],
    loanRepaymentIds: [],
    loanIds: [],
    loanApplicationIds: [],
    ruleVersionIds: [],
    roleAssignmentIds: [],
    evidenceFileIds: [],
    memberIds: [],
    socialFundEntryIds: [],
    userIds: [],
    auditLogIds: [],
  };

  constructor(private readonly prisma: PrismaClient) {}

  async create(options: TestDataFactoryOptions = {}): Promise<TestDataIds> {
    const group = await this.prisma.group.create({
      data: {
        name: options.groupName ?? 'Test Circle',
        currency: 'GBP',
        groupType: 'BANK_TRANSFER',
        status: 'ACTIVE',
      },
    });
    this.created.groupId = group.id;

    const userChair = await this.prisma.user.create({ data: { email: 'chair@test.local' } });
    const userTreasurer = await this.prisma.user.create({ data: { email: 'treasurer@test.local' } });
    const userMember = await this.prisma.user.create({ data: { email: 'member@test.local' } });
    this.created.userIds.push(userChair.id, userTreasurer.id, userMember.id);

    const memberChair = await this.prisma.member.create({
      data: {
        groupId: group.id,
        userId: userChair.id,
        displayName: 'Chair',
        role: 'ADMIN',
        groupRole: 'GROUP_CHAIR',
        status: 'ACTIVE',
      },
    });
    const memberTreasurer = await this.prisma.member.create({
      data: {
        groupId: group.id,
        userId: userTreasurer.id,
        displayName: 'Treasurer',
        role: 'ADMIN',
        groupRole: 'GROUP_TREASURER',
        status: 'ACTIVE',
      },
    });
    const memberA = await this.prisma.member.create({
      data: {
        groupId: group.id,
        userId: userMember.id,
        displayName: 'Member A',
        role: 'MEMBER',
        status: 'ACTIVE',
        phone: '+447700000001',
      },
    });
    const memberB = await this.prisma.member.create({
      data: {
        groupId: group.id,
        displayName: 'Member B',
        role: 'MEMBER',
        status: 'ACTIVE',
        phone: '+447700000002',
      },
    });
    this.created.memberIds.push(memberChair.id, memberTreasurer.id, memberA.id, memberB.id);

    const raChair = await this.prisma.roleAssignment.create({
      data: {
        tenantGroupId: group.id,
        userId: userChair.id,
        role: 'GROUP_CHAIR',
        status: 'ACTIVE',
        createdByUserId: userChair.id,
      },
    });
    const raTreasurer = await this.prisma.roleAssignment.create({
      data: {
        tenantGroupId: group.id,
        userId: userTreasurer.id,
        role: 'GROUP_TREASURER',
        status: 'ACTIVE',
        createdByUserId: userChair.id,
      },
    });
    this.created.roleAssignmentIds.push(raChair.id, raTreasurer.id);

    const meeting = await this.prisma.meeting.create({
      data: {
        groupId: group.id,
        heldAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        name: 'March 2025',
      },
    });
    this.created.meetingId = meeting.id;

    const ruleVersion = await this.prisma.ruleVersion.create({
      data: {
        groupId: group.id,
        effectiveFrom: new Date(),
        loanInterestEnabled: options.loanInterestEnabled ?? false,
        loanInterestRateBps: options.loanInterestRateBps ?? 0,
        loanInterestBasis: 'FLAT',
        penaltyEnabled: false,
        socialFundEnabled: true,
        smsNotificationsEnabled: options.smsNotificationsEnabled ?? false,
        smsReceiptConfirmationEnabled: options.smsReceiptConfirmationEnabled ?? false,
        createdByUserId: userChair.id,
      },
    });
    this.created.ruleVersionIds.push(ruleVersion.id);

    const bucket = await this.prisma.socialFundBucket.create({
      data: { groupId: group.id, name: 'Welfare' },
    });
    this.created.socialFundBucketId = bucket.id;

    const evidence = await this.prisma.evidenceFile.create({
      data: {
        groupId: group.id,
        storedPath: 'test/evidence/sample.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        uploadedBy: memberB.id,
      },
    });
    this.created.evidenceFileIds.push(evidence.id);

    return {
      groupId: group.id,
      userIds: { chair: userChair.id, treasurer: userTreasurer.id, member: userMember.id },
      memberIds: { chair: memberChair.id, treasurer: memberTreasurer.id, memberA: memberA.id, memberB: memberB.id },
      meetingId: meeting.id,
      ruleVersionId: ruleVersion.id,
      socialFundBucketId: bucket.id,
      evidenceFileId: evidence.id,
    };
  }

  async teardown(): Promise<void> {
    const p = this.prisma;
    const contribs = this.created.contributionIds.length
      ? await p.contribution.findMany({ where: { id: { in: this.created.contributionIds } }, select: { ledgerEventId: true } }).catch(() => [])
      : [];
    const ledgerIds = [...new Set(contribs.map((c) => c.ledgerEventId).filter(Boolean) as string[]), ...this.created.ledgerEventIds];

    await p.notification.deleteMany({ where: { id: { in: this.created.notificationIds } } }).catch(() => {});
    await p.ledgerLine.deleteMany({ where: { ledgerEventId: { in: ledgerIds } } }).catch(() => {});
    await p.ledgerEvent.deleteMany({ where: { id: { in: ledgerIds } } }).catch(() => {});
    await p.contribution.deleteMany({ where: { id: { in: this.created.contributionIds } } }).catch(() => {});
    await p.loanScheduleItem.deleteMany({ where: { loanId: { in: this.created.loanIds } } }).catch(() => {});
    await p.loanRepayment.deleteMany({ where: { loanId: { in: this.created.loanIds } } }).catch(() => {});
    await p.loan.deleteMany({ where: { id: { in: this.created.loanIds } } }).catch(() => {});
    await p.loanApplication.deleteMany({ where: { id: { in: this.created.loanApplicationIds } } }).catch(() => {});
    await p.ruleVersion.deleteMany({ where: { id: { in: this.created.ruleVersionIds } } }).catch(() => {});
    await p.roleAssignment.deleteMany({ where: { id: { in: this.created.roleAssignmentIds } } }).catch(() => {});
    if (this.created.meetingId) await p.meeting.delete({ where: { id: this.created.meetingId } }).catch(() => {});
    await p.evidenceFile.deleteMany({ where: { id: { in: this.created.evidenceFileIds } } }).catch(() => {});
    await p.socialFundEntry.deleteMany({ where: { bucketId: this.created.socialFundBucketId! } }).catch(() => {});
    if (this.created.socialFundBucketId) await p.socialFundBucket.delete({ where: { id: this.created.socialFundBucketId } }).catch(() => {});
    await p.member.deleteMany({ where: { id: { in: this.created.memberIds } } }).catch(() => {});
    if (this.created.groupId) await p.group.delete({ where: { id: this.created.groupId } }).catch(() => {});
    await p.user.deleteMany({ where: { id: { in: this.created.userIds } } }).catch(() => {});
    await p.auditLog.deleteMany({ where: { tenantGroupId: this.created.groupId ?? '' } }).catch(() => {});
  }

  trackContribution(id: string): void {
    this.created.contributionIds.push(id);
  }

  trackLedgerEvent(id: string): void {
    this.created.ledgerEventIds.push(id);
  }

  trackLoan(id: string): void {
    this.created.loanIds.push(id);
  }

  trackLoanApplication(id: string): void {
    this.created.loanApplicationIds.push(id);
  }

  trackNotification(id: string): void {
    this.created.notificationIds.push(id);
  }

  trackRuleVersion(id: string): void {
    this.created.ruleVersionIds.push(id);
  }
}
