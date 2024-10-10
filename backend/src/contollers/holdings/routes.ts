import { Context } from 'koa';
import Router from 'koa-router';
import HoldingService from '../../services/holdings';
import { validate } from '../../middlewares';
import { createHoldingRequest, getHoldingsListRequest } from './validators';
import { Holding, HoldingsListRequest } from '../../../../shared/types/holding';

export default class HoldingsController {

  readonly service: HoldingService;

  constructor(productService: HoldingService) {
    this.service = productService;
  }

  createHolding = async (ctx: Context): Promise<void> => {
    const { body } = ctx.state;
    const product = await this.service.createHolding(body);
    ctx.body = product;
  };

  getHoldingsList = async (ctx: Context): Promise<void> => {
    const { body } = ctx.state;
    ctx.body = await this.service.getHoldingsList(body);
  };

  get router(): Router {
    return new Router()
      .post('/', validate<Holding>(createHoldingRequest), this.createHolding)
      .get('/', validate<HoldingsListRequest>(getHoldingsListRequest), this.getHoldingsList);
  }
}
