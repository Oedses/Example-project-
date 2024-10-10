import { t } from "i18next";

import { Holding } from "../../../../../shared/types/holding";
import { InvestorChartData, InvestorIntervalChartData } from "../../../../../shared/types/investor";
import { ProductCategory } from "../../../../../shared/types/product";

import { getProductTotalAmount, formatDate, getDecimalNumber, getOutstandingCapital } from "../../../utils";
import { Locales } from "../../../localization/models";

import { Row, TableCellTypes, TableCell } from "../../components/UI/Table";
import { TextColors } from "../../components/UI/Table/table.constants";
import { DateUtils } from "../../components/UI/DatePicker/datepicker.utils";

export const months = {
  [Locales.en]: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  [Locales.nl]: ["Jan", "Feb", "Maart", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"]
};

export const defaultChartPeriodRange = [
  DateUtils.addDeltaToDate(new Date, { days: 7, months: 0, years: 0 }, false).toDateString(),
  new Date().toDateString()
];

export const tHeader = [
  "pages.portfolio.table.head.holding",
  "pages.portfolio.table.head.category",
  "pages.portfolio.table.head.weight",
  "pages.portfolio.table.head.originalAmount",
  "pages.portfolio.table.head.outstandingAmount",
  "pages.portfolio.table.head.amountRecieved",
  "pages.portfolio.table.head.heldSince",
  "pages.portfolio.table.head.maturityDate",
  "pages.portfolio.table.head.nonCallPeriod",
];

export const tooltipLabels = [
  "pages.overview.chart.tooltip.totalAmount",
  "pages.overview.chart.tooltip.originalAmount",
];

export const getAnnullizedYield = (toa: number, tar: number, years: number = 1) =>
  toa > 0 ? getDecimalNumber((Math.pow((toa + tar) / toa, 1 / years) - 1) * 100) : 0;

export const createHoldingsRows = (holdings: Holding[], toa: number): Row[] => {
  const holdingsWeights = holdings.map(holding => getDecimalNumber((getProductTotalAmount(holding) / toa)));

  return holdings.map((holding, index) => {
    const isOutStandingCapitalDisplayed = holding.category === ProductCategory.Bond;

    const originalAmount = getProductTotalAmount(holding);

    return [
      {
        type: TableCellTypes.STRING,
        value: holding.name,
      },
      {
        type: TableCellTypes.STRING,
        value: t(`pages.overview.products.table.content.categoryType.${(holding.category || "Certificate").toLowerCase()}`),
      },
      {
        type: TableCellTypes.STRING,
        value:
          holdingsWeights[index] >= 0.01
            ? `${holdingsWeights[index]}`
            : "< 0.01",
      },
      {
        type: TableCellTypes.CURRENCY,
        value: isNaN(originalAmount) ? '0' : originalAmount.toString(),
        color: TextColors.black,
      },
      {
        type: isOutStandingCapitalDisplayed ? TableCellTypes.CURRENCY : TableCellTypes.STRING,
        value: isOutStandingCapitalDisplayed ? getOutstandingCapital(holding).toString() : 'N/A',
        color: TextColors.black,
        contentClasses: 'table-cell__centered'
      },
      {
        type: TableCellTypes.CURRENCY,
        value: holding?.amountReceived?.toString() || "0",
        color:
          Number(holding.amountReceived) > 0
            ? TextColors.green
            : TextColors.black,
      },
      {
        type: TableCellTypes.DATE,
        value: holding.heldSince ? formatDate(holding.heldSince) : "N/A",
      },
      {
        type: TableCellTypes.DATE,
        value: holding.maturityDate ? formatDate(holding.maturityDate) : "N/A",
      },
      {
        type: TableCellTypes.DATE,
        value: holding.nonCallPeriod ? formatDate(holding.nonCallPeriod) : "N/A",
      },
      {
        type: TableCellTypes.ROW_DATA,
        value: holding.product || "",
        rowData: {
          navigateUrl: `/products/${holding.product}`,
        }
      },
    ] as TableCell[];
  });
};

export const colors = [
  '#0099CC',
  '#a55eea',
  '#eb3b5a',
  '#fd9644',
  '#fed330',
  '#20bf6b',
  '#26de81',
  '#0fb9b1',
  '#4b6584',
  '#a5b1c2',
];

export const recievedAmountDataSet = (data: number[]) => ({
  fill: true,
  lineTension: 0.2,
  borderColor: "#0099CC",
  borderWidth: 2,
  pointBorderColor: "#0099CC",
  pointBackgroundColor: "#ffffff",
  pointBorderWidth: 2,
  backgroundColor: "rgba(0, 153, 204, 0.08)",
  data,
  stepped: true,
});

export const getAmountsArray = (data: InvestorChartData[] | InvestorIntervalChartData[], field: 'totalOriginalAmount' | 'totalAmountReceived'): number[] => {
  return data
  .map(item => item[field])
  .reduce((acc, curr, index) => [ ...acc, (curr + (index > 0 ? acc[index - 1] : 0))], [] as number[]);
};

const isPeriodChartData = (data: InvestorChartData[] | InvestorIntervalChartData[]): data is InvestorIntervalChartData[] => Boolean((data as InvestorIntervalChartData[])[0]?.date);
const isYearToDateChartData = (data: InvestorChartData[] | InvestorIntervalChartData[]): data is InvestorChartData[] => (data as InvestorChartData[])[0]?.period >= 0;

export const createChartDataset = (data: InvestorChartData[] | InvestorIntervalChartData[], TORs: number[], TOAs: number[], locale: Locales) => {
  const datasets = TORs.map((tor, index) => tor + TOAs[index]);

  let labels = [] as string[];

  if (isYearToDateChartData(data)) labels = data.map(item => `${months[locale][item.period]} ${new Date().getFullYear()}`);
  if (isPeriodChartData(data)) labels = data.map(item => item.date.split('-').reverse().join('-'));

  return ({
    labels,
    datasets: [
      recievedAmountDataSet(datasets),
    ],
  });
};
