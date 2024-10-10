
import regex from '../../../../../../../shared/regex';
import { CreateTransactionFormValues } from '../../../../../../../shared/types/transaction';
import { validateErrorsLabels, Validator } from '../../../../../utils/validation';
import { createTransactionValidationFields, defaultErrors } from './request-buy.constants';



class RequestBuyValidate extends Validator<createTransactionValidationFields, CreateTransactionFormValues> {
  validate(values: CreateTransactionFormValues, errorCallback: undefined | (() => void) = undefined) {
    this.reset();

    this.validateField('quantity', values.quantity!);

    if (errorCallback) {
      errorCallback();
    }

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    const formIsValid = invalidFields.length === 0;

    return { errors: this.errors, formIsValid };
  }

  validateField = (name: keyof createTransactionValidationFields, value: string | number) => {
    this.resetFieldError(name);

    switch (name) {
      case 'quantity': {
        if (!value) return this.errors[name] = validateErrorsLabels.required;
        if (value && isNaN(value as number)) return this.errors[name] = validateErrorsLabels.mustBeANumber;
        if (Number(value) <= 0) return this.errors[name] = validateErrorsLabels.mustBeAPositiveNumber;
        if (value && !regex.numbersOnly.test(value.toString()))
          return this.errors[name] = validateErrorsLabels.invalid;
        break;
      }
    }
  };
}

export default new RequestBuyValidate({ ...defaultErrors });
