import { t } from "i18next";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { SortingDirection } from "../views/components/UI/Table/Table.utils";
import {
  ComplianceLogAction,
  ComplianceLogItem,
  Entities,
  Roles,
} from "../../../shared/types/common";
import { Holding } from "../../../shared/types/holding";
import {
  isInterestProduct,
  PaymentFrequency,
  Product,
  ProductCategory,
} from "../../../shared/types/product";
import { Query } from "../../../shared/types/response";
import {
  CreateTransactionFormValues,
  CreateTransactonResponse,
  PaymentType,
  Transaction,
  TransactionType,
} from "../../../shared/types/transaction";
import { BaseUser } from "../../../shared/types/user";
import { isLegalEntity, isNaturalPerson } from "../../../shared/types/investor";

export const delay = (() => {
  let timer = 0;
  return function (callback: () => void, ms: number) {
    clearTimeout(timer);
    timer = window.setTimeout(callback, ms);
  };
})();

export const capitalize = (str: string): string =>
  `${str?.charAt(0).toUpperCase()}${str?.slice(1)}`;

export const getLastElement = <T>(arr: T[]): T => arr[arr?.length - 1];

export const getDecimalNumber = (number: number) => +number.toFixed(2);

type clearFromEmptyObject = {
  [key: string]: any;
};
export const clearFromEmpty = <T extends clearFromEmptyObject>(values: T): T =>
  Object.fromEntries(
    Object.entries(values).filter(([key, value]) => key && value != undefined)
  ) as T;

export const numberWithCommas = (x: number): string =>
  x ? x.toLocaleString("en") : "0";

export const toCamelCase = (value: string): string => {
  const splittedValue = value.split(" ");

  if (splittedValue.length === 1)
    return `${splittedValue[0]
      .substring(0, 1)
      .toLowerCase()}${splittedValue[0].slice(1)}`;

  return splittedValue
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
    .join("");
};

export const decryptCamelCase = (str: string) =>
  str ? str.replace(/([a-z])([A-Z])/g, "$1 $2") : str;

export const formatDate = (
  date: string | Date | undefined,
  withTime: boolean = false,
  withTimeZone: boolean = false
): string => {
  if (!date) return "N/A";

  const [dateDate] = date.toString().split("T");

  if (!dateDate) return "N/A";

  const [year, month, day] = dateDate.split("-");

  let resultDate = withTimeZone
    ? `${year}-${month}-${day}T00:00:00.000Z`
    : `${day}-${month}-${year}`;

  if (withTime) {
    const gmtDate = new Date(date);
    const hours = gmtDate.getHours() > 9 ? gmtDate.getHours() : `0${gmtDate.getHours()}`;
    const minutes = gmtDate.getMinutes() > 9 ? gmtDate.getMinutes() : `0${gmtDate.getMinutes()}`;

    resultDate += ` ${hours}:${minutes}`;
  }

  return resultDate;
};

export const isInvestor = (role: Roles) => role === Roles.investor;

export const isSuperUser = (role: Roles) => [Roles.admin, Roles.compliance].includes(role);

export const isProduct = (product?: Product | Holding): product is Product =>
  Boolean((product as Product)?.paymentType);

export const isHolding = (product?: Product | Holding): product is Holding =>
  Boolean((product as Holding)?.product);

export const showDeltaPercents = (
  curr: number,
  prev: number
): number | null => {
  if (!prev || !curr) return null;

  const delta = curr - prev;
  const percent = (delta / curr) * 100;
  return getDecimalNumber(percent);
};

export const getProductTotalAmount = (product: Product | Holding): number => {
  if (!product?.quantity) return 0;

  if (product.availableVolume)
    return product.availableVolume! * product.ticketSize!;

  return product.quantity! * product.ticketSize!;
};

export const getProductRealTotalAmount = (product: Product | Holding): number => {
  if (product.realAvailableVolume)
    return product.realAvailableVolume! * product.ticketSize!;

  return getProductTotalAmount(product);
};

type GetTransactionTotalPrice =
  | Transaction
  | CreateTransactionFormValues
  | CreateTransactonResponse;
export const getTransactionTotalPrice = (
  transaction: GetTransactionTotalPrice
): number => {
  if (transaction.type === TransactionType.PAYMENT)
    return Number(transaction.amount) || 0;

  if (!transaction.ticketSize || !transaction.quantity) return 0;

  return Number(transaction.ticketSize) * transaction.quantity;
};

const getPaymentFrequency = (paymentFrequency: PaymentFrequency): number => {
  switch (paymentFrequency) {
    case PaymentFrequency.ANNUALLY:
      return 1;
    case PaymentFrequency.BIANNUALLY:
      return 2;
    case PaymentFrequency.QUARTERLY:
      return 4;
    default:
      return 1;
  }
};

export const getAmountPrice = (product: Product, paymentType: PaymentType): number => {
  const ticketSize = Number(product?.ticketSize) || 0;
  const totalAmount = ticketSize * (product.quantity - (product.availableVolume || 0));

  let couponRate = 1;
  const frequency = getPaymentFrequency(product.paymentFrequency as PaymentFrequency);

  if (isInterestProduct(product) && Number(product?.couponRate) > 0) {
    if ([PaymentType.GENERIC, PaymentType.INTEREST].includes(paymentType)) {
      couponRate = product?.couponRate! / 100;
    }
  }

  if (product.category === ProductCategory.Share) {
    return 0;
  }

  if (product.category === ProductCategory.Bond) {
    if (paymentType === PaymentType.GENERIC) {
      return 0;
    }

    if (paymentType === PaymentType.INTEREST) {
      return (totalAmount * couponRate) / frequency;
    }

    if (paymentType === PaymentType.REPAYMENT) {
      return totalAmount;
    }
  }

  return ticketSize;
};

