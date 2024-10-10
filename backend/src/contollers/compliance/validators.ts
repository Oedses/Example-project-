import { ValidationResult } from 'joi';
import { Context } from 'koa';
import { ComplianceListRequest, RejectComplianceRequest } from '../../../../shared/types/compliance';
import { validateComplianceList, validateRejectCompliance } from '../../domains/compliance';

export function complianceListRequest(ctx: Context): ValidationResult<ComplianceListRequest>{
  return validateComplianceList(ctx.query);
}

export function rejectComplianceRequest(ctx: Context): ValidationResult<RejectComplianceRequest>{
  return validateRejectCompliance(ctx.request.body);
}
