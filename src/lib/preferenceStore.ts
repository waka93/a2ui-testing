import { DEFAULT_PREFERENCES, UserPreferences } from '@/types/preferences';

const STORAGE_PREFIX = 'a2ui_prefs_v1_';

export function loadPreferences(userId: string): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed, version: 1 };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(userId: string, prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — silently continue
  }
}

export function clearPreferences(userId: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + userId);
  } catch {
    // ignore
  }
}
