import Joi, { ValidationResult } from 'joi';
import { ObjKeyValue } from '../../../shared/types/common';

import { Transaction, CreateTransactionRequest, TransactionsListRequest, TransactionType, TransactionFiltersDataResponse } from '../../../shared/types/transaction';
import { User } from '../../../shared/types/user';

export interface ITransactionRepository {
  create(data: CreateTransactionRequest): Promise<Transaction>
  find(data: Partial<Transaction>, filters?: ObjKeyValue): Promise<(CreateTransactionRequest | Transaction)[]>
  getTransactionsList(query: TransactionsListRequest & { userId: string }): Promise<{ count: number, data: Transaction[] }>
  getFiltersData(user: User): Promise<TransactionFiltersDataResponse>
}

export function validateCreateTransaction(x: any): ValidationResult<CreateTransactionRequest> | false {

  if (x.type === TransactionType.BUY) return Joi.object({
    type: Joi.string().required(),
    product: Joi.string().required(),
    investor: Joi.string().required(),
    quantity: Joi.number().positive().required(),
  }).validate(x, { stripUnknown: true });

  if (x.type === TransactionType.PAYMENT) return Joi.object({
    type: Joi.string().required(),
    product: Joi.string().required(),
    investors: Joi.array().required(),
    amount: Joi.number().positive().required(),
    paymentType: Joi.string().required(),
  }).validate(x, { stripUnknown: true });

  if (x.type === TransactionType.SELL && !x.returnTokens) return Joi.object({
    type: Joi.string().required(),
    product: Joi.string().required(),
    investor: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    receiver: Joi.string().required(),
    returnTokens: Joi.boolean().optional()
  }).validate(x, { stripUnknown: true });

  if (x.type === TransactionType.SELL && x.returnTokens) return Joi.object({
    type: Joi.string().required(),
    product: Joi.string().required(),
    investor: Joi.string().required(),
    issuer: Joi.string().required(),
    returnTokens: Joi.boolean().required()
  }).validate(x, { stripUnknown: true });

  return false;
}

export function validateTransactionsListRequest(x: any): ValidationResult<TransactionsListRequest> | false {
  return Joi.object({
    skip: Joi.string().required(),
    limit: Joi.string().required(),
    type: Joi.string().optional(),
    investor: Joi.string().optional(),
    issuer: Joi.string().optional(),
    product: Joi.string().optional(),
    status: Joi.string().optional(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    startAmount: Joi.number().positive().allow(0),
    endAmount: Joi.number().positive().allow(0),
  }).validate(x, { stripUnknown: true });
}