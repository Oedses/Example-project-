import { ChangeEvent, useState, FocusEvent, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SummaryContext from "../../../../../store/contexts/summary-context";

import { PopupForm } from "../../../../components/UI/Popup/popup.props";

import regex from "../../../../../../../shared/regex";
import Validation from './validation';
import { createTransactionValidationFields, defaultErrors, defaultValues, maxLengthAmount } from "./request-buy.constants";
import { useSnackbar } from "../../../../components/Hooks/useSnackbar";
import { validateErrorsLabels } from "../../../../../utils/validation";
import { BasicData, CreateTransactionFormValues, TransactionType } from "../../../../../../../shared/types/transaction";
import TransactionService from "../../../../../services/TransactionService";
import { createSeparatorsNumber, createSeparatorsQuantityNumber } from "../../../../../utils/fn";


export interface RequestBuyFormProps extends PopupForm {
  data?: Pick<CreateTransactionFormValues, 'investor' | 'product'>,
  getProduct?: () => void
}

const useRequestBuyProps = ({
  data,
  onClose,
  getProduct = () => {},
  visible,
}: RequestBuyFormProps) => {
  const [values, setValues] = useState<CreateTransactionFormValues>(defaultValues);
  const [errors, setErrors] = useState(defaultErrors);

  const [isFetching, setIsFetching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [tipText, setTipText] = useState('');

  const { isActive, message, openSnackBar } = useSnackbar();

  const {
    data: { isShown },
    setData: setSummaryData,
  } = SummaryContext.useContext();

  const { t } = useTranslation();

  const onCloseClick = () => {
    if (onClose) onClose();

    setSummaryData({ isShown: false });
  };

  const onMaskedValueChange = (
    name: string | undefined,
    value: string | number
  ) => {
    setValues({ ...values, [name as string]: Number(value) });
    Validation.resetFieldError(name as keyof createTransactionValidationFields);
    setErrors(Validation.Errors);
  };

  const errorPriceQuantity = () => {
    const product = data?.product!;
    const maxVolume = product?.realAvailableVolume! * product?.ticketSize!;
    const enteredValue = product?.ticketSize! * Number(values.quantity);

    setTipText(`Max: ${createSeparatorsQuantityNumber(product?.realAvailableVolume!)} (€ ${createSeparatorsNumber(maxVolume)})`);

    if (Number(values.quantity!) > 0 && enteredValue > maxVolume) {
      Validation.setFieldError('ticketSize', validateErrorsLabels.invalidRequestBuyAmount);
      Validation.setFieldError('quantity', validateErrorsLabels.invalid);
    }
  };

  const onSubmit = () => {
    setIsFetching(true);

    Validation.reset();

    const { errors: validatedErrors, formIsValid: isValid } =
      Validation.validate(values, errorPriceQuantity);

    setErrors(validatedErrors);

    if (!isValid) {
      setIsFetching(false);
      return;
    }

    setShowSuccess(true);

    TransactionService.create({
      product: data?.product.id,
      investor: (data?.investor as BasicData).id,
      type: TransactionType.BUY,
      quantity: values.quantity,
    })
      .then(() => {
        setSummaryData({
          isShown: true,
          isSuccess: true,
          title: "pages.products.view.requestBuy.form.success.title",
          subtitle: "pages.products.view.requestBuy.form.success.subtitle",
          onCloseCallback: onCloseClick,
        });
      })
      .catch((err) => {
        setErrors({
          ...defaultErrors,
          quantity: validateErrorsLabels.invalid,
          ticketSize: validateErrorsLabels.invalid,
        });
        openSnackBar(err.response.data.message);
      })
      .finally(() => getProduct());

    setIsFetching(false);
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    Validation.validateField(name as keyof createTransactionValidationFields, value);
    setErrors(Validation.Errors);
  };

  const updateAmountValue = useCallback(() => {
    Validation.resetFieldError('ticketSize');
    Validation.resetFieldError('quantity');

    if (Number(values.quantity! > 0)) {
      errorPriceQuantity();
    } else {
      setValues({
        ...values,
        ticketSize: 0
      });
    }

    setErrors(Validation.Errors);
  }, [values.quantity]);

  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    if (name === 'quantity' && value?.length && !regex.numbersOnly.test(value) || value?.length > maxLengthAmount) return;

    setValues({
      ...values,
      [name]: value,
    });

    Validation.resetFieldError(
      name as keyof createTransactionValidationFields
    );

    setErrors(Validation.Errors);
  };

  useEffect(() => {
    updateAmountValue();
  }, [values.quantity]);

  return {
    t,
    showSuccess,
    isFetching,
    errors,
    values,
    onBlur,
    onFieldChange,
    onSubmit,
    onClose: onCloseClick,
    visible,
    isShown,
    message,
    isActive,
    onMaskedValueChange,
    tipText,
    product: data?.product
  };
};

export { useRequestBuyProps };
