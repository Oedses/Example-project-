import Joi, { ValidationResult } from 'joi';
import { Collection } from 'mongodb';
import { ObjKeyValue } from '../../../shared/types/common';
import { CreateHoldingRequest, Holding, HoldingsListRequest } from '../../../shared/types/holding';
import { Pageable } from '../../../shared/types/response';

export interface IHoldingRepository {
  collection: Collection<Holding>
  create(data: CreateHoldingRequest): Promise<Holding | null>
  getHoldingsList(query: HoldingsListRequest): Promise<Pageable<Holding>>
  find(data: Partial<Holding>, filters: ObjKeyValue): Promise<Holding[]>
}

export function validateCreateHolding(x: unknown): ValidationResult<Holding> {

  return Joi.object({
    id: Joi.string().optional(),
    product: Joi.string().required(),
    investor: Joi.string().required(),
    originalAmount: Joi.number().positive().required()
  }).validate(x);
}

export function validateHoldingsListRequest(x: any): ValidationResult<HoldingsListRequest> {
  return Joi.object({
    skip: Joi.number().positive().allow(0).required(),
    limit: Joi.number().positive().allow(0).required(),
    investorId: Joi.string().required(),
    isSellList: Joi.boolean().optional(),
  }).validate(x);
}