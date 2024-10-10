import regex from '../../../../../../shared/regex';
import { Issuer } from '../../../../../../shared/types/issuer';
import { Product, isInterestProduct, createProductValidationFields, DateUnits } from '../../../../../../shared/types/product';
import { validateErrorsLabels, Validator } from '../../../../utils/validation';

import { defaultErrors } from './createProduct.constants';

class CreateProductValidate extends Validator<createProductValidationFields, Product> {
  validate(values: Product) {
    this.reset();

    if (isInterestProduct(values)) {
      this.validateField('couponRate', values.couponRate!);
      this.validateField('maturity', values.maturity!, values.maturityUnit!);
      this.validateField('nonCallPeriod', values.nonCallPeriod!, values.nonCallPeriodUnit!, values);
      this.validateField('depository', values.depository);
      this.validateField('isin', values.isin);
    }

    this.validateField('category', values.category);
    this.validateField('issuer', (values.issuer as Pick<Issuer, 'id' | 'name'>).id!);
    this.validateField('listingDate', values.listingDate!);
    this.validateField('ticketSize', values.ticketSize!,);
    this.validateField('name', values.name);
    this.validateField('quantity', values.quantity!);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    const formIsValid = invalidFields.length === 0;

    return { errors: this.errors, formIsValid };
  }

  validateField = (name: keyof createProductValidationFields, value: string | number | Date, additionalValue?: string | number, values?: Product) => {
    this.resetFieldError(name);

    switch (name) {
      case 'couponRate':
      case 'ticketSize':
      case 'quantity': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        if (value && isNaN(value as number)) this.errors[name] = validateErrorsLabels.mustBeANumber;
        if (Number(value) <= 0) this.errors[name] = validateErrorsLabels.mustBeAPositiveNumber;

        break;
      }

      // case 'nonCallPeriod':
      case 'maturity': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        if (value && isNaN(value as number)) this.errors[name] = validateErrorsLabels.mustBeANumber;
        if (Number(value) <= 0) this.errors[name] = validateErrorsLabels.mustbeGreaterThenZero;

        // fix TCX-557
        // const maxMonths = DateUtils.maxMaturityMonths;
        // const maxYears = DateUtils.maxMaturityYears;

        // if ((additionalValue === DateUnits.months && Number(value) > maxMonths) ||
        //     (additionalValue === DateUnits.years && Number(value) > maxYears)) this.errors[name] = validateErrorsLabels.mustbeGreaterThenZero;

        break;
      }

      case 'nonCallPeriod': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        if (value && isNaN(value as number)) this.errors[name] = validateErrorsLabels.mustBeANumber;
        if (Number(value) < 0) this.errors[name] = validateErrorsLabels.mustbeGreaterThenZero;

        if (isInterestProduct(values) && values.maturity) {
          if (
            (additionalValue === values.maturityUnit) &&
            (Number(value) > Number(values.maturity))
          ) this.errors[name] = validateErrorsLabels.moreThanMaturity;
          else {
            const maturityMonths = values.maturityUnit === DateUnits.months ? Number(values.maturity) : Number(values.maturity) * 12;
            const nonCallPeriodMonths = additionalValue === DateUnits.months ? Number(value) : Number(value) * 12;

            if (nonCallPeriodMonths > maturityMonths) this.errors[name] = validateErrorsLabels.moreThanMaturity;
          }
        }
        break;
      }

      case 'category':
      case 'listingDate':
      case 'issuer': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        break;
      }

      case 'name': {
        if (!value) this.errors[name] = validateErrorsLabels.required;
        if (value && !regex.lettersAndNumbers.test(value.toString()))
          this.errors[name] = validateErrorsLabels.invalid;
        break;
      }

      case 'depository':
      case 'isin': {
        // if (value && !regex.lettersAndNumbers.test(value.toString()))
        //   this.errors[name] = validateErrorsLabels.invalid;
        break;
      }
    }
  };
}

export default new CreateProductValidate({ ...defaultErrors });
