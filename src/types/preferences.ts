export interface UserPreferences {
  version: 1;
  chartFontSize: number;
  titleFontSize: number;
  colorTheme: 'default' | 'dark' | 'pastel';
  defaultChartType: 'bar' | 'line' | 'pie';
  showLegend: boolean;
  showGrid: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  version: 1,
  chartFontSize: 12,
  titleFontSize: 16,
  colorTheme: 'default',
  defaultChartType: 'bar',
  showLegend: true,
  showGrid: true,
};
