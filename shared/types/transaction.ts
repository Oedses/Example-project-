import { Product } from './product';
import { Modify, Status } from './common';

import { Investor, InvestorType } from './investor';

export enum TransactionType {
  BUY = 'Buy',
  SELL = 'Sell',
  PAYMENT = 'Payment',
}

export enum PaymentType {
  INTEREST = 'Interest',
  REPAYMENT = 'Repayment',
  GENERIC = 'Generic',
  DIVIDEND = 'Dividend'
}

export type BasicData = {
  id: string,
  name: string,
};

type TransactionBase = {
  id?: string
  type: TransactionType | string
  paymentType?: PaymentType,
  quantity?: number
  amount?: number | string
  createdAt?: Date
  status?: TransactionStatus
  ticketSize?: number
}

type CreateTransactonResponse = TransactionBase & {
  product: Product
  investor: Investor
  receiver: Investor
  issuer?: string
};

type CreateTransactionRequest = TransactionBase & {
  product?: string
  holding?: string
  investor: string
  investors?: string[]
  receiver?: string
  issuer?: string
  returnTokens?: boolean
}

type CreateTransactionFormValues = Modify<CreateTransactionRequest, {
  type: TransactionType,
  paymentType?: PaymentType,
  product : {
    status?: Status,
    quantity?: number,
    realAvailableVolume?: number,
    availableVolume?: number,
    ticketSize?: number,
    paymentFrequency?: string
  } & BasicData,
  investor: BasicData,
  investors?: string[],
  receiver: BasicData,
  isReturnTokens?: boolean;
}>;

type Transaction = {
  id: string
  type: TransactionType
  paymentType?: PaymentType,
  product: BasicData
  issuer: BasicData
  investor: Partial<Investor>
  quantity?: number | null
  receiver: Partial<Investor> | string
  createdAt: Date
  amount?: number | string
  ticketSize: number
  status?: TransactionStatus
  transactionHash?: string
}

type TransactionsListRequest = {
  skip: string
  limit: string
  type?: TransactionType & PaymentType
  issuer?: string
  investor?: string
  product?: string,
  status?: TransactionStatus
  startDate?: Date
  endDate?: Date
  startAmount: number
  endAmount: number
}

export type TransactionFilters = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  investor: TransactionFiltersInvestor | undefined;
  type: TransactionFiltersType | undefined;
  product: TransactionFiltersProducts | undefined;
  status: TransactionFiltersStatus | undefined;
}

export enum TransactionStatus {
  processing = 'Processing',
  processed = 'Processed',
  failed = "Failed",
  rejected = "Rejected"
}

export type TransactionFiltersInvestors = {
  id: string 
  firstName?: string
  lastName?: string
  companyName?: string
  type?: InvestorType
}

export type TransactionFiltersProducts = {
  id: string 
  name: string
}

export type TransactionFiltersInvestor = {
  id: string 
  name: string
}

export type TransactionFiltersStatus = {
  id: string 
  name: string
}

export type TransactionFiltersType = {
  id: string 
  name: string
}

export type TransactionFiltersDataResponse = {
  investors: TransactionFiltersInvestors[]
  products: TransactionFiltersProducts[]
}

export type {
  TransactionBase,
  Transaction,
  TransactionsListRequest,
  CreateTransactonResponse,
  CreateTransactionRequest,
  CreateTransactionFormValues
};

