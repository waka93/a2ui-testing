'use client';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ComponentSpec } from '@/types/componentSpec';
import { UserPreferences } from '@/types/preferences';

interface ThemeTokens {
  colors: string[];
  axisColor: string;
  gridColor: string;
  background: string;
  textColor: string;
  borderColor: string;
  accentTop: string;
}

export const THEME_MAP: Record<UserPreferences['colorTheme'], ThemeTokens> = {
  default: {
    colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b'],
    axisColor: '#94a3b8',
    gridColor: '#f1f5f9',
    background: '#ffffff',
    textColor: '#1e293b',
    borderColor: '#e2e8f0',
    accentTop: '#6366f1',
  },
  dark: {
    colors: ['#818cf8', '#c084fc', '#22d3ee', '#fbbf24'],
    axisColor: '#64748b',
    gridColor: '#1e293b',
    background: '#0f172a',
    textColor: '#e2e8f0',
    borderColor: '#1e293b',
    accentTop: '#818cf8',
  },
  pastel: {
    colors: ['#a78bfa', '#34d399', '#60a5fa', '#f472b6'],
    axisColor: '#94a3b8',
    gridColor: '#f8fafc',
    background: '#fefce8',
    textColor: '#374151',
    borderColor: '#e9d5ff',
    accentTop: '#a78bfa',
  },
};

interface Props {
  spec: ComponentSpec;
  preferences: UserPreferences;
}

export default function DynamicChart({ spec, preferences }: Props) {
  const theme = THEME_MAP[preferences.colorTheme];
  const { chartFontSize, titleFontSize, showLegend, showGrid } = preferences;
  const chartType = spec.chartType;
  const data = spec.data.map((d) => ({ name: d.label, value: d.value }));

  const axisProps = {
    tick: { fontSize: chartFontSize, fill: theme.axisColor },
    stroke: 'transparent',
  };

  const tooltipStyle = {
    fontSize: chartFontSize,
    borderRadius: 8,
    border: `1px solid ${theme.borderColor}`,
    background: theme.background,
    color: theme.textColor,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
  };

  return (
    <div
      className="rounded-xl overflow-hidden w-full"
      style={{
        background: theme.background,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
      }}
      data-testid="dynamic-chart"
    >
      {/* Colored top accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${theme.colors[0]}, ${theme.colors[1]})` }} />

      <div className="p-4">
        <h3
          className="font-semibold mb-1 leading-snug"
          style={{ color: theme.textColor, fontSize: titleFontSize }}
        >
          {spec.title}
        </h3>
        {spec.description && (
          <p className="text-xs mb-3" style={{ color: theme.axisColor }}>
            {spec.description}
          </p>
        )}
        <ResponsiveContainer width="100%" height={200}>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={30} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={theme.colors[i % theme.colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend wrapperStyle={{ fontSize: chartFontSize }} />}
            </PieChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              {showGrid && <CartesianGrid stroke={theme.gridColor} strokeDasharray="3 3" />}
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend wrapperStyle={{ fontSize: chartFontSize }} />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.colors[0]}
                strokeWidth={2.5}
                dot={{ fill: theme.colors[0], r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              {showGrid && <CartesianGrid stroke={theme.gridColor} strokeDasharray="3 3" vertical={false} />}
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.gridColor }} />
              {showLegend && <Legend wrapperStyle={{ fontSize: chartFontSize }} />}
              <Bar dataKey="value" fill={theme.colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
