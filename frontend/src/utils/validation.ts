export const validateErrorsLabels = {
  required: 'error.validation.required',
  mustBeANumber: 'error.validation.mustBeANumber',
  mustBeAPositiveNumber: 'error.validation.mustBeAPositiveNumber',
  mustbeGreaterThenZero: 'error.validation.mustbeGreaterThenZero',
  valueIsNotLessPrice: 'error.validation.valueIsNotLessPrice',
  invalidListingDate: 'error.validation.invalidListingDate',
  invalid: 'error.validation.invalid',
  invalidMaturityDate: 'error.validation.invalidMaturityDate',
  invalidNonCallPeriod: 'error.validation.invalidNonCallPeriod',
  productExists: 'error.validation.productExists',
  moreThanMaturity: 'error.validation.moreThanMaturity',
  invalidRequestBuyAmount: 'error.validation.invalidRequestBuyAmount',
  invalidTransactionAmount: 'error.validation.invalidTransactionAmount',
  maximumAvailableAmount: 'error.validation.maximumAvailableAmount',
  invalidNonCallPeriodExpired: 'error.validation.invalidNonCallPeriodExpired',
  userExists: 'error.validation.userExists',
  invalidRepeatNewPassword: 'error.validation.invalidRepeatNewPassword'
};

export type validationResult<T> = {
  errors: T;
  formIsValid: boolean;
};

export interface IValidate<T, K> {
  errors: T;
  resetFieldError: (name: keyof T) => void;
  validate?: (values: K) => validationResult<T>;
  validateField?: (name: keyof T) => validationResult<T>;
}

export class Validator<T, K> implements IValidate<T, K> {
  defaultErrors: T;

  constructor(public errors: T) {
    this.defaultErrors = { ...errors };
  }

  get Errors() {
    return this.errors;
  }

  reset() {
    this.errors = { ...this.defaultErrors };
    return this.errors;
  }

  resetFieldError(name: keyof T) {
    this.errors = { ...this.errors, [name]: '' };
    return this.errors;
  }

  setFieldError(name: keyof T, value: string) {
    this.errors = { ...this.errors, [name]: value };
    return this.errors;
  }
}
