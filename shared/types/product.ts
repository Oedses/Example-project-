import { Status } from "./common";
import { Holding } from "./holding";
import { Issuer } from "./issuer";
import { Transaction } from "./transaction";
import { User } from "./user";

export enum PaymentType {
  DIVIDEND = 'Dividend',
  INTEREST = 'Interest',
}

export enum PaymentFrequency {
  QUARTERLY = 'Quarterly',
  BIANNUALLY = 'Biannually',
  ANNUALLY = 'Annually'
}

export enum ProductCategory {
  Bond = 'Bond',
  Certificate = 'Certificate',
  Share = 'Share',
}

export enum DateUnits {
  months = 'months',
  years = 'years'
}

type GetProductResponse = { count: number, data: Product[], totals: {count: number, category: ProductCategory}[] };

type DividendProduct = {
  id?: string
  name: string
  issuer: Pick<Issuer, 'id' | 'name'> | string
  category: ProductCategory
  availableVolume?: number | null
  realAvailableVolume?: number
  processingAvailableVolume?: number,
  quantity: number
  ticketSize: number
  paymentType: PaymentType | string
  paymentFrequency: PaymentFrequency | string
  listingDate: Date | undefined
  status?: Status
  createdAt?: Date
  isRequestDeactivate?: boolean
};

type InterestProduct = {
  couponRate: number | null
  maturity: number | null
  maturityUnit: DateUnits | null
  nonCallPeriod: number | null
  nonCallPeriodUnit: DateUnits | null
  depository: string
  isin: string
} & DividendProduct

type ProductsListRequest = {
  skip: string
  limit: string
  name?: string
  categories: string,
  status?: Status
  isRealAvailableVolume?: string
  isBought?: string
  issuer?: string
  paymentType?: PaymentType
  startCouponRate?: number
  endCouponRate?: number
}

type ProductFilters = {
  paymentType: ProductFiltersPaymentType | undefined;
  issuer: ProductFiltersIssuer | undefined;
  startCouponRate: number | undefined;
  endCouponRate: number | undefined;
}

type ProductFiltersPaymentType ={
  id: string 
  name: string
}

type ProductFiltersIssuer ={
  id: string 
  name: string
}


type GetProductRequest = {
  id: string;
}

type RequestBuy = {
  product: {
    id: string
    name: string,
    quantity: number,
    ticketSize: number,
    availableVolume: number
  }
  investor: {
    id: string
    name: string
  }
  amount: number | string
}

type Product = DividendProduct | InterestProduct;

type ComplexProduct = {
  holdings?: Holding[]
  productHoldings: Holding[]
  totals: {
    totalVolume: number
    volumeSold: number
    availableVolume: number
    totalHoldingsVolume?: number
    reservedAmount?: number
  }
} & Product

export const isDividendProduct = (x: unknown): x is DividendProduct => {
  return ((x as DividendProduct).paymentType === PaymentType.DIVIDEND);
};

export const isInterestProduct = (x: unknown): x is InterestProduct => {
  return ((x as InterestProduct)?.paymentType === PaymentType.INTEREST);
};

export const isProduct = (x: unknown): x is Product => {
  return Boolean((x as Product)?.paymentType);
}
export const isHolding = (x: unknown): x is Holding => {
  return Boolean((x as Holding)?.amountReceived);
}

export type createProductValidationFields = {
  name: string,
  issuer: string,
  category: string,
  ticketSize: string,
  paymentType: string,
  paymentFrequency: string,
  listingDate: string,
  couponRate: string,
  maturity: string,
  nonCallPeriod: string,
  depository: string,
  isin: string,
  quantity: string,
};

export type { Product, DividendProduct, InterestProduct, ProductsListRequest,
  GetProductResponse, GetProductRequest, ComplexProduct, RequestBuy, ProductFilters, ProductFiltersIssuer };
