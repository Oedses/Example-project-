import { isInterestProduct, Product } from "../../../shared/types/product";
import { DUTCH_HOLIDAYS } from "../constants/common";

export const getEmailFirstPart = (email: string) => email.slice(0, email.indexOf('@'));

export const formatDate = (date: Date): string => {
  if (!date) return 'N/A';

  const resultDate = `${date.getFullYear()}-${(date.getMonth() + 1) < 10 ? 0 : ''}${date.getMonth() + 1}-${date.getDate() < 10 ? 0 : ''}${date.getDate()}`;

  return resultDate;
};

export const getCountOfDatesForPeriod = (from: Date, to: Date) => {
  const diff = new Date(to).getTime() - new Date(from).getTime();

  // To calculate the no. of days between two dates
  const count = diff / (1000 * 3600 * 24);

  return count;
};

export const getProductNonCallPeriod = (product: Product): Date | null => {
  let nonCallPeriod: Date | null = null;

  if (isInterestProduct(product)) {
    const newDate = new Date();

    const dateYear =
      product.nonCallPeriodUnit === "years"
        ? newDate.getFullYear() + product.nonCallPeriod!
        : newDate.getFullYear();

    const dateMonths =
      product.nonCallPeriodUnit === "months"
        ? newDate.getMonth() + product.nonCallPeriod!
        : newDate.getMonth();

    nonCallPeriod = new Date(
      dateYear,
      dateMonths,
      newDate.getDate()
    );
  }

  return nonCallPeriod;
};

export const getDutchHolidays = (year: number) => {
  return DUTCH_HOLIDAYS.map(x => new Date(Date.UTC(year, x[0], x[1])));
};

export const formatTemplate = (t, data) => {
  return t.replace(/\$\{(.+?)\}/g, (_, key) => data[key] || '');
};

export const createSeparatorsNumber = (value: any) => {
  return `${Number(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

type DateQuarterResult = {
  startFullQuarter: Date
  endFullQuarter: Date
};

export const getDateQuarter = (previous?: boolean): DateQuarterResult  => {
  const today = new Date();

  const currentQuarter = Math.floor((today.getMonth() / 3));
  const year = currentQuarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
  let startFullQuarter: Date;
  let endFullQuarter: Date;

  if (previous) {
    const previousQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;

    startFullQuarter = new Date(Date.UTC(year, previousQuarter * 3, 1));
    endFullQuarter = new Date(new Date(Date.UTC(year, startFullQuarter.getMonth() + 3, 0)).setUTCHours(23, 59, 59));

  } else {
    startFullQuarter = new Date(Date.UTC(year, currentQuarter * 3, 1));
    endFullQuarter = new Date(Date.UTC(startFullQuarter.getFullYear(), startFullQuarter.getMonth() + 3, 0));
  }

  return {
    startFullQuarter,
    endFullQuarter
  };
};
