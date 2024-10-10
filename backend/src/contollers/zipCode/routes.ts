import { Context } from 'koa';
import Router from 'koa-router';
import { GetSearchCodesRequest } from '../../../../shared/types/zipCode';
import { validate } from '../../middlewares';
import ZipCodeService from '../../services/zipCode';
import { getSearchCodesRequest } from './validators';

export default class ZipCodeController {

  readonly service: ZipCodeService;

  constructor(zipCodeService: ZipCodeService) {
    this.service = zipCodeService;
  }

  getSearchCodes = async (ctx: Context) => {
    ctx.body = await this.service.getSearchCodes(ctx.query as GetSearchCodesRequest);
  };

  get router(): Router {
    return new Router()
      .get(
        '/search-codes',
        validate<GetSearchCodesRequest>(getSearchCodesRequest),
        this.getSearchCodes
      )
  }
}
