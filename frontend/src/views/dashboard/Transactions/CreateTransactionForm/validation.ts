import { CreateTransactionFormValues, TransactionType } from '../../../../../../shared/types/transaction';
import { validateErrorsLabels, Validator } from '../../../../utils/validation';

import { createTransactionValidationFields, defaultErrors } from './createTransaction.constants';

class CreateTransactionValidate extends Validator<createTransactionValidationFields, CreateTransactionFormValues> {
  validate(values: CreateTransactionFormValues, errorCallback: undefined | (() => void) = undefined) {
    this.reset();

    this.validateField('product', values.product.id);
    this.validateField('ticketSize', values.ticketSize!);

    if (values.type !== TransactionType.PAYMENT) {
      this.validateField('quantity', values.quantity!);
      this.validateField('investor',  values.investor.id);
    } else {
      this.validateField('investors', values.investors!);
      this.validateField('paymentType', values.paymentType!);
    }

    if (values.type === TransactionType.SELL && !values.receiver.id && !values.isReturnTokens) this.errors.receiver = validateErrorsLabels.required;

    if (errorCallback) {
      errorCallback();
    }

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    const formIsValid = invalidFields.length === 0;

    return {
      errors: this.errors,
      formIsValid
    };
  }

  validateField = (name: keyof createTransactionValidationFields, value: string | number | string[]) => {
    this.resetFieldError(name);

    switch (name) {
      case 'investor': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        this.errors.investors = '';
        break;
      }

      case 'product': {
        if (Array.isArray(value) && !value?.length) this.errors[name] = validateErrorsLabels.required;
        if (!value) this.errors[name] = validateErrorsLabels.required;
        break;
      }

      case 'investors': {
        if ( Array.isArray(value) && !value?.length) this.errors.investor = validateErrorsLabels.required;
        break;
      }

      case 'ticketSize':
      case 'quantity': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        if (value && isNaN(value as number)) this.errors[name] = validateErrorsLabels.mustBeANumber;
        if (Number(value) <= 0) this.errors[name] = validateErrorsLabels.mustBeAPositiveNumber;
        break;
      }

      case 'paymentType': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        break;
      }


      default: {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        break;
      }
    }
  };
}

export default new CreateTransactionValidate({ ...defaultErrors });
