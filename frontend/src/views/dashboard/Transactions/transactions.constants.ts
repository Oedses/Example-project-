import { Roles, Status } from '../../../../../shared/types/common';
import { isNaturalPerson } from '../../../../../shared/types/investor';
import { CreateTransactonResponse, TransactionType } from '../../../../../shared/types/transaction';
import { formatDate, getTransactionTotalPrice, getTransactionType, isSuperUser } from '../../../utils';
import { Row, TableCellTypes, TableCell } from '../../components/UI/Table';
import { getColorForColoredString, MAX_VALUE_LENGTH } from '../../components/UI/Table/table.constants';
import {  TransactionStatus } from "../../../../../shared/types/transaction";
import { t } from 'i18next';

export const limitStep = 10;

const tPath = 'components.table';

export const rolesForCreate = [
  Roles.admin
];

export const centeredColumns = {
  investor: [3],
  admin: [4],
  issuer: [3],
  compliance: [4]
};

export enum DetailType {
  PRODUCT = 'product',
  INVESTOR = 'investor',
  ISSUER = 'issuer',
  NONE = 'none'
}

export const theadData = (role: Roles = Roles.investor, isPageTransactions: boolean, detailType: DetailType) => {
  const retVal = [];

  retVal.push('pages.transactions.table.head.date');
  retVal.push('pages.transactions.table.head.type');
  
  const availableInvestor =  (isSuperUser(role) && isPageTransactions) || (!isPageTransactions && detailType !== DetailType.INVESTOR && detailType !== DetailType.NONE);
  const availableProduct = isPageTransactions || (!isPageTransactions && detailType !== DetailType.PRODUCT && detailType !== DetailType.NONE);
  
  if (availableInvestor) retVal.push('pages.transactions.table.head.investor');

  if (availableProduct) retVal.push('pages.transactions.table.head.product');

  retVal.push('pages.transactions.table.head.amount');
  retVal.push('pages.transactions.table.head.status');

  return retVal;
};

export enum TransactionColor {
  DEFAULT = 'default',
  PAYMENT = 'gray',
  BUY = 'green',
  SELL = 'red'
}

export const transactionTypes = [
  {
    value: TransactionType.BUY,
    label: `${tPath}.transactions.type.buy`
  },
  {
    value: TransactionType.SELL,
    label: `${tPath}.transactions.type.sell`
  },
  {
    value: TransactionType.PAYMENT,
    label: `${tPath}.transactions.type.payment`
  }
];

export const createTransactionsExportData = ( data: CreateTransactonResponse[], role: Roles, isPageTransactions: boolean, detailType: DetailType ) => {

  if (!data) return [];

  let exportData = [];

  exportData = data.map((x: CreateTransactonResponse) => {
    
    const date =  x.createdAt ? formatDate(x.createdAt!) : 'N/A';

    const investor = isNaturalPerson(x.investor) ?
    `${x.investor.firstName} ${x.investor.lastName}` :
    x.investor?.companyName;

    const type = t(`${tPath}.transactions.type.${getTransactionType(x).toLowerCase()}`);
    
    const product = x.product.name;

    const amount = getTransactionTotalPrice(x).toString();

    const status = x.status || Status.processing;

    const availableInvestor =  (isSuperUser(role) && isPageTransactions) || (!isPageTransactions && detailType !== DetailType.INVESTOR && detailType !== DetailType.NONE);
    const availableProduct = isPageTransactions || (!isPageTransactions && detailType !== DetailType.PRODUCT && detailType !== DetailType.NONE);
    
    let retValue = {};
  
    if (availableInvestor) {
      if (availableProduct) {
        retValue = {
          date: date,
          investor: investor,
          type: type,
          product: product,
          amount: amount,
          status: status
        };
      } else {
        retValue = {
          date: date,
          investor: investor,
          type: type,
          amount: amount,
          status: status
        };
      }
    } else {
      if (availableProduct) {
        retValue = {
          date: date,
          type: type,
          product: product,
          amount: amount,
          status: status
        };
      } else {
        retValue = {
          date: date,
          type: type,
          amount: amount,
          status: status
        };
      }
    }

    return retValue;
  });

  return exportData;
};

export const createTransactionsRows = (
  data: CreateTransactonResponse[],
  role: Roles = Roles.investor,
  onOpenTransactionDetails: (id: string) => void,
  isPageTransactions: boolean,
  detailType: DetailType
): Row[] => {
  return data.map((x: CreateTransactonResponse) => {
    const date = x.createdAt ? formatDate(x.createdAt!) : 'N/A';

    const rowData = {
      type: TableCellTypes.ROW_DATA,
      value: x.id || "",
      rowData: {
        callback: () => onOpenTransactionDetails(x.id!),
      }
    };

    const investorColumnValue = isNaturalPerson(x.investor) ?
      `${x.investor.firstName} ${x.investor.lastName}` :
      x.investor?.companyName;

    const investorColumnOnClick = isSuperUser(role) ? { onClick: `/investor/${x.investor.id}` } : {};

    const investorName = {
      type: TableCellTypes.STRING,
      value: investorColumnValue,
      ...investorColumnOnClick
    };

    const transactionDate = {
      type: TableCellTypes.DATE,
      value: date
    };

    const transactionType = getTransactionType(x);
    const type = {
      type: TableCellTypes.COLORED_STRING,
      value: t(`${tPath}.transactions.type.${transactionType.toLowerCase()}`),
      color: getColorForColoredString(transactionType)
    };

    const productName = x.product.name;
    const withTooltip = productName.length > MAX_VALUE_LENGTH;

    const product = {
      type: TableCellTypes.STRING,
      value: productName,
      withTooltip
    };

    const amount = {
      type: TableCellTypes.CURRENCY,
      value: getTransactionTotalPrice(x).toString()
    };

    const status = {
      type: TableCellTypes.STATUS,
      value: t(
        `${tPath}.status.${(x.status || Status.processing).toLowerCase()}`
      ),
      status: x.status || Status.processing,
    };

    const tableRows = [];

    tableRows.push(transactionDate);
    tableRows.push(type);

    const availableInvestor =  (isSuperUser(role) && isPageTransactions) || (!isPageTransactions && detailType !== DetailType.INVESTOR && detailType !== DetailType.NONE);
    const availableProduct = isPageTransactions || (!isPageTransactions && detailType !== DetailType.PRODUCT && detailType !== DetailType.NONE);
    
    if (availableInvestor) tableRows.push(investorName);

    if (availableProduct) tableRows.push(product);

    tableRows.push(amount);
    tableRows.push(status);
    tableRows.push(rowData);
  
    return tableRows as TableCell[];
  });
};

type TypeMappingTransactionsCategory = {
  [key in TransactionStatus]: string;
} & { [all:string]: string };


export const MappingTransactionCategory: TypeMappingTransactionsCategory = {
  Processing: "pages.transactions.transactionsCategory.processing",
  Processed: "pages.transactions.transactionsCategory.processed",
  Failed: "pages.transactions.transactionsCategory.failed",
  Rejected: "pages.transactions.transactionsCategory.rejected",
  all: "pages.transactions.transactionsCategory.all"
};
