import regex from '../../../../../../shared/regex';
import { NaturalPersonInvestor, LegalEntityInvestor, isNaturalPerson, isLegalEntity } from '../../../../../../shared/types/investor';
import { Validator, validateErrorsLabels } from '../../../../utils/validation';
import { signUpValidationFields } from '../../../auth/SignUp/createInvestor.constants';
import {
  defaultErrors,
  maxKVKLength,
  maxBSNLength
  } from './createInvestor.constants';

class CreateInvestorValidate extends Validator<signUpValidationFields, NaturalPersonInvestor | LegalEntityInvestor> {
  validate = (values: NaturalPersonInvestor | LegalEntityInvestor) => {
    this.reset();
    if (isNaturalPerson(values)) {
      this.validateField('firstName', values.firstName);
      this.validateField('lastName', values.lastName);
      this.validateField('bsn', values.bsn);
    }

    if (isLegalEntity(values)) {
      this.validateField('kvk', values.kvk);
      this.validateField('companyName', values.companyName);
    }

    this.validateField('address', values.address);
    this.validateField('postcode', values.postcode);
    this.validateField('city', values.city);
    this.validateField('email', values.email);
    this.validateField('phone', values.phone);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof signUpValidationFields, value: string) => {
    this.resetFieldError(name);

    switch (name) {
      case 'firstName':
      case 'lastName': {
        if (!value)
          this.errors[name] = validateErrorsLabels.required;
        else if (!regex.lettersAndNumbers.test(value))
          this.errors[name] = validateErrorsLabels.invalid;
        break;
      }

      case 'city': {
        if (!value)
          this.errors[name] = validateErrorsLabels.required;

        if (value && !regex.alphabetic.test(value))
          this.errors[name] = validateErrorsLabels.invalid;
        break;
      }

      case 'bsn': {
        if (!value) this.errors.bsn = validateErrorsLabels.required;
        else if (isNaN(Number(value)) || value?.length !== maxBSNLength)
          this.errors.bsn = validateErrorsLabels.invalid;
        break;
      }

      case 'kvk': {
        if (!value) this.errors.kvk = validateErrorsLabels.required;
        else if (isNaN(Number(value)) || value?.length !== maxKVKLength)
          this.errors.kvk = validateErrorsLabels.invalid;
        break;
      }

      case 'postcode': {
        if (!value) this.errors.postcode = validateErrorsLabels.required;
        else if (!regex.postcode.test(value))
          this.errors.postcode = validateErrorsLabels.invalid;
        break;
      }

      case 'address': {
        break;
      }

      case 'email': {
        if (!value) this.errors.email = validateErrorsLabels.required;
        else if (!regex.email.test(value))
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
          this.errors[name] = validateErrorsLabels.required;
          break;
      }
    }
  };
}

export default new CreateInvestorValidate({ ...defaultErrors });