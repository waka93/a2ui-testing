'use client';

import { X } from 'lucide-react';
import { usePreferences } from '@/contexts/PreferenceContext';
import { UserPreferences } from '@/types/preferences';

interface Props {
  onClose: () => void;
}

function Section({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{title}</p>
  );
}

export default function SettingsPanel({ onClose }: Props) {
  const { preferences, updatePref, resetPrefs } = usePreferences();

  return (
    <div
      className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
      data-testid="settings-panel"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-semibold text-slate-800">Preferences</h2>
          <p className="text-xs text-slate-400 mt-0.5">Changes apply to all charts</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
        {/* Typography */}
        <div>
          <Section title="Typography" />
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-700">Title size</label>
                <span className="text-sm font-semibold text-indigo-600">{preferences.titleFontSize}px</span>
              </div>
              <input
                type="range" min={10} max={32} value={preferences.titleFontSize}
                onChange={(e) => updatePref('titleFontSize', Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 rounded-full"
                data-testid="title-font-size-slider"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-700">Chart labels</label>
                <span className="text-sm font-semibold text-indigo-600">{preferences.chartFontSize}px</span>
              </div>
              <input
                type="range" min={10} max={24} value={preferences.chartFontSize}
                onChange={(e) => updatePref('chartFontSize', Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 rounded-full"
                data-testid="font-size-slider"
              />
            </div>
          </div>
        </div>

        {/* Theme */}
        <div>
          <Section title="Color Theme" />
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'default', label: 'Default', colors: ['#6366f1', '#8b5cf6', '#06b6d4'] },
              { value: 'dark', label: 'Dark', colors: ['#818cf8', '#c084fc', '#22d3ee'] },
              { value: 'pastel', label: 'Pastel', colors: ['#a78bfa', '#34d399', '#60a5fa'] },
            ] as { value: UserPreferences['colorTheme']; label: string; colors: string[] }[]).map(({ value, label, colors }) => (
              <button
                key={value}
                onClick={() => updatePref('colorTheme', value)}
                className={`rounded-xl p-3 border-2 transition-all text-left ${
                  preferences.colorTheme === value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`theme-${value}`}
              >
                <div className="flex gap-1 mb-2">
                  {colors.map((c) => (
                    <div key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Default chart type */}
        <div>
          <Section title="Default Chart" />
          <div className="grid grid-cols-3 gap-2">
            {(['bar', 'line', 'pie'] as UserPreferences['defaultChartType'][]).map((type) => (
              <button
                key={type}
                onClick={() => updatePref('defaultChartType', type)}
                className={`rounded-xl py-2.5 text-sm font-medium border-2 capitalize transition-all ${
                  preferences.defaultChartType === type
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                data-testid={`chart-type-${type}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <Section title="Visibility" />
          <div className="space-y-2">
            {([
              { key: 'showLegend', label: 'Show legend' },
              { key: 'showGrid', label: 'Show grid lines' },
            ] as { key: 'showLegend' | 'showGrid'; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => updatePref(key, !preferences[key])}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all ${
                  preferences[key]
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                data-testid={`${key}-checkbox`}
              >
                <span className="text-sm text-slate-700">{label}</span>
                <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center px-0.5 ${preferences[key] ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${preferences[key] ? 'translate-x-3.5' : 'translate-x-0'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100">
        <button
          onClick={resetPrefs}
          className="w-full text-sm text-slate-500 hover:text-red-600 font-medium py-2.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
          data-testid="reset-button"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
