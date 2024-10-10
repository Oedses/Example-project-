import { t } from "i18next";

export const getChartCategories = () => ({
  period: {
    label: t('pages.portfolio.chart.tabs.period'),
    value: 'period'
  },
  yearToDate: {
    label: t('pages.portfolio.chart.tabs.yearToDate'),
    value: 'Year To Date'
  }
});