/**
 * Badge config: validate badge variants map to known enums and labels exist.
 */

import { statusTokens } from '@/lib/design-system/tokens';
import {
  STATUS_IDS,
  STATUS_BADGE_LABELS,
  CHANNEL_IDS,
  CHANNEL_BADGE_LABELS,
  TRANSACTION_MODE_IDS,
  TRANSACTION_MODE_BADGE_LABELS,
  PRODUCT_MODULE_IDS,
  getStatusBadgeLabel,
  getChannelBadgeLabel,
  getTransactionModeBadgeLabel,
} from '@/lib/design-system/badges';

describe('Badge config', () => {
  it('STATUS_IDS match statusTokens keys', () => {
    const tokenKeys = Object.keys(statusTokens) as (keyof typeof statusTokens)[];
    expect(STATUS_IDS.sort()).toEqual([...tokenKeys].sort());
  });

  it('every status has label and shortLabel', () => {
    STATUS_IDS.forEach((id) => {
      const entry = STATUS_BADGE_LABELS[id];
      expect(entry).toBeDefined();
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.shortLabel).toBe('string');
      expect(entry.shortLabel.length).toBeGreaterThan(0);
    });
  });

  it('every channel has label and shortLabel', () => {
    CHANNEL_IDS.forEach((id) => {
      const entry = CHANNEL_BADGE_LABELS[id];
      expect(entry).toBeDefined();
      expect(typeof entry.label).toBe('string');
      expect(typeof entry.shortLabel).toBe('string');
    });
  });

  it('every transaction mode has label and shortLabel', () => {
    TRANSACTION_MODE_IDS.forEach((id) => {
      const entry = TRANSACTION_MODE_BADGE_LABELS[id];
      expect(entry).toBeDefined();
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.shortLabel).toBe('string');
    });
  });

  it('PRODUCT_MODULE_IDS contains save, hub, grow, pay, learn', () => {
    expect(PRODUCT_MODULE_IDS).toContain('save');
    expect(PRODUCT_MODULE_IDS).toContain('hub');
    expect(PRODUCT_MODULE_IDS).toContain('grow');
    expect(PRODUCT_MODULE_IDS).toContain('pay');
    expect(PRODUCT_MODULE_IDS).toContain('learn');
    expect(PRODUCT_MODULE_IDS.length).toBe(5);
  });

  it('getStatusBadgeLabel returns string for each statusId', () => {
    STATUS_IDS.forEach((id) => {
      expect(getStatusBadgeLabel(id)).toBe(STATUS_BADGE_LABELS[id].label);
      expect(getStatusBadgeLabel(id, true)).toBe(STATUS_BADGE_LABELS[id].shortLabel);
    });
  });

  it('getChannelBadgeLabel returns string for each channelId', () => {
    CHANNEL_IDS.forEach((id) => {
      expect(getChannelBadgeLabel(id)).toBe(CHANNEL_BADGE_LABELS[id].label);
      expect(getChannelBadgeLabel(id, true)).toBe(CHANNEL_BADGE_LABELS[id].shortLabel);
    });
  });

  it('getTransactionModeBadgeLabel returns string for each mode', () => {
    TRANSACTION_MODE_IDS.forEach((id) => {
      expect(getTransactionModeBadgeLabel(id)).toBe(TRANSACTION_MODE_BADGE_LABELS[id].label);
      expect(getTransactionModeBadgeLabel(id, true)).toBe(TRANSACTION_MODE_BADGE_LABELS[id].shortLabel);
    });
  });
});
