import { t } from "i18next";

import { Status } from "../../../../../../shared/types/common";
import { ComplexIssuer } from "../../../../../../shared/types/issuer";
import { isInterestProduct, Product } from "../../../../../../shared/types/product";

import {
  formatDate,
  getProductTotalAmount,
} from "../../../../utils";

import { DateUtils } from "../../../components/UI/DatePicker/datepicker.utils";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row, TableCell, TableCellTypes } from "../../../components/UI/Table";

type IssuerSummary = {
  totalProducts: number;
  totalVolume: number;
  totalInvestors: number;
  totalPayOut: number;
};

const tPath = 'components.table';

export const createIssuerDetails = (issuer: Partial<ComplexIssuer>): ListItemProps[] => [
  {
    title: t('pages.issuer.view.details.list.status'),
    content: issuer.status,
    status: issuer.status as unknown as Status,
    isStatus: true
  },
  {
    title: t('pages.issuer.view.details.list.createdOn'),
    content: formatDate(new Date(issuer?.createdAt!).toISOString())
  },
  {
    title: t('pages.issuer.view.details.list.issuerName'),
    content: issuer.name
  },
  {
    title: t('pages.issuer.view.details.list.email'),
    content: issuer.email
  },
  {
    title: t('pages.issuer.view.details.list.phoneNumber'),
    content: issuer?.phone
  },
  {
    title: t('pages.issuer.view.details.list.kvk'),
    content: issuer?.kvk
  },
  {
    title: t('pages.issuer.view.details.list.vat'),
    content: issuer?.vat
  },
  {
    title: t('pages.issuer.view.details.list.address'),
    content: issuer?.address
  },
  {
    title: t('pages.issuer.view.details.list.postcode'),
    content: issuer?.postcode
  },
  {
    title: t('pages.issuer.view.details.list.city'),
    content: issuer?.city
  }
];


export const createIssuerSummary = ({ totalProducts, totalVolume, totalInvestors, totalPayOut }: IssuerSummary): ListItemProps[] => [
  {
    title: t('pages.issuer.view.summary.list.totalProducts'),
    content: totalProducts.toString(),
    contentClasses: 'list-item__montserrat'
  },
  {
    title: t('pages.issuer.view.summary.list.totalVolume'),
    content: totalVolume.toString(),
    isAmount: true,
  },
  {
    title: t('pages.issuer.view.summary.list.totalInvestors'),
    content: totalInvestors.toString(),
    contentClasses: 'list-item__montserrat'
  },
  {
    title: t('pages.issuer.view.summary.list.totalPayOut'),
    content: totalPayOut.toString(),
    isAmount: true
  }
];

export const createIssuerProductsRows = (products: Product[]): Row[] => {
  return products.map((product: Product) => {
    const maturityDate = isInterestProduct(product) ? DateUtils.addDeltaToDate(new Date(product.createdAt!), {
      ...DateUtils.defaultDelta,
      [product.maturityUnit as string]: product.maturity
    }, true) : null;

    const maturity = {
      type: TableCellTypes.STRING,
      value: maturityDate
        ? formatDate(maturityDate.toISOString())
        : "N/A",
    };

    return [
      {
        type: TableCellTypes.STRING,
        value: product.name,
      },
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.products.category.${product.category.toLowerCase()}`)
      },
      { type: TableCellTypes.CURRENCY, value: getProductTotalAmount(product) },
      { type: TableCellTypes.STRING, value: product.paymentType },
      {
        type: TableCellTypes.STRING,
        value: isInterestProduct(product) ? `${product.couponRate} %` : "N/A",
      },
      maturity,
      {
        type: TableCellTypes.STATUS,
        value: t(
          `${tPath}.status.${(product.status || Status.processing).toLowerCase()}`
        ),
        status: product.status || Status.processing,
      },
      {
        type: TableCellTypes.ROW_DATA,
        value: product.id || "",
        rowData: {
          navigateUrl: `/products/${product.id}`,
        }
      }
    ] as TableCell[];
  });
};

export const productTableHeader = [
  'pages.issuer.view.products.table.head.product',
  'pages.issuer.view.products.table.head.category',
  'pages.issuer.view.products.table.head.avialableVolume',
  'pages.issuer.view.products.table.head.paymentType',
  'pages.issuer.view.products.table.head.couponRate',
  'pages.issuer.view.products.table.head.maturity',
  'pages.issuer.view.products.table.head.status'
];
