import { ParameterizedContext } from 'koa';
import Router from 'koa-router';
import { accessChecker, auth, validate } from '../../middlewares';
import { createTransactionRequest, getTransactionsListRequest } from './validators';
import TransactionService from '../../services/transactions';
import { CreateTransactionRequest, TransactionsListRequest } from '../../../../shared/types/transaction';
import { Roles } from '../../../../shared/types/common';


export default class TransactionsController {

  readonly service: TransactionService;

  constructor(transactionService: TransactionService) {
    this.service = transactionService;
  }

  createTransaction = async (ctx: ParameterizedContext): Promise<void> => {
    const { body, user } = ctx.state;
    ctx.body = await this.service.createTransaction(body, user);
  };

  getTransactionsList = async (ctx: ParameterizedContext): Promise<void> => {
    const { body, authInfo } = ctx.state;
    ctx.body = await this.service.getTransactionsList({ ...body, userId: authInfo.oid });
  };

  getFiltersData = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.getFiltersData(ctx.state.user);
  };

  get router(): Router {
    return new Router()
      .post(
        '/',
        accessChecker([Roles.admin, Roles.investor]),
        validate<CreateTransactionRequest>(createTransactionRequest),
        this.createTransaction
      )
      .get(
        '/',
        validate<TransactionsListRequest>(getTransactionsListRequest),
        this.getTransactionsList
      )
      .get(
        '/filters-data',
        this.getFiltersData
      );
  }
}
