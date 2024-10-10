import regex from '../../../../../../shared/regex';
import { ChangePhoneRequest } from '../../../../../../shared/types/user';
import { Validator, validateErrorsLabels } from '../../../../utils/validation';
import {
  VerifyPhoneFields,
  defaultErrors
} from './ChangePhonePopup.constants';

class ChangePhoneValidate extends Validator<VerifyPhoneFields, Partial<ChangePhoneRequest>> {
  validate = (values: Partial<ChangePhoneRequest>) => {
    this.reset();

    this.validateField('phone', values.phone);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof VerifyPhoneFields, value: string | undefined) => {
    this.resetFieldError(name);

    switch (name) {
      case 'phone': {
        if (!value) this.errors[name as keyof VerifyPhoneFields] = validateErrorsLabels.required;

        if (value && !regex.phone.test(value))
          this.errors.phone = validateErrorsLabels.invalid;
        break;
      }


      default: {
        if (!value)
          this.errors[name as keyof VerifyPhoneFields] = validateErrorsLabels.required;
        break;
      }
    }
  };
}

export const ValidationChangePhone = new ChangePhoneValidate({ ...defaultErrors });
