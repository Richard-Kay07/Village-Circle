'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavArea } from '@/lib/navigation/nav-maps';
import { filterNavItemsByCapability } from '@/lib/navigation/filter-by-capability';
import { useCapabilities } from '@/lib/context/capabilities-context';

export interface AreaNavProps {
  area: NavArea;
  /** Optional: override capabilities for this nav (e.g. from props). Defaults to context. */
  capabilities?: readonly string[];
}

export function AreaNav({ area, capabilities: capsOverride }: AreaNavProps) {
  const capsFromContext = useCapabilities();
  const pathname = usePathname();
  const capabilities = capsOverride ?? capsFromContext;
  const items = filterNavItemsByCapability(area.items, capabilities as import('@/lib/types/permissions').Capabilities);

  return (
    <nav className="area-nav" aria-label={area.label} style={navStyle}>
      <ul style={listStyle}>
        {items.map((item) => (
          <li key={item.href} style={itemStyle}>
            <Link
              href={item.href}
              style={{
                ...linkStyle,
                ...(pathname === item.href ? linkActiveStyle : {}),
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const navStyle: React.CSSProperties = { marginBottom: '1rem' };
const listStyle: React.CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' };
const itemStyle: React.CSSProperties = {};
const linkStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: '#374151', backgroundColor: '#f3f4f6' };
const linkActiveStyle: React.CSSProperties = { backgroundColor: '#dbeafe', color: '#1d4ed8', fontWeight: 500 };
