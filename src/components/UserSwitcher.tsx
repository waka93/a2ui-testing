'use client';

import { useUser } from '@/contexts/UserContext';
import { DEMO_USERS } from '@/lib/demoUsers';
import { User } from 'lucide-react';

export default function UserSwitcher() {
  const { userId, switchUser } = useUser();
  const current = DEMO_USERS.find((u) => u.id === userId);

  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1.5">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white">
        <User size={11} />
      </div>
      <select
        value={userId}
        onChange={(e) => switchUser(e.target.value)}
        className="text-sm font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1"
        data-testid="user-switcher"
        aria-label="Switch user"
      >
        {DEMO_USERS.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </div>
  );
}
