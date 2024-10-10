import { t } from "i18next";
import { AccountStatus, Roles, Status } from "../../../../../shared/types/common";
import { Investor, isNaturalPerson } from "../../../../../shared/types/investor";

import { capitalize, formatDate, toCamelCase } from "../../../utils";

import { Row, TableCellTypes, TableCell } from "../../components/UI/Table";

export const limitStep = 10;

const tPath = 'components.table';

export const rolesForCreate  = [ Roles.admin ];

export type InvestorsCategories = {
  [key in AccountStatus]: number;
} & { all: number };

export const initialCategories = Object.keys(AccountStatus).reduce(
  (acc, curr) => ({ all: 0, ...acc, [capitalize(curr)]: 0 }), {}) as InvestorsCategories;

export const theadData = [
  'pages.investors.table.head.date',
  'pages.investors.table.head.entityType',
  'pages.investors.table.head.name',
  'pages.investors.table.head.email',
  'pages.investors.table.head.totalPayments',
  'pages.investors.table.head.totalProducts',
  'pages.investors.table.head.status'
];

type TypeMappingInvestorsCategory = {
  [key in AccountStatus]: string;
} & { [all:string]: string };

export const MappingInvestorsCategory: TypeMappingInvestorsCategory = {
  Processing: "pages.investors.investorCategory.processing",
  Active: "pages.investors.investorCategory.active",
  Inactive: "pages.investors.investorCategory.inactive",
  Failed: "pages.investors.investorCategory.failed",
  Rejected: "pages.investors.investorCategory.rejected",
  all: "pages.investors.investorCategory.all"
};

export const createInvestorsExportData = ( data: Investor[] ) => {

  if (!data) return [];

  let exportData = [];

  exportData = data.map((investor: Investor) => {
    const date = formatDate(investor?.createdAt!);

    const entityType = t(`${tPath}.investors.type.${toCamelCase(investor.type)}`);
  
    const name = isNaturalPerson(investor) ? `${investor.firstName} ${investor.lastName}` : investor.companyName;

    const email = investor.email;
    
    const totalPayments =  investor.totalPayments?.toString();

    const totlaProducts = investor.totalProducts?.toString();

    const status = investor.status || Status.processing;

    return {
      date: date,
      entityType: entityType,
      name: name,
      email: email,
      totalPayments: totalPayments,
      totlaProducts: totlaProducts,
      status: status
    };
  });

  return exportData;
};

export const createInvestorsRows = (data: Investor[]): Row[] | [] => {
  return data.map((investor: Investor) => {
    const name =  {
      type: TableCellTypes.STRING,
      value: isNaturalPerson(investor) ? `${investor.firstName} ${investor.lastName}` : investor.companyName,
    };

    return [
      { type: TableCellTypes.DATE, value: formatDate(investor?.createdAt!) },
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.investors.type.${toCamelCase(investor.type)}`)
      },
      name,
      { type: TableCellTypes.STRING, value: investor.email },
      { type: TableCellTypes.CURRENCY, value: investor.totalPayments?.toString() },
      { type: TableCellTypes.STRING, value: investor.totalProducts?.toString() },
      {
        type: TableCellTypes.STATUS,
        value: t(
          `${tPath}.status.${(investor.status || Status.processing).toLowerCase()}`
        ),
        status: investor.status || Status.processing,
      },
      {
        type: TableCellTypes.ROW_DATA,
        value: investor.id || "",
        rowData: {
          navigateUrl: `/investor/${investor.id}`,
        }
      }
    ] as TableCell[];
  });
};
