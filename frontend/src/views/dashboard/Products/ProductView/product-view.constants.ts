import { t } from "i18next";

import {
  AccountStatus,
  Roles,
  Status,
} from "../../../../../../shared/types/common";

import { Holding } from "../../../../../../shared/types/holding";
import { Investor, isLegalEntity, isNaturalPerson } from "../../../../../../shared/types/investor";
import { Issuer } from "../../../../../../shared/types/issuer";
import {
  isInterestProduct,
  Product,
  ComplexProduct,
  ProductCategory,
} from "../../../../../../shared/types/product";

import {
  formatDate,
  getOutstandingCapital,
  getProductTotalAmount,
} from "../../../../utils/fn";

import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row, TableCellTypes } from "../../../components/UI/Table";
import {
  TextColors,
} from "../../../components/UI/Table/table.constants";


export const rolesForComplianceLog = [Roles.admin, Roles.compliance];
export const rolesForExtendedTransactionTable = [Roles.admin, Roles.compliance];
export const rolesForDeactivate = [Roles.admin, Roles.issuer];

const tPath = 'components.table';

export const myHoldingsTHead = [
  "pages.products.view.myHoldings.table.head.holding",
  "pages.products.view.myHoldings.table.head.originalAmount",
  "pages.products.view.myHoldings.table.head.outstandingCapital",
  "pages.products.view.myHoldings.table.head.recievedAmount",
  "pages.products.view.myHoldings.table.head.heldSince",
  "pages.products.view.myHoldings.table.head.maturityDate",
  "pages.products.view.myHoldings.table.head.nonCallPeriod",
];

export const documentsTHead = [
  "pages.products.view.documents.table.head.document",
  "pages.products.view.documents.table.head.lastUpdated",
];

export const complianceLogTHHeader = [
  "pages.complianceLog.table.head.date",
  "pages.complianceLog.table.head.action",
  "pages.complianceLog.table.head.remarks",
  "pages.complianceLog.table.head.status",
];

export const investorsTHeader = [
  "pages.products.view.investors.table.head.name",
  "pages.products.view.investors.table.head.tickets",
  "pages.products.view.investors.table.head.amount",
  "pages.products.view.investors.table.head.status",
];

export const createHoldingsRows = (data: Holding[]): Row[] => {
  return data.map((holding) => {
    const isOutStandingCapitalDisplayed = holding.category === ProductCategory.Bond;

    return [
      {
        type: TableCellTypes.COLORED_STRING,
        value: holding.name,
      },
      {
        type: TableCellTypes.CURRENCY,
        value: getProductTotalAmount(holding).toString(),
      },
      {
        type: isOutStandingCapitalDisplayed ? TableCellTypes.CURRENCY : TableCellTypes.STRING,
        value: isOutStandingCapitalDisplayed ? getOutstandingCapital(holding).toString() : 'N/A',
        contentClasses: 'table-cell__centered'
      },
      {
        type: TableCellTypes.CURRENCY,
        value: holding?.amountReceived
          ? (holding?.amountReceived).toString()
          : "0",
        color:
          holding?.amountReceived && holding?.amountReceived > 0
            ? TextColors.green
            : TextColors.black,
      },
      {
        type: TableCellTypes.DATE,
        value: holding?.heldSince ? formatDate(holding.heldSince) : "N/A",
      },
      {
        type: TableCellTypes.DATE,
        value: holding?.maturityDate ? formatDate(holding.maturityDate) : "N/A",
      },
      {
        type: TableCellTypes.DATE,
        value: holding?.nonCallPeriod ? formatDate(holding.nonCallPeriod) : "N/A",
      },
    ];
  });
};

export const createInvestorsRows = (data: Holding[]): Row[] => {
  return data.map((holding) => {
    let userName = '';

    if (isLegalEntity(holding.investor)) userName = holding.investor.companyName;
    if (isNaturalPerson(holding.investor)) userName = `${holding.investor.firstName} ${holding.investor.lastName}`;

    return ([
      {
        type: TableCellTypes.STRING,
        value: userName,
      },
      {
        type: TableCellTypes.STRING,
        value: holding.availableVolume.toString()
      },
      {
        type: TableCellTypes.CURRENCY,
        value: (holding.availableVolume * holding.ticketSize).toFixed(2)
      },
      {
        type: TableCellTypes.STATUS,
        value: (holding.investor as Investor).status || AccountStatus.processing,
        status: (holding.investor as Investor).status || AccountStatus.processing
      },
      {
        type: TableCellTypes.ROW_DATA,
        value: (holding.investor as Investor).id || "",
        rowData: {
          navigateUrl: `/investor/${(holding.investor as Investor).id}`,
        }
      }
    ]);
  });
};

export const createProductDetailsList = (
  productData: Product | undefined
): ListItemProps[] =>
  productData
    ? [
        {
          title: t("pages.investors.view.details.list.status"),
          content: t(`${tPath}.status.${Status[productData.status?.toLowerCase() as keyof typeof Status].toLowerCase()}`),
          status: Status[productData.status?.toLowerCase() as keyof typeof Status],
          isStatus: true,
        },
        {
          title: t("pages.products.view.productDetails.issuer"),
          content: (productData?.issuer as Pick<Issuer, "id" | "name">).name,
        },
        {
          title: t("pages.products.view.productDetails.category"),
          content: t(`${tPath}.products.category.${productData.category.toLowerCase()}`),
        },
        {
          title: t("pages.products.view.productDetails.listingDate"),
          content: productData?.listingDate
            ? formatDate(new Date(productData.listingDate).toISOString())
            : "N/A",
        },
        {
          title: t("pages.products.view.productDetails.paymentFrequency"),
          content: productData.paymentFrequency ?
            t(`${tPath}.products.paymentFrequency.${productData.paymentFrequency.toLowerCase()}`) :
            '',
        },
      ]
    : [];

export const createProductOverviewList = (
  productData: ComplexProduct | undefined
): ListItemProps[] => {
  if (!productData) return [];

  const couponRate = isInterestProduct(productData)
    ? {
        title: t("pages.products.view.productOverview.couponRate"),
        content: productData?.couponRate
          ? `${productData?.couponRate?.toString()} %`
          : "N/A",
        contentClasses: "list-item__montserrat",
      }
    : ({} as ListItemProps);

  return [
    {
      title: t("pages.products.view.productOverview.totalVolume"),
      content: (productData?.totals?.totalVolume || 0).toString(),
      isAmount: true,
      contentClasses: "list-item__montserrat",
    },
    {
      title: t("pages.products.view.productOverview.ticketSize"),
      content: productData?.ticketSize!?.toString(),
      isAmount: true,
      contentClasses: "list-item__montserrat",
    },
    {
      title: t("pages.products.view.productOverview.paymentType"),
      content: t(`${tPath}.products.type.${productData.paymentType.toLowerCase()}`),
      // content: productData?.paymentType.toUpperCase(),
      contentClasses: "list-item__montserrat",
    },
    couponRate,
  ];
};

const defaultSuccessSummary = {
  isShown: true,
  isSuccess: true
};

const defaultFailSummary = {
  isShown: true,
  isSuccess: false
};

export const createSuccessSummary = (title: string, subtitle: string = '') => ({
  ...defaultSuccessSummary,
  title,
  subtitle
});

export const createFailSummary = (title: string, subtitle: string = '') => ({
  ...defaultFailSummary,
  title,
  subtitle
});