export const createQueryString = (query: Query) => {
  if (!query) return "";

  return Object.entries(query)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([key, value]) => value !== '')
    .reduce(
    (acc, [key, value]) => `${acc}&${key}=${value}`,
    "");
};

export const transpose = (matrix: number[][]): number[][] => {
  let [row] = matrix;

  if (!row) return [];

  return row
    .map((_, column) => matrix.map((item) => item[column]))
    .filter((item) => item.every((num) => num != undefined));
};

export const disableScroll = () => {
  document.body.classList.add("disabled");
};

export const enableScroll = () => {
  document.body.classList.remove("disabled");
};

export const translate = (values: string[]) => {
  if (!values) return [];

  return values.map((item) => t(item));
};

export const translateString = (value: string) => t(value);

export const summ = (values: number[]) =>
  values.reduce((acc, curr) => acc + curr, 0);

export const trimObject = <T extends Object>(data: T): T => {
  const result = { ...data };

  Object.keys(result).forEach((key) => {
    if (typeof (result[key as keyof T] as any) === "string")
      (result[key as keyof T] as any) = (result[key as keyof T] as any).trim();
  });

  return result;
};

export const getUrlComplianceLog = (
  item: ComplianceLogItem
): string | undefined => {
  const { action, requestedBy, creator } = item;

  switch (action.entity) {
    case "User":
    case "Issuer":
    case "Investor": {
      if (requestedBy && requestedBy.role !== Roles.admin && action.id) {
        if (action.id === creator.id && creator.type === Entities.admin) {
          return undefined;
        }
        return `/${requestedBy.role}/${action.id}`;
      }
      return undefined;
    }
    case "Product":
    case "Transaction": {
      if (action.id) {
        return `/products/${action.id}`;
      }
      return undefined;
    }
  }
};

export const summToRight = (data: number[]) => {
  let prevSumma = 0; 
  return data.map((item, index) => {
    prevSumma += (index > 0 ? data[index - 1] : 0);
    return item + prevSumma;
  });
};


export const getTransactionType = (
  transaction: Transaction | CreateTransactonResponse,
  id?: string
): TransactionType | PaymentType => {
  const compareId = id || localStorage.getItem("userId");

  const isReceiverEqualsCurrent =
    transaction?.receiver && transaction?.receiver === compareId;

  if (transaction.type === TransactionType.SELL && isReceiverEqualsCurrent)
    return TransactionType.BUY;

  if (transaction.type === TransactionType.PAYMENT && transaction.paymentType) {
    return transaction.paymentType as PaymentType;
  }

  return transaction.type as TransactionType;
};

export const createSeparatorsNumber = (value: any) => {
  return `${Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const createSeparatorsQuantityNumber = (value: any) => {
  return `${Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const getError = (message: string) => {
  if (!message) return "";

  const splitErrorSymbol = '"';
  if (message.substring(0, 1) !== splitErrorSymbol) return [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, errorField, errorMessage] = message.split(splitErrorSymbol);

  if (!errorField) return [];

  const errMessage = [
    errorMessage.trim().slice(0, 1).toUpperCase(),
    errorMessage.trim().slice(1),
  ].join("");

  return [toCamelCase(errorField), errMessage];
};

export const getErrorMessageName = (stack: string) => {
  if (!stack) return "";

  const errorMessageName = stack.split(':');

  return errorMessageName[0];
};

type InterestReceived = {
  holding: Holding,
  product: Product,
  paymentType: PaymentType,
  amount: number
};

export const getInterestReceived = ({ holding, product, paymentType, amount }: InterestReceived): number => {
  const countOfSoldTickets = product.quantity - product.availableVolume!;
  const dividendForOneTicket = amount / countOfSoldTickets;

  if (isInterestProduct(product)) {
    if (paymentType === PaymentType.INTEREST && Number(product?.couponRate) > 0) {
      const couponRate = (Number(product.couponRate) > 0 ? product.couponRate! : 1) / 100;
      return (holding.availableVolume * holding.ticketSize * couponRate) / getPaymentFrequency(product.paymentFrequency as PaymentFrequency);
    }

    if (paymentType === PaymentType.REPAYMENT) {
      return (holding.availableVolume * holding.ticketSize) - (holding.amountRepaid || 0);
    }
  }

  if ([PaymentType.DIVIDEND, PaymentType.GENERIC].includes(paymentType)) {
    return holding.availableVolume * dividendForOneTicket;
  }

  return 0;
};

export const getOutstandingCapital = (holding: Holding): number => {
  const outstandingCapital = getProductTotalAmount(holding) - (holding.amountRepaid || 0);

  return outstandingCapital;
};

export const sortDate = (dateCurr: Date | string, dateNext: Date | string, direction: SortingDirection) => {
  if (!dateCurr || !dateNext) return 0;

  const [curr, next] = direction === SortingDirection.descending ? [dateCurr, dateNext] : [dateNext, dateCurr];

  return new Date(curr).getDate() - new Date(next).getDate();
};

export const getActionNameValue = (action: ComplianceLogAction): string => 
  toCamelCase(action?.paymentType || action.name);

export const exportToXLSX = (csvData: any, fileName: string) => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const ws = XLSX.utils.json_to_sheet(csvData);
  ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];
  const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

export const getDisplayName = (data: BaseUser | Partial<BaseUser>): string => {
  if (isNaturalPerson(data) || [Roles.admin, Roles.compliance].includes(data.role!)) return `${data.firstName} ${data.lastName}`;
  if (data.role! === Roles.issuer && data.name) return data.name;
  if (isLegalEntity(data)) return data.companyName;
  return '';
};