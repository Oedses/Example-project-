import { ChangeEmailRequest } from "../../../../../../shared/types/user";
import { CheckVerificationCodeRequest, VerificationCodeType } from "../../../../../../shared/types/verification-code";

export const defaultValues: ChangeEmailRequest = {
  email: '',
};

export const defaultValuesVerifyCode: CheckVerificationCodeRequest = {
  code: '',
  type: VerificationCodeType.EMAIL,
};

export type VerifyEmailFields = {
  email: string
};

export type VerifyCodeFields = {
  code: string
};

export const defaultErrors: VerifyEmailFields = {
  email: '',
};

export const defaultErrorsVerifyCode: VerifyCodeFields = {
  code: ''
};