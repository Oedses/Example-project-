import { t } from 'i18next';
import { AccountStatus, Roles, Status } from '../../../../../shared/types/common';
import { Issuer } from '../../../../../shared/types/issuer';
import { formatDate } from '../../../utils';
import { Row, TableCellTypes, TableCell } from '../../components/UI/Table';

export const limitStep = 10;

const tPath = 'components.table';

export const rolesForCreate = [ Roles.admin ];

// pages.admin.issuers.table.head.
export const theadData = [
  'pages.admin.issuers.table.head.date',
  'pages.admin.issuers.table.head.name',
  'pages.admin.issuers.table.head.email',
  'pages.admin.issuers.table.head.totalProducts',
  'pages.admin.issuers.table.head.totalVolume',
  'pages.admin.issuers.table.head.status'
];

type TypeMappingIssuersCategory = {
  [key in AccountStatus]: string;
} & { [all:string]: string };

export const MappingIssuerCategory: TypeMappingIssuersCategory = {
  Processing: "pages.issuer.issuerCategory.processing",
  Active: "pages.issuer.issuerCategory.active",
  Inactive: "pages.issuer.issuerCategory.inactive",
  Failed: "pages.issuer.issuerCategory.failed",
  Rejected: "pages.issuer.issuerCategory.rejected",
  all: "pages.issuer.issuerCategory.all"
};

export enum TransactionColor {
  DEFAULT = 'default',
  PAYMENT = 'gray',
  BUY = 'green',
  SELL = 'red'
}

export const createIssuersExportData = ( data: Issuer[] ) => {

  if (!data) return [];

  let exportData = [];

  exportData = data.map((issuer: Issuer) => {
    const date = formatDate(issuer?.createdAt);

    const issuerName = issuer.name;

    const email = issuer.email;

    const totalProducts = issuer.totalProducts ? issuer.totalProducts.toString() : '0';

    const totalVolume = issuer.totalVolumeAllProducts ? issuer.totalVolumeAllProducts.toString() : '0';

    const status = issuer.status || Status.processing;

    return {
      date: date,
      issuerName: issuerName,
      email: email,
      totalProducts: totalProducts,
      totalVolume: totalVolume,
      status: status
    };
  });

  return exportData;
};

export const createIssuersRows = (issuers: Issuer[]): Row[] => {
  return issuers.map((issuer: Issuer) => {
    const date = {
      type: TableCellTypes.DATE,
      value: formatDate(issuer?.createdAt)
    };

    const name = {
      type: TableCellTypes.STRING,
      value: issuer.name
    };

    const email = {
      type: TableCellTypes.STRING,
      value: issuer.email
    };

    const totalProducts = {
      type: TableCellTypes.STRING,
      value: issuer.totalProducts ? issuer.totalProducts.toString() : '0'
    };

    const totalVolume = {
      type: TableCellTypes.CURRENCY,
      value: issuer.totalVolumeAllProducts ? issuer.totalVolumeAllProducts.toString() : '0'
    };

    const status = {
      type: TableCellTypes.STATUS,
      value: t(
        `${tPath}.status.${(issuer.status || Status.processing).toLowerCase()}`
      ),
      status: issuer.status || Status.processing,
    };

    const rowData = {
      type: TableCellTypes.ROW_DATA,
      value: issuer.id || "",
      rowData: {
        navigateUrl: `/issuer/${issuer.id}`,
      }
    };

    return [
      date,
      name,
      email,
      totalProducts,
      totalVolume,
      status,
      rowData
    ] as TableCell[];
  });
};
