import { loadPreferences, savePreferences, clearPreferences } from '@/lib/preferenceStore';
import { DEFAULT_PREFERENCES, UserPreferences } from '@/types/preferences';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
    },
    writable: true,
    configurable: true,
  });
});

const makePrefs = (overrides: Partial<Omit<UserPreferences, 'version'>> = {}): UserPreferences => ({
  ...DEFAULT_PREFERENCES,
  ...overrides,
});

describe('user preference isolation (AC-7)', () => {
  it('alice and bob have independent preferences', () => {
    const alicePrefs = makePrefs({ chartFontSize: 20, colorTheme: 'dark', defaultChartType: 'line' });
    savePreferences('alice', alicePrefs);

    // Bob has no saved prefs — should get defaults
    expect(loadPreferences('bob')).toEqual(DEFAULT_PREFERENCES);
    expect(loadPreferences('bob').chartFontSize).toBe(DEFAULT_PREFERENCES.chartFontSize);
  });

  it('changing alice prefs does not affect bob', () => {
    const alicePrefs = makePrefs({ chartFontSize: 20, colorTheme: 'dark', defaultChartType: 'line' });
    savePreferences('alice', alicePrefs);

    const bobPrefs = makePrefs({ chartFontSize: 12, colorTheme: 'pastel', defaultChartType: 'pie' });
    savePreferences('bob', bobPrefs);

    // Update alice again
    savePreferences('alice', { ...alicePrefs, chartFontSize: 22 });

    // Bob unchanged
    expect(loadPreferences('bob').chartFontSize).toBe(12);
  });

  it('switching back to alice restores her saved preferences', () => {
    const alicePrefs = makePrefs({ chartFontSize: 20, colorTheme: 'dark', defaultChartType: 'line' });
    savePreferences('alice', alicePrefs);

    // Simulate switch to bob and back
    loadPreferences('bob');
    expect(loadPreferences('alice')).toEqual(alicePrefs);
  });

  it('clearing alice prefs does not affect bob', () => {
    const bobPrefs = makePrefs({ chartFontSize: 12, colorTheme: 'pastel', defaultChartType: 'pie' });
    savePreferences('bob', bobPrefs);
    savePreferences('alice', { ...DEFAULT_PREFERENCES, chartFontSize: 18 });

    clearPreferences('alice');

    expect(loadPreferences('alice')).toEqual(DEFAULT_PREFERENCES);
    expect(loadPreferences('bob')).toEqual(bobPrefs);
  });
});
