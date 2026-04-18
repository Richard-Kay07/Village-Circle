/**
 * Copy key namespaces for i18n/localization readiness.
 * Maps module namespaces to key prefixes; use for splitting JSON per locale (e.g. common.en.json, vcSave.en.json).
 *
 * @see docs/UX_COPY_STYLE_GUIDE.md § Copy key architecture
 */

import { COPY_KEYS, type CopyKey } from './keys';

/** Namespace id used in docs and optional JSON bundles */
export type CopyNamespaceId =
  | 'common'
  | 'auth'
  | 'vcSave'
  | 'vcHub'
  | 'vcGrow'
  | 'ops'
  | 'notifications'
  | 'adminSupport'
  | 'legal'
  | 'errors'
  | 'immutable'
  | 'placeholders';

/** Key prefix → namespace (first segment of key, e.g. common_, hub_, ops_). */
const PREFIX_TO_NAMESPACE: Record<string, CopyNamespaceId> = {
  common_: 'common',
  auth_: 'auth',
  save_: 'vcSave',
  member_: 'vcSave',
  ops_: 'ops',
  hub_: 'vcHub',
  grow_: 'vcGrow',
  notifications_: 'notifications',
  admin_: 'adminSupport',
  legal_: 'legal',
  immutable_: 'immutable',
  pay_: 'placeholders',
  learn_: 'placeholders',
};

function keyPrefix(key: string): string {
  const i = key.indexOf('_');
  if (i <= 0) return key;
  return key.slice(0, i + 1);
}

/**
 * Returns the namespace for a copy key (by prefix).
 */
export function getCopyKeyNamespace(key: CopyKey): CopyNamespaceId {
  const prefix = keyPrefix(key);
  return PREFIX_TO_NAMESPACE[prefix] ?? 'common';
}

/**
 * All copy keys grouped by namespace. Useful for generating per-namespace JSON.
 */
export function getCopyKeysByNamespace(): Record<CopyNamespaceId, CopyKey[]> {
  const out: Record<CopyNamespaceId, CopyKey[]> = {
    common: [],
    auth: [],
    vcSave: [],
    vcHub: [],
    vcGrow: [],
    ops: [],
    notifications: [],
    adminSupport: [],
    legal: [],
    errors: [],
    immutable: [],
    placeholders: [],
  };
  const keys = Object.values(COPY_KEYS) as CopyKey[];
  for (const k of keys) {
    const ns = getCopyKeyNamespace(k);
    out[ns].push(k);
  }
  return out;
}
