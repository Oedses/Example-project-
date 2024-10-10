import regex from '../../../../../../shared/regex';
import { Issuer } from '../../../../../../shared/types/issuer';
import { Validator, validateErrorsLabels } from '../../../../utils/validation';
import {
  createIssuerValidationFields,
  defaultErrors,
  maxKVKLength,
  maxVATLength
} from './CreateIssuer.constants';

class CreateIssuerValidate extends Validator<createIssuerValidationFields, Partial<Issuer>> {
  validate = (values: Partial<Issuer>) => {
    this.reset();

    this.validateField('name', values.name);
    this.validateField('email', values.email);
    this.validateField('phone', values.phone);
    this.validateField('kvk', values.kvk);
    this.validateField('vat', values.vat);
    this.validateField('address', values.address);
    this.validateField('postcode', values.postcode);
    this.validateField('city', values.city);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof createIssuerValidationFields, value: string | undefined) => {
    this.resetFieldError(name);

    switch (name) {
      case 'name': {
        if (!value)
          this.errors[name as keyof createIssuerValidationFields] = validateErrorsLabels.required;
        if (value && !regex.lettersAndNumbers.test(value!))
          this.errors[name as keyof createIssuerValidationFields] = validateErrorsLabels.invalid;
        break;
      }

      case 'city': {
        if (!value)
          this.errors[name] = validateErrorsLabels.required;

        if (value && !regex.alphabetic.test(value))
          this.errors[name] = validateErrorsLabels.invalid;
        break;
      }

      case 'kvk': {
        if (!value) this.errors.kvk = validateErrorsLabels.required;

        if (value && isNaN(Number(value)) || value?.length !== maxKVKLength)
          this.errors.kvk = validateErrorsLabels.invalid;
        break;
      }

      case 'vat': {
        if (!value) this.errors.vat = validateErrorsLabels.required;

        if (value && value?.length !== maxVATLength || !regex.vat.test(value!))
          this.errors.vat = validateErrorsLabels.invalid;
        break;
      }

      case 'address': {
        break;
      }

      case 'postcode': {
        if (!value) this.errors.postcode = validateErrorsLabels.required;

        if (value && !regex.postcode.test(value!))
          this.errors.postcode = validateErrorsLabels.invalid;
        break;
      }

      case 'email': {
        if (!value) this.errors.email = validateErrorsLabels.required;
        if (value && !regex.email.test(value!))
          this.errors.email = validateErrorsLabels.invalid;
        break;
      }

      case 'phone': {
        if (!value) this.errors.phone = validateErrorsLabels.required;

        if (value && !regex.phone.test(value))
          this.errors.phone = validateErrorsLabels.invalid;
        break;
      }

      default: {
        if (!value)
          this.errors[name as keyof createIssuerValidationFields] = validateErrorsLabels.required;
          break;
      }
    }
  };
}

export default new CreateIssuerValidate({ ...defaultErrors });