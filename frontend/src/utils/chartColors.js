export const CHART_PALETTE = [
  '#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4338ca',
];

export const getChartColor = (index) => CHART_PALETTE[index % CHART_PALETTE.length];
