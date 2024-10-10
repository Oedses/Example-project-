import Joi, { ValidationResult } from "joi";
import { GetSearchCodesRequest } from "../../../shared/types/zipCode";


export interface IUserRepository {
  getSearchCodes(): Promise<any>,
}

export function validateGetSearchCodesRequest(x: any): ValidationResult<GetSearchCodesRequest> {
  return Joi.object({
    codes: Joi.string().required(),
    countryCode: Joi.string().empty(['', null]).default('')
  }).validate(x);
}