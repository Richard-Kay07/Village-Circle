'use client';

import React, { createContext, useContext } from 'react';

export interface MemberSession {
  groupId: string;
  memberId: string;
  smsNotificationsEnabled?: boolean;
}

const MemberSessionContext = createContext<MemberSession | null>(null);

export function MemberSessionProvider({ children, value }: { children: React.ReactNode; value: MemberSession | null }) {
  return <MemberSessionContext.Provider value={value}>{children}</MemberSessionContext.Provider>;
}

export function useMemberSession(): MemberSession | null {
  return useContext(MemberSessionContext);
}

export const DEMO_MEMBER_SESSION: MemberSession = {
  groupId: process.env.NEXT_PUBLIC_DEMO_GROUP_ID ?? 'demo-group',
  memberId: process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? 'demo-member',
  smsNotificationsEnabled: true,
};
