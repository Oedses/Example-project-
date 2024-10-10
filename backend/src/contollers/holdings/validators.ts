import { ValidationResult } from 'joi';
import { Context } from 'koa';
import { Holding, HoldingsListRequest } from '../../../../shared/types/holding';
import { validateCreateHolding, validateHoldingsListRequest } from '../../domains/holdings';

export type CreateHoldingRequest = {
  body: Holding
};

export function createHoldingRequest(ctx: Context): ValidationResult<Holding> | false{
  return validateCreateHolding(ctx.request.body);
}

export function getHoldingsListRequest(ctx: Context): ValidationResult<HoldingsListRequest> | false {
  return validateHoldingsListRequest(ctx.query);
}