/**
 * Badge label and casing config for VillageCircle360 UI.
 * Use with ModuleBadge, StatusBadge, ChannelBadge, TransactionModeBadge.
 * Short labels for narrow screens; always pair badges with context (icons/labels).
 *
 * @see docs/ICON_BADGE_MODULE_IDENTITY.md
 */

import type { StatusId } from '@/lib/design-system/tokens';
import type { ProductModuleId } from '@/lib/brand/architecture';

/** Notification/delivery channel */
export type ChannelId = 'in_app' | 'email' | 'sms';

/** Transaction mode (contributions, repayments) */
export type TransactionModeId = 'CASH' | 'BANK_TRANSFER';

/** Status badge: display label and short label for narrow screens */
export const STATUS_BADGE_LABELS: Record<StatusId, { label: string; shortLabel: string }> = {
  recorded: { label: 'Recorded', shortLabel: 'Recorded' },
  pending: { label: 'Pending', shortLabel: 'Pending' },
  approved: { label: 'Approved', shortLabel: 'Approved' },
  overdue: { label: 'Overdue', shortLabel: 'Overdue' },
  reversed: { label: 'Reversed', shortLabel: 'Reversed' },
  failed: { label: 'Failed', shortLabel: 'Failed' },
  delivered: { label: 'Delivered', shortLabel: 'Delivered' },
};

/** Channel badge labels */
export const CHANNEL_BADGE_LABELS: Record<ChannelId, { label: string; shortLabel: string }> = {
  in_app: { label: 'In-app', shortLabel: 'App' },
  email: { label: 'Email', shortLabel: 'Email' },
  sms: { label: 'SMS', shortLabel: 'SMS' },
};

/** Transaction mode badge labels */
export const TRANSACTION_MODE_BADGE_LABELS: Record<TransactionModeId, { label: string; shortLabel: string }> = {
  CASH: { label: 'Cash', shortLabel: 'Cash' },
  BANK_TRANSFER: { label: 'Bank transfer', shortLabel: 'Bank' },
};

/** Coming soon label for LATER modules (VC Pay, VC Learn) */
export const COMING_SOON_LABEL = 'Coming soon';
export const COMING_SOON_SHORT_LABEL = 'Soon';

/** All valid status ids for validation */
export const STATUS_IDS: StatusId[] = [
  'recorded',
  'pending',
  'approved',
  'overdue',
  'reversed',
  'failed',
  'delivered',
];

/** All valid channel ids */
export const CHANNEL_IDS: ChannelId[] = ['in_app', 'email', 'sms'];

/** All valid transaction mode ids */
export const TRANSACTION_MODE_IDS: TransactionModeId[] = ['CASH', 'BANK_TRANSFER'];

/** All product module ids */
export const PRODUCT_MODULE_IDS: ProductModuleId[] = ['save', 'hub', 'grow', 'pay', 'learn'];

export function getStatusBadgeLabel(statusId: StatusId, short?: boolean): string {
  const entry = STATUS_BADGE_LABELS[statusId];
  return short ? entry.shortLabel : entry.label;
}

export function getChannelBadgeLabel(channelId: ChannelId, short?: boolean): string {
  const entry = CHANNEL_BADGE_LABELS[channelId];
  return short ? entry.shortLabel : entry.label;
}

export function getTransactionModeBadgeLabel(modeId: TransactionModeId, short?: boolean): string {
  const entry = TRANSACTION_MODE_BADGE_LABELS[modeId];
  return short ? entry.shortLabel : entry.label;
}
