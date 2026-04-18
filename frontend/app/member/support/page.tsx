'use client';

import React from 'react';
import { PageHeader } from '@/components/ui';

export default function MemberSupportPage() {
  return (
    <>
      <PageHeader title="Support" />
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contact</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          For account or circle questions, contact your group administrator or treasurer.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Technical support: include your group name and a short description of the issue.
        </p>
      </section>
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>FAQ</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <strong style={{ fontSize: '0.875rem' }}>How do I view my statements?</strong>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Go to My Statements to see contribution history and filter by date.</p>
          </li>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <strong style={{ fontSize: '0.875rem' }}>When is my next loan payment due?</strong>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Open the loan in My Loans and check the schedule and next due amount.</p>
          </li>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <strong style={{ fontSize: '0.875rem' }}>How do I change my notification preferences?</strong>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.25rem 0 0' }}>Go to Notifications and open Preferences to manage SMS reminders.</p>
          </li>
        </ul>
      </section>
    </>
  );
}
