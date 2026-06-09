'use client';

import { DashboardSpec } from '@/types/componentSpec';
import { UserPreferences } from '@/types/preferences';
import DynamicChart from './DynamicChart';
import { THEME_MAP } from './DynamicChart';
import { LayoutDashboard } from 'lucide-react';

interface Props {
  dashboard: DashboardSpec;
  preferences: UserPreferences;
}

export default function DashboardView({ dashboard, preferences }: Props) {
  const theme = THEME_MAP[preferences.colorTheme];

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: preferences.colorTheme === 'dark' ? '#0f172a' : preferences.colorTheme === 'pastel' ? '#faf5ff' : '#f8fafc',
        border: `1px solid ${theme.borderColor}`,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      }}
      data-testid="dashboard-view"
    >
      {dashboard.title && (
        <div
          className="flex items-center gap-2.5 px-5 py-3.5 border-b"
          style={{ borderColor: theme.borderColor }}
        >
          <LayoutDashboard size={15} style={{ color: theme.colors[0] }} />
          <h2
            className="font-bold leading-none"
            style={{ color: theme.textColor, fontSize: preferences.titleFontSize + 2 }}
          >
            {dashboard.title}
          </h2>
        </div>
      )}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dashboard.charts.map((chart, i) => (
          <DynamicChart key={i} spec={chart} preferences={preferences} />
        ))}
      </div>
    </div>
  );
}
