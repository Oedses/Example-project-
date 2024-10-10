import Joi, { ValidationResult } from "joi";
import { Collection } from "mongodb";
import { ComplianceFiltersDataResponse, ComplianceListRequest } from "../../../shared/types/compliance";
import { ComplianceLogItem } from "../../../shared/types/common";
import { Pageable } from "../../../shared/types/response";

export interface IComplianceRepository {
  collection: Collection<ComplianceLogItem>

  findOneById(id: ComplianceLogItem['id']): Promise<ComplianceLogItem | null>

  create(data: ComplianceLogItem): Promise<void>

  list(query: ComplianceListRequest): Promise<Pageable<ComplianceLogItem>>

  getFiltersData(): Promise<ComplianceFiltersDataResponse>
  
  update(data: ComplianceLogItem): Promise<void>
}

export function validateComplianceList(x: unknown): ValidationResult<any> {
  return Joi.object({
    skip: Joi.number().positive().allow(0).required(),
    limit: Joi.number().positive().allow(0).required(),
    status: Joi.string().optional(),
    relatedUserId: Joi.string().optional(),
    actionType: Joi.string().optional(),
    relatedTo: Joi.string().optional(),
    startDate: Joi.date(),
    endDate: Joi.date()
  }).validate(x);
}

export function validateRejectCompliance(x: unknown): ValidationResult<any> {
  return Joi.object({
    reason: Joi.string().required(),
  }).validate(x);
}
