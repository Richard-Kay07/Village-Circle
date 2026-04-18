const members = {
  all: ['members'] as const,
  list: (tenantGroupId: string) => [...members.all, tenantGroupId] as const,
  detail: (tenantGroupId: string, memberId: string) => [...members.all, tenantGroupId, memberId] as const,
};
const meetings = {
  all: ['meetings'] as const,
  list: (tenantGroupId: string) => [...meetings.all, tenantGroupId] as const,
  detail: (tenantGroupId: string, meetingId: string) => [...meetings.all, tenantGroupId, meetingId] as const,
};
const contributions = {
  all: ['contributions'] as const,
  list: (tenantGroupId: string) => [...contributions.all, tenantGroupId] as const,
  listWithFilters: (tenantGroupId: string, filters: Record<string, unknown>) => [...contributions.all, 'group', tenantGroupId, 'history', filters] as const,
  byGroup: (groupId: string) => [...contributions.all, 'group', groupId] as const,
  byMeeting: (tenantGroupId: string, meetingId: string) => [...contributions.all, tenantGroupId, meetingId] as const,
  byMember: (tenantGroupId: string, memberId: string) => [...contributions.all, tenantGroupId, 'member', memberId] as const,
  detail: (contributionId: string) => [...contributions.all, contributionId] as const,
};
const loans = {
  all: ['loans'] as const,
  list: (tenantGroupId: string) => [...loans.all, tenantGroupId] as const,
  applications: (tenantGroupId: string, status?: string) => [...loans.all, tenantGroupId, 'applications', status ?? ''] as const,
  applicationDetail: (applicationId: string) => [...loans.all, 'application', applicationId] as const,
  detail: (loanId: string) => [...loans.all, loanId] as const,
  repayments: (loanId: string) => [...loans.all, loanId, 'repayments'] as const,
};
const notifications = {
  all: ['notifications'] as const,
  list: (tenantGroupId: string, filters?: { status?: string; channel?: string }) =>
    [...notifications.all, tenantGroupId, filters ?? {}] as const,
};
const audit = {
  all: ['audit'] as const,
  log: (tenantGroupId: string, filters?: Record<string, unknown>) => [...audit.all, tenantGroupId, filters ?? {}] as const,
  trace: (entityType: string, entityId: string) => [...audit.all, 'trace', entityType, entityId] as const,
};
const evidence = {
  all: ['evidence'] as const,
  detail: (id: string) => [...evidence.all, id] as const,
};
const groupRules = {
  all: ['group-rules'] as const,
  loanHints: (groupId: string) => [...groupRules.all, 'loan-hints', groupId] as const,
};
const support = {
  all: ['support'] as const,
  auditLog: (tenantGroupId: string, filters: Record<string, unknown>) => [...support.all, 'audit-log', tenantGroupId, filters] as const,
  smsFailures: (tenantGroupId: string, cursor?: string) => [...support.all, 'sms-failures', tenantGroupId, cursor ?? ''] as const,
  trace: (entityType: string, entityId: string, tenantGroupId: string) => [...support.all, 'trace', entityType, entityId, tenantGroupId] as const,
  evidence: (id: string) => [...support.all, 'evidence', id] as const,
};
export const queryKeys = { members, meetings, contributions, loans, notifications, audit, evidence, groupRules, support };
