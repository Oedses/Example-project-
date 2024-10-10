import regex from '../../../../../../shared/regex';
import { ChangeEmailRequest } from '../../../../../../shared/types/user';
import { CheckVerificationCodeRequest } from '../../../../../../shared/types/verification-code';
import { Validator, validateErrorsLabels } from '../../../../utils/validation';
import {
  VerifyEmailFields,
  defaultErrors,
  defaultErrorsVerifyCode,
  VerifyCodeFields
} from './ChangeEmailPopup.constants';

class ChangeEmailValidate extends Validator<VerifyEmailFields, Partial<ChangeEmailRequest>> {
  validate = (values: Partial<ChangeEmailRequest>) => {
    this.reset();

    this.validateField('email', values.email);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof VerifyEmailFields, value: string | undefined) => {
    this.resetFieldError(name);

    switch (name) {
      case 'email': {
        if (!value) this.errors[name as keyof VerifyEmailFields] = validateErrorsLabels.required;

        if (value && !regex.email.test(value))
          this.errors[name as keyof VerifyEmailFields] = validateErrorsLabels.invalid;
        break;
      }


      default: {
        if (!value)
          this.errors[name as keyof VerifyEmailFields] = validateErrorsLabels.required;
        break;
      }
    }
  };
}

class VerifyCodeValidate extends Validator<VerifyCodeFields, Partial<VerifyCodeFields>> {
  validate = (values: Partial<CheckVerificationCodeRequest>) => {
    this.reset();

    this.validateField('code', values.code);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof VerifyCodeFields, value: string | undefined) => {
    this.resetFieldError(name);

    switch (name) {
      case 'code': {
        if (!value) this.errors[name as keyof VerifyCodeFields] = validateErrorsLabels.required;

        if (value && value?.length > 4) this.errors[name as keyof VerifyCodeFields] = validateErrorsLabels.invalid;
        break;
      }

      default: {
        if (!value)
          this.errors[name as keyof VerifyCodeFields] = validateErrorsLabels.required;
        break;
      }
    }
  };
}

export const ValidationChangeEmail = new ChangeEmailValidate({ ...defaultErrors });
export const ValidationVerifyCode = new VerifyCodeValidate({ ...defaultErrorsVerifyCode });
