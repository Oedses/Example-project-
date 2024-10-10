import { ValidationResult } from 'joi';
import { Context } from 'koa';
import { CreateTransactionRequest, TransactionsListRequest } from '../../../../shared/types/transaction';

import { validateCreateTransaction, validateTransactionsListRequest } from '../../domains/transactions';

export type TransactionRequest = {
  body: CreateTransactionRequest
};

export function createTransactionRequest(ctx: Context): ValidationResult<CreateTransactionRequest> | false{

  return validateCreateTransaction(ctx.request.body);
}

export function getTransactionsListRequest(ctx: Context): ValidationResult<TransactionsListRequest> | false {
  return validateTransactionsListRequest(ctx.query);
}