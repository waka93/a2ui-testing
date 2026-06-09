'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_PREFERENCES, UserPreferences } from '@/types/preferences';
import { loadPreferences, savePreferences } from '@/lib/preferenceStore';
import { useUser } from './UserContext';

interface PreferenceContextValue {
  preferences: UserPreferences;
  updatePref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPrefs: () => void;
}

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

export function PreferenceProvider({ children }: { children: ReactNode }) {
  const { userId } = useUser();
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadPreferences(userId),
  );

  useEffect(() => {
    setPreferences(loadPreferences(userId));
  }, [userId]);

  function updatePref<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    savePreferences(userId, next);
  }

  function resetPrefs() {
    const defaults = { ...DEFAULT_PREFERENCES };
    setPreferences(defaults);
    savePreferences(userId, defaults);
  }

  return (
    <PreferenceContext.Provider value={{ preferences, updatePref, resetPrefs }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export function usePreferences(): PreferenceContextValue {
  const ctx = useContext(PreferenceContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferenceProvider');
  return ctx;
}
