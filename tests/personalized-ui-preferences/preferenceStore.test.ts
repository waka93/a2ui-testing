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

describe('loadPreferences', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadPreferences('alice')).toEqual(DEFAULT_PREFERENCES);
  });

  it('returns saved preferences', () => {
    const prefs = makePrefs({ chartFontSize: 20, colorTheme: 'dark', defaultChartType: 'line' });
    savePreferences('alice', prefs);
    expect(loadPreferences('alice')).toEqual(prefs);
  });

  it('merges stored prefs with defaults for missing keys (schema evolution)', () => {
    // Simulate a stored record missing new fields (old schema)
    mockStorage['a2ui_prefs_v1_alice'] = JSON.stringify({ version: 1, chartFontSize: 18, colorTheme: 'pastel' });
    const result = loadPreferences('alice');
    expect(result.chartFontSize).toBe(18);
    expect(result.colorTheme).toBe('pastel');
    expect(result.defaultChartType).toBe(DEFAULT_PREFERENCES.defaultChartType);
    expect(result.showLegend).toBe(DEFAULT_PREFERENCES.showLegend);
    expect(result.showGrid).toBe(DEFAULT_PREFERENCES.showGrid);
  });

  it('returns defaults when localStorage throws (private browsing)', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => { throw new DOMException('SecurityError'); },
        setItem: () => {},
        removeItem: () => {},
      },
      writable: true,
      configurable: true,
    });
    expect(loadPreferences('alice')).toEqual(DEFAULT_PREFERENCES);
  });
});

describe('savePreferences', () => {
  it('writes to localStorage under the correct key', () => {
    const prefs = makePrefs({ chartFontSize: 16, colorTheme: 'dark', defaultChartType: 'line' });
    savePreferences('alice', prefs);
    const raw = mockStorage['a2ui_prefs_v1_alice'];
    expect(JSON.parse(raw)).toEqual(prefs);
  });

  it('isolates storage per user', () => {
    const alicePrefs = makePrefs({ chartFontSize: 16, colorTheme: 'dark', defaultChartType: 'line' });
    const bobPrefs = makePrefs({ chartFontSize: 12, colorTheme: 'pastel', defaultChartType: 'pie' });
    savePreferences('alice', alicePrefs);
    savePreferences('bob', bobPrefs);
    expect(loadPreferences('alice')).toEqual(alicePrefs);
    expect(loadPreferences('bob')).toEqual(bobPrefs);
  });
});

describe('clearPreferences', () => {
  it('removes stored prefs and causes loadPreferences to return defaults', () => {
    const prefs = makePrefs({ chartFontSize: 20, colorTheme: 'dark', defaultChartType: 'line' });
    savePreferences('alice', prefs);
    clearPreferences('alice');
    expect(loadPreferences('alice')).toEqual(DEFAULT_PREFERENCES);
  });
});
