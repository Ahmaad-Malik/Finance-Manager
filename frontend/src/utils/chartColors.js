export const CHART_PALETTE = [
  '#659287', '#f59e0b', '#0891b2', '#c0392b', '#2f7a52',
  '#db2777', '#408A71', '#4338ca', '#ea580c', '#65a30d',
];

export const getChartColor = (index) => CHART_PALETTE[index % CHART_PALETTE.length];
