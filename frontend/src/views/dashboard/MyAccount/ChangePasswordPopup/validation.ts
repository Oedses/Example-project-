import { ChangePasswordRequest } from '../../../../../../shared/types/user';
import { CheckVerificationCodeRequest } from '../../../../../../shared/types/verification-code';
import { Validator, validateErrorsLabels } from '../../../../utils/validation';
import {
  ChangePasswordFields,
  defaultErrorsVerifyPassword,
  defaultErrors,
  VerifyPasswordFields,
} from './ChangePasswordPopup.constants';

class ChangePasswordValidate extends Validator<ChangePasswordFields, Partial<ChangePasswordRequest>> {
  validate = (values: Partial<ChangePasswordRequest>) => {
    this.reset();

    this.validateField('newPassword', values.newPassword);
    this.validateField('repeatNewPassword', values.repeatNewPassword, values.newPassword);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof ChangePasswordFields, value: string | undefined, newPassword?: string) => {
    this.resetFieldError(name);

    switch (name) {
      case 'newPassword': {
        if (!value) this.errors[name as keyof ChangePasswordFields] = validateErrorsLabels.required;
        break;
      }

      case 'repeatNewPassword': {
        if (!value) this.errors[name as keyof ChangePasswordFields] = validateErrorsLabels.required;

        if (value && newPassword !== value)
          this.errors[name as keyof ChangePasswordFields] = validateErrorsLabels.invalidRepeatNewPassword;
        break;
      }

      default: {
        if (!value)
          this.errors[name as keyof ChangePasswordFields] = validateErrorsLabels.required;
        break;
      }
    }
  };
}

class VerifyPasswordValidate extends Validator<VerifyPasswordFields, Partial<VerifyPasswordFields>> {
  validate = (values: Partial<CheckVerificationCodeRequest>) => {
    this.reset();

    this.validateField('code', values.code);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof VerifyPasswordFields, value: string | undefined) => {
    this.resetFieldError(name);

    switch (name) {
      case 'code': {
        if (!value) this.errors[name as keyof VerifyPasswordFields] = validateErrorsLabels.required;

        if (value && value?.length > 4) this.errors[name as keyof VerifyPasswordFields] = validateErrorsLabels.invalid;
        break;
      }

      default: {
        if (!value)
          this.errors[name as keyof VerifyPasswordFields] = validateErrorsLabels.required;
        break;
      }
    }
  };
}

export const ValidationChangePassword = new ChangePasswordValidate({ ...defaultErrors });
export const ValidationVerifyPassword = new VerifyPasswordValidate({ ...defaultErrorsVerifyPassword });
