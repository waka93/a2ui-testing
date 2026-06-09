export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ComponentSpec {
  type: 'chart';
  title: string;
  chartType: 'bar' | 'line' | 'pie';
  data: ChartDataPoint[];
  description?: string;
}

export interface DashboardSpec {
  title?: string;
  charts: ComponentSpec[];
}
