import { useState, ChangeEvent, useEffect, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  defaultValues,
  defaultErrors,
  signUpValidationFields,
  onlyNumbersInputs,
  maxBSNLength,
  maxKVKLength,
  maxPhoneLength
} from './createInvestor.constants';

import regex from '../../../../../../shared/regex';
import {
  Investor,
  NaturalPersonInvestor,
  LegalEntityInvestor,
  InvestorType
} from '../../../../../../shared/types/investor';

import UserService from '../../../../services/UserService';

import { getError, getErrorMessageName, toCamelCase, trimObject } from '../../../../utils';
import { validateErrorsLabels } from '../../../../utils/validation';

import { useSnackbar } from '../../../components/Hooks/useSnackbar';

import Validation from './validation';
import { User } from '../../../../../../shared/types/user';
import { Roles } from '../../../../../../shared/types/common';
import SummaryContext from '../../../../store/contexts/summary-context';
import { PopupForm } from '../../../components/UI/Popup/popup.props';
import ZipCodeService from '../../../../services/ZipCodeService';

interface CreateInvestorFormProps extends PopupForm {
  editData?: {
    initialValues: Partial<Investor>;
    id: string
  } | undefined
}

export const useCreateInvestor = ({ visible, onClose, editData = undefined }: CreateInvestorFormProps) => {
  const [isFetching, setIsFetching] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const [values, setValues] = useState<Investor>({
    ...defaultValues,
    ...(editData?.initialValues ? editData?.initialValues : {})
  });
  const [zipCode, setZipCode] = useState<string>('');
  const [errors, setErrors] = useState<signUpValidationFields>(defaultErrors);

  const {
    data: { isShown },
    setData: setSummaryData
  } = SummaryContext.useContext();

  const { isActive, message, openSnackBar } = useSnackbar();

  const { t, i18n } = useTranslation();

  const handleSubmit = (event: SubmitEvent | React.MouseEvent<HTMLElement>) => {
    if (event) event.preventDefault();

    const { errors: validatedErrors, formIsValid: isValid } = Validation.validate(values);
    setErrors(validatedErrors);

    if (!isValid) return;

    setIsFetching(true);

    let dataForCreate: User = {
      ...values,
      role: Roles.investor
    };

    dataForCreate = trimObject(dataForCreate);

    const request = editData ?
      UserService.update(dataForCreate, editData.id) :
      UserService.createByAdmin(dataForCreate);

    return request.finally(() => setIsFetching(false));
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

    if (value?.length && onlyNumbersInputs.includes(inputName) && !regex.numbersOnly.test(value)) return;

    if ([regex.allEmojis, regex.unicodeSymbols].some(pattern => pattern.test(value))) return;

    if (inputName === 'bsn' && value?.length > maxBSNLength) return;

    if (inputName === 'kvk' && value?.length > maxKVKLength) return;

    if (inputName === 'phone' &&  value?.length > maxPhoneLength) return;

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

    if (inputName === "phone") {
      if (value && !value.includes("+")) {
        setValues({ ...values, [inputName]: `+${value}` });
      }

      if (value && value.includes("+")) {
        setValues({ ...values, [inputName]: value });
      }

      if (value === "+") {
        setValues({ ...values, [inputName]: "" });
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

  const onSubmit = (e?: SubmitEvent | React.MouseEvent<HTMLElement>) => {
    if (e)
      handleSubmit(e)
        ?.then(() => {
          if (onClose) onClose();

          setSummaryData({
            isShown: true,
            isSuccess: true,
            title: Boolean(editData) ? 'pages.investors.view.editDetails.popup.success.title' : 'pages.investors.form.success.title',
            subtitle: Boolean(editData) ? 'pages.investors.view.editDetails.popup.success.subtitle' : 'pages.investors.form.success.subtitle'
          });
        })
        .catch((err) => {
          console.log(err);
          const errorMessageText = err.response.data.message;
          const errorMessageName = getErrorMessageName(err.response.data.stack);
          const errorMsg = errorMessageName !== 'validate' ? t(`error.backend.${errorMessageName}`) : errorMessageText;

          setErrorMessage(errorMessageName !== 'validate' ? errorMessageName : errorMessageText);
          openSnackBar(errorMsg);
        })
        .finally(() => setIsFetching(false));
  };

  useEffect(() => {
    if (!errorMessage || !isActive) return;

    let errorField: keyof signUpValidationFields | null = null;

    if (errorMessage === 'Invalid phone format') errorField = 'phone';
    console.log(errorMessage);

    if (errorMessage === 'userPrincipalNameExist') {
      errorField = 'email';
      setErrors(Validation.setFieldError('email', t(`error.backend.userPrincipalNameExist`)));
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
  }, [errorMessage, message, isActive, i18n.language]);

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
    values,
    onRadioChange,
    errors,
    onFieldChange,
    onSubmit,
    isFetching,
    message,
    isActive,
    onBlur,
    isShown,
    onClose,
    isEdit: Boolean(editData),
    visible
  };
};
