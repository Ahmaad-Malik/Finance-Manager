export const CHART_PALETTE = [
  '#1f9d55', '#f59e0b', '#0891b2', '#dc2626', '#7c3aed',
  '#65a30d', '#db2777', '#22a35f', '#4338ca', '#ea580c',
];

export const getChartColor = (index) => CHART_PALETTE[index % CHART_PALETTE.length];
