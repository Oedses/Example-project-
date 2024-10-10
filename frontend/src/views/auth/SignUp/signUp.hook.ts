import { useState, ChangeEvent, useEffect, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

import UserService from '../../../services/UserService';

import { clearFromEmpty, getError, toCamelCase, trimObject } from '../../../utils';
import { validateErrorsLabels } from '../../../utils/validation';

import regex from '../../../../../shared/regex';
import { Roles } from '../../../../../shared/types/common';
import { User } from '../../../../../shared/types/user';
import {
  Investor,
  InvestorType,
  LegalEntityInvestor,
  NaturalPersonInvestor
} from '../../../../../shared/types/investor';

import SummaryContext from '../../../store/contexts/summary-context';

import { useSnackbar } from '../../components/Hooks/useSnackbar';
import {
  defaultValues,
  defaultErrors,
  signUpValidationFields,
  onlyNumbersInputs,
  signUpCancelUrl,
  maxBSNLength,
  maxKVKLength,
  maxPhoneLength,
} from './createInvestor.constants';

import background from './assets/auth-bg.png';

import Validation from './validation';
import { Locales } from '../../../localization/models';
import ZipCodeService from '../../../services/ZipCodeService';

export const useSignUp = () => {
  const [imageIsReady, setImageIsReady] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const { setData: setSummaryData } = SummaryContext.useContext();

  const [errorMessage, setErrorMessage] = useState<string>('');

  const [values, setValues] = useState<Investor>(defaultValues);
  const [zipCode, setZipCode] = useState<string>('');
  const [errors, setErrors] = useState<signUpValidationFields>(defaultErrors);

  const { isActive, message, openSnackBar } = useSnackbar();

  const { t, i18n } = useTranslation();

  const isEnglish = i18n.language === Locales.en;

  const currentLanguage = isEnglish ? 'English' : 'Dutch';

  const onLanguageChange = () => {
    const newLanguage = isEnglish ? Locales.nl : Locales.en;
    i18n.changeLanguage(newLanguage);

    // reserved case when re-login
    localStorage.setItem('langcode', newLanguage);
  };

  const handleSubmit = (event: SubmitEvent | React.MouseEvent<HTMLElement>) => {
    if (event) event.preventDefault();

    const { errors: validatedErrors, formIsValid: isValid } =
      Validation.validate(values);

    setErrors(validatedErrors);

    if (!isValid) return;

    setIsFetching(true);

    let dataForCreate: User = {
      ...clearFromEmpty(values),
      role: Roles.investor
    };

    dataForCreate = trimObject(dataForCreate);

    return UserService.create(dataForCreate).finally(() => setIsFetching(false));
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    Validation.validateField(name as keyof signUpValidationFields, value);

    setErrors(Validation.Errors);
  };

  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputName = event.target.name as keyof (NaturalPersonInvestor & LegalEntityInvestor);
    let { value } = event.target;

    Validation.resetFieldError(
      inputName as keyof signUpValidationFields
    );

    setErrors(Validation.Errors);

    if (onlyNumbersInputs.includes(inputName) &&
      !regex.numbersOnly.test(value) && value?.length) return;

    if ([regex.allEmojis, regex.unicodeSymbols].some(pattern => pattern.test(value))) return;

    if (inputName === 'bsn' && value?.length > maxBSNLength) return;

    if (inputName === 'kvk' && value?.length > maxKVKLength) return;

    if (inputName === 'phone' && value?.length > maxPhoneLength) return;

    if (inputName === 'postcode' && value) {
      const firstFourCharacters = value.substring(0, 4);
      const lastTwoCharacters = value.substring(value.length, value.length - 2);
      const lastCharachter = value.substring(value.length, value.length - 1);

      const isFirstFourDigits = regex.numbersOnly.test(firstFourCharacters);
      const isLastTwoLetters = [lastCharachter, lastTwoCharacters]
        .some(symbols => !regex.withNumbers.test(symbols));
      const isWithBiggerLength = value?.length > 6;

      if (firstFourCharacters.length === 4) {
        setZipCode(firstFourCharacters);
      }

      if (
        (value?.length <= 4 && !isFirstFourDigits) ||
        (value?.length > 4 && !isLastTwoLetters) ||
        isWithBiggerLength
      ) {
        return;
      }
    }

    if (inputName === 'email' && value.includes(' ')) return;

    if (inputName === 'city') {
      if (value && !regex.alphabetic.test(value)) return;
    }

    if (inputName === 'phone') {
      if (value && !value.includes('+')) {
        setValues({ ...values, [inputName]: `+${value}` });
      }

      if (value && value.includes('+')) {
        setValues({ ...values, [inputName]: value });
      }

      if (value === '+') {
        setValues({ ...values, [inputName]: '' });
      }
    } else {
      setValues({ ...values, [inputName]: value });
    }
  };

  const onRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...defaultValues,
      address: values.address,
      postcode: values.postcode,
      city: values.city,
      type: event.target.value as InvestorType
    });

    Validation.reset();
    setErrors(Validation.Errors);
  };

  const onCancel = () => window.location.href = signUpCancelUrl;

  const onSubmit = (e?: SubmitEvent | React.MouseEvent<HTMLElement>) => {
    if (e)
      handleSubmit(e)
        ?.then(() => {
          window.scrollTo({ top: 0 });

          setSummaryData({
            isShown: true,
            isSuccess: true,
            title: "pages.signUp.success.title",
            subtitle: "pages.signUp.success.subtitle",
            onCloseCallback: onCancel
          });
        })
        .catch((err) => {
          console.log(err);

          const errorMsg = err.response.data.message === 'User already exists' ? t('error.validation.userExists') : err.response.data.message;

          setErrorMessage(err.response.data.message);
          openSnackBar(errorMsg);
        })
        .finally(() => setIsFetching(false));
  };

  useEffect(() => {
    if (!imageIsReady) {
      const image = new Image();
      image.src = background;
      setImageIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!errorMessage) return;

    let errorField: keyof signUpValidationFields | null = null;

    if (errorMessage === 'Invalid phone format') errorField = 'phone';
    if (errorMessage === 'User already exists') {
      errorField = 'email';
      setErrors(Validation.setFieldError('email', validateErrorsLabels.userExists));
      return;
    }

    const data = getError(errorMessage);

    if (data) {
      const [field, msg] = data;
      if (field && msg) setErrors(Validation.setFieldError(field as keyof signUpValidationFields, msg));
    }

    if (errorMessage.split('').includes(':')) {
      let fieldWithError = errorMessage.split(':')[0];
      if (fieldWithError) errorField = toCamelCase(fieldWithError.toLowerCase()) as keyof signUpValidationFields;
      if (fieldWithError === errorMessage) errorField = errorMessage.split('"')[1] as keyof signUpValidationFields;
    }

    if (errorField) {
      const fieldsErrors = Validation.setFieldError(errorField, validateErrorsLabels.invalid);
      setErrors(fieldsErrors);
    }
  }, [errorMessage, message, isActive, i18n.language, localStorage.getItem('langcode')]);

  useEffect(() => {
    if (zipCode.length === 4 && (!values.city || !values.address)) {
      ZipCodeService.getSearchCodes(zipCode)
      .then(res => {
        const { data } = res;

        const newCityAddress = {
          city: values.city,
          address: values.address,
        };

        if (data.city && !newCityAddress.city) {
          newCityAddress.city = data.city;
        }

        if (data.address && !newCityAddress.address) {
          newCityAddress.address = data.address;
        }

        setValues({ ...values, ...newCityAddress });
      })
      .catch((err) => {
        openSnackBar(err.response.data.message);
      });
    }
  }, [zipCode]);
  
  return {
    t,
    imageIsReady,
    values,
    onRadioChange,
    errors,
    onFieldChange,
    onLanguageChange,
    onCancel,
    onSubmit,
    isFetching,
    message,
    isActive,
    background,
    onBlur,
    currentLanguage
  };
};
