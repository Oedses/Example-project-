import { t } from 'i18next';
import { Modify } from '../../../../../../shared/types/common';
import { Issuer } from '../../../../../../shared/types/issuer';
import {
  createProductValidationFields,
  DateUnits,
  PaymentFrequency,
  PaymentType,
  Product,
  ProductCategory,
} from '../../../../../../shared/types/product';

export type CreateProductRequest = Modify<Product, {
  issuer: string;
  listingDate: Date | string;
}>;

export const defaultValues: Product = {
  name: '',
  issuer: {
    id: '',
    name: ''
  },
  category: ProductCategory.Certificate,
  ticketSize: 0,
  quantity: 0,
  availableVolume: null,
  paymentType: PaymentType.DIVIDEND,
  paymentFrequency: PaymentFrequency.QUARTERLY,
  listingDate: undefined,
  couponRate: null,
  maturity: null,
  maturityUnit: DateUnits.years,
  nonCallPeriod: null,
  nonCallPeriodUnit: DateUnits.years,
  depository: '',
  isin: ''
};

export const defaultErrors: createProductValidationFields = {
  name: '',
  issuer: '',
  category: '',
  quantity: '',
  ticketSize: '',
  paymentType: '',
  paymentFrequency: '',
  listingDate: '',
  couponRate: '',
  maturity: '',
  nonCallPeriod: '',
  depository: '',
  isin: ''
};

export const createIssuersOptions = (data: Issuer[]) => {
  return data.map(issuer => ({
    value: issuer.id as string, label: issuer.name
  }));
};

export const translateLabels = (items: { value: any; label: string }[]) => items.map((item) => ({ ...item, label: t(item.label) }));

export const categories = [
  { value: ProductCategory.Certificate, label: 'pages.products.form.categories.certificate' },
  { value: ProductCategory.Bond, label: 'pages.products.form.categories.bond' },
  { value: ProductCategory.Share, label: 'pages.products.form.categories.share' }
];

export const dividentPayment = [
  { value: PaymentType.DIVIDEND, label: 'pages.products.form.paymentTypes.dividend' },
];

export const interestPayment = [
  { value: PaymentType.INTEREST, label: 'pages.products.form.paymentTypes.interest' }
];

export const paymentFrequencies = [
  { value: PaymentFrequency.QUARTERLY, label: 'pages.products.form.paymentFrequences.quarterly' },
  { value: PaymentFrequency.BIANNUALLY, label: 'pages.products.form.paymentFrequences.biannually' },
  { value: PaymentFrequency.ANNUALLY, label: 'pages.products.form.paymentFrequences.annually' }
];

export const maturityUnits = [
  { value: DateUnits.years, label: 'years' },
  { value: DateUnits.months, label: 'months' }
];

export const nonCallPeriodUnits = [
  { value: DateUnits.years, label: 'years' },
  { value: DateUnits.months, label: 'months' }
];

export const positiveNumbers = ['couponRate', 'nonCallPeriod', 'maturity'];
export const freeTextFields = ['depository'];
export const alphanumericFields = ['isin'];
