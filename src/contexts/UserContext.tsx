'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { DEMO_USERS } from '@/lib/demoUsers';

interface UserContextValue {
  userId: string;
  switchUser: (id: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState(DEMO_USERS[0].id);

  return (
    <UserContext.Provider value={{ userId, switchUser: setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
