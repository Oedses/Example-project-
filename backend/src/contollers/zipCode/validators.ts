import { ValidationResult } from 'joi';
import { Context } from 'koa';
import { GetSearchCodesRequest } from '../../../../shared/types/zipCode';
import { validateGetSearchCodesRequest } from '../../domains/zipCode';


export function getSearchCodesRequest(ctx: Context): ValidationResult<GetSearchCodesRequest> {
  return validateGetSearchCodesRequest(ctx.query);
}
