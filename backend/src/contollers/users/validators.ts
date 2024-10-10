import { ValidationResult } from 'joi';
import { Context } from 'koa';
import { InvestorsListRequest } from '../../../../shared/types/investor';
import { IssuerOverviewRequest, IssuersListRequest } from '../../../../shared/types/issuer';
import { AssignRoleRequest, DeleteUserRequest, ChangeEmailRequest, GetUserRequest, ChangePasswordRequest, ChangePhoneRequest, User } from '../../../../shared/types/user';
import { CheckVerificationCodeRequest } from '../../../../shared/types/verification-code';
import { validateGetUserRequest, validateAssignRoleRequest,
  validateDeleteUserRequest, validateCreateUser, validateInvestorsListRequest, validateIssuersListRequest, validateIssuerOverviewRequest, validateUpdateUser, validateChangeEmail, validateChangePhone, validateChangePassword, validateCheckVerificationCode } from '../../domains/users';

export function getUserRequest(ctx: Context): ValidationResult<GetUserRequest> {
  return validateGetUserRequest(ctx.query);
}

export function createUserRequest(ctx: Context): ValidationResult<User> | false {
  return validateCreateUser(ctx.request.body);
}

export function updateUserRequest(ctx: Context): ValidationResult<User> | false {
  return validateUpdateUser(ctx.request.body);
}

export function changeEmailRequest(ctx: Context): ValidationResult<ChangeEmailRequest> {
  return validateChangeEmail(ctx.request.body);
}

export function changePhoneRequest(ctx: Context): ValidationResult<ChangePhoneRequest> {
  return validateChangePhone(ctx.request.body);
}

export function changePasswordRequest(ctx: Context): ValidationResult<ChangePasswordRequest> {
  return validateChangePassword(ctx.request.body);
}

export function checkVerificationCodeRequest(ctx: Context): ValidationResult<CheckVerificationCodeRequest> {
  return validateCheckVerificationCode(ctx.request.body);
}

export function getInvestorsListRequest(ctx: Context): ValidationResult<InvestorsListRequest> {
  return validateInvestorsListRequest(ctx.query);
}

export function deleteUserRequest(ctx: Context): ValidationResult<DeleteUserRequest> {
  return validateDeleteUserRequest(ctx.params);
}

export function assignRoleRequest(ctx: Context): ValidationResult<AssignRoleRequest> {
  return validateAssignRoleRequest(ctx.request.body);
}

export function getIssuersListRequest(ctx: Context): ValidationResult<IssuersListRequest> {
  return validateIssuersListRequest(ctx.query);
}

export function getIssuerOverviewRequest(ctx: Context): ValidationResult<IssuerOverviewRequest> {
  return validateIssuerOverviewRequest(ctx.query);
}
