const chartLabels = [
  "buyVolume",
  "sellVolume",
  "paymentVolume",
  "processingVolume",
  "totalVolume",
];

export const tooltipLabels = chartLabels.map(
  (label) => `pages.admin.overview.chart.tooltip.${label}`
);

export const platformOverviewLabels = [
  "pages.admin.overview.platformOverview.volume",
  "pages.admin.overview.platformOverview.processing",
  "pages.admin.overview.platformOverview.deposits",
  "pages.admin.overview.platformOverview.transactions",
];

const colors = ["#28A745", "#CC3300", "#0099CC", "#ffd60a", "#DCDCDC"];

export const transactionVolumeLabelData = chartLabels.map((label, index) => ({
  item: {
    data: { label: `pages.admin.overview.chart.tooltip.${label}` },
  },
  additionalStyle: { labelColor: colors[index] },
}));

export const createChartData = (rowLabels: string[], data: number[][]) =>
  rowLabels.map((item, index) => ({
    label: item,
    data: data[index],
    backgroundColor: colors[index],
  }));
