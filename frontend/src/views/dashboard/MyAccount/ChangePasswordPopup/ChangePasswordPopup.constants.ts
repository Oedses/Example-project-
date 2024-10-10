import { ChangePasswordRequest } from "../../../../../../shared/types/user";
import { CheckVerificationCodeRequest, VerificationCodeType } from "../../../../../../shared/types/verification-code";

export const defaultValues: ChangePasswordRequest = {
  newPassword: '',
  repeatNewPassword: '',
};

export const defaultValuesVerifyPassword: CheckVerificationCodeRequest = {
  code: '',
  type: VerificationCodeType.PASSWORD,
};

export type ChangePasswordFields = {
  newPassword: string
  repeatNewPassword: string
};

export type VerifyPasswordFields = {
  code: string
};

export const defaultErrors: ChangePasswordFields = {
  newPassword: '',
  repeatNewPassword: '',
};

export const defaultErrorsVerifyPassword: VerifyPasswordFields = {
  code: ''
};