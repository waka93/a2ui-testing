import { DemoUser } from '@/types/demoUser';

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'alice',
    name: 'Alice',
    seedPreferences: {
      version: 1,
      chartFontSize: 14,
      titleFontSize: 20,
      colorTheme: 'dark',
      defaultChartType: 'line',
      showLegend: true,
      showGrid: true,
    },
  },
  {
    id: 'bob',
    name: 'Bob',
    seedPreferences: {
      version: 1,
      chartFontSize: 11,
      titleFontSize: 14,
      colorTheme: 'pastel',
      defaultChartType: 'pie',
      showLegend: false,
      showGrid: false,
    },
  },
  {
    id: 'charlie',
    name: 'Charlie',
    seedPreferences: {
      version: 1,
      chartFontSize: 12,
      titleFontSize: 16,
      colorTheme: 'default',
      defaultChartType: 'bar',
      showLegend: true,
      showGrid: true,
    },
  },
];
