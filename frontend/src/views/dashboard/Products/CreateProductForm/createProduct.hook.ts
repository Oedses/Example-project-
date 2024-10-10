/* eslint-disable @typescript-eslint/no-redeclare */
import { useState, ChangeEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { capitalize, getLastElement, clearFromEmpty, formatDate, createQueryString } from '../../../../utils/fn';
import { validateErrorsLabels } from '../../../../utils/validation';

import ProductService from '../../../../services/ProductService';
import IssuerService from '../../../../services/IssuerService';

import { createProductValidationFields, DateUnits, PaymentFrequency, PaymentType, Product, ProductCategory } from '../../../../../../shared/types/product';
import { Issuer } from '../../../../../../shared/types/issuer';
import regex from '../../../../../../shared/regex';

import { Option } from './../../../components/UI/Select';
import Validation from './validation';
import { DateUtils } from '../../../components/UI/DatePicker/datepicker.utils';
import { useSnackbar } from '../../../components/Hooks/useSnackbar';

import {
  defaultErrors,
  defaultValues,
  paymentFrequencies,
  createIssuersOptions,
  CreateProductRequest,
  dividentPayment,
  interestPayment,
  freeTextFields,
  alphanumericFields,
  categories,
  maturityUnits,
  nonCallPeriodUnits,
  translateLabels
} from './createProduct.constants';
import SummaryContext from '../../../../store/contexts/summary-context';
import { PopupForm } from '../../../components/UI/Popup/popup.props';
import { AccountStatus } from '../../../../../../shared/types/common';
import { Query } from '../../../../../../shared/types/response';

export interface CreateProductFormProps extends PopupForm { }

const useCreateProduct = ({ onClose, visible }: CreateProductFormProps) => {
  const [values, setValues] = useState<Product>(defaultValues);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [issuers, setIssuers] = useState<Option[]>([]);

  const [formIsValid, setFormIsValid] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [errors, setErrors] = useState(defaultErrors);

  const {
    data: { isShown },
    setData: setSummaryData
  } = SummaryContext.useContext();

  const { t } = useTranslation();

  const { isActive, message, openSnackBar } = useSnackbar();

  const paymentTypesItems = translateLabels(values.category === ProductCategory.Bond ? interestPayment : dividentPayment);

  const paymentFrequenciesItems = translateLabels(paymentFrequencies);

  const productCategories = translateLabels(categories);

  const productMaturityUnits = translateLabels(maturityUnits);

  const productNonCallPeriodUnits = translateLabels(nonCallPeriodUnits);

  const onSubmit = (event?: SubmitEvent | React.MouseEvent<HTMLElement>) => {
    if (event) event.preventDefault();

    Validation.reset();
    setErrorMessage('');

    const { errors: validatedErrors, formIsValid: isValid } =
      Validation.validate(values);

    setErrors(validatedErrors);
    setFormIsValid(isValid);

    if (!isValid) {
      setIsFetching(false);
      return;
    }

    const paymentType = capitalize(
      getLastElement(values?.paymentType?.split('.')) as string
    );

    const paymentFrequency = capitalize(
      getLastElement(values?.paymentFrequency?.split('.')) as string
    );

    const listingDate = DateUtils.addDeltaToDate(
      values.listingDate!,
      { years: 0, months: 0, days: 1 },
      true
    ).toISOString();

    setIsFetching(true);

    const dataToCreate: CreateProductRequest = clearFromEmpty({
      ...values,
      paymentType,
      paymentFrequency: paymentType === PaymentType.DIVIDEND ? '' : paymentFrequency,
      listingDate: formatDate(listingDate, false, true),
      issuer: (values.issuer as Pick<Issuer, 'id' | 'name'>).id!
    });

    delete dataToCreate.availableVolume;

    return ProductService.create(dataToCreate)
      .finally(() => setIsFetching(false));
  };

  const onPaymentTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      paymentType: event.target.value as PaymentType
    });
    setErrors(defaultErrors);
  };

  const onPaymentFrequencyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      paymentFrequency: event.target.value as PaymentFrequency
    });
  };

  const onCategoryChange = (option: Option) => {
    setValues({
      ...values,
      category: option.value as ProductCategory,
      paymentType: option.value === ProductCategory.Bond ? PaymentType.INTEREST : PaymentType.DIVIDEND
    });
    Validation.resetFieldError('category');
  };

  const onIssuerChange = (option: Option) => {
    setValues({
      ...values,
      issuer: {
        id: option.value as string,
        name: option.label
      },
    });
    Validation.resetFieldError('issuer');
  };

  const onMaturityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      maturityUnit: event.target.value as DateUnits
    });
  };

  const onNonCallPeriodChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      nonCallPeriodUnit: event.target.value as DateUnits
    });
  };

  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    let { name, value } = event.target;

    if (!freeTextFields.includes(name) && [regex.allEmojis, regex.unicodeSymbols].some(pattern => pattern.test(value))) return;

    if (value &&
      alphanumericFields.includes(name) &&
      (!regex.lettersAndNumbers.test(value) || (regex.lettersAndNumbers.test(value) && /[\,\.\-]/.test(value)))
    ) return;

    if (event.target.type === 'number' &&
      value?.length > 1 && value.substring(0, 1) === '0')
      value = value.slice(1);

    setValues({ ...values, [name]: value });

    Validation.resetFieldError(
      event.target.name as keyof createProductValidationFields
    );
  };

  const onMaskedValueChange = (
    name: string | undefined,
    value: string | number
  ) => {
    setValues({ ...values, [name as string]: value });
    Validation.resetFieldError(name as keyof createProductValidationFields);
  };

  const onListingDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    Validation.resetFieldError('listingDate');
    setValues({ ...values, listingDate: new Date(event.target.value) });
  };

  const onHandleSubmit = (e?: SubmitEvent | React.MouseEvent<HTMLElement>) => {
    setIsFetching(true);
    onSubmit(e)
      ?.then(() => {
        if (onClose) onClose();

        setSummaryData({
          isShown: true,
          isSuccess: true,
          title: 'pages.products.success.title',
          subtitle: 'pages.products.success.subtitle'
        });
      })
      .catch(error => {
        console.log(error);

        let msg = error.response.data.message;
        if (msg.includes('"listingDate" must be less than or equal to'))
          msg = t('error.validation.invalidListingDate2');
        setErrorMessage(msg);
        openSnackBar(msg);

        if (msg === 'Product with this name already exists')
          Validation.setFieldError('name', validateErrorsLabels.productExists);
      })
      ?.finally(() => setIsFetching(false));
  };

  useEffect(() => {
    setErrors(Validation.Errors);
  }, [Validation.Errors]);

  useEffect(() => {
    Validation.reset();

    const query: Query = {
      skip: 0,
      limit: 0,
      status: AccountStatus.active
    };

    IssuerService.getList(createQueryString(query))
      .then(res => {
        const { data } = res.data;

        setIssuers(createIssuersOptions(data));
      });
  }, []);

  useEffect(() => {
    if (!errorMessage || !isActive) return;

    const errorField = errorMessage?.split('"')[1] as keyof createProductValidationFields;

    const fieldsErrors = Validation.setFieldError(errorField, validateErrorsLabels.invalid);

    setErrors(fieldsErrors);
  }, [errorMessage, message, isActive]);

  return {
    t,
    onClose,
    onFieldChange,
    onPaymentTypeChange,
    onPaymentFrequencyChange,
    onMaturityChange,
    onNonCallPeriodChange,
    onSubmit,
    onListingDateChange,
    onCategoryChange,
    onIssuerChange,
    values,
    errors,
    formIsValid,
    isFetching,
    onHandleSubmit,
    paymentTypesItems,
    paymentFrequenciesItems,
    onMaskedValueChange,
    isActive,
    message,
    issuers,
    isShown,
    visible,
    productCategories,
    productMaturityUnits,
    productNonCallPeriodUnits
  };
};

export default useCreateProduct;
