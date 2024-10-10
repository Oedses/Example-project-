/* eslint-disable @typescript-eslint/no-redeclare */
import { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import InvestorService from "../../../../services/InvestorService";
import HoldingsService from "../../../../services/HoldingsService";
import ProductService from "../../../../services/ProductService";
import TransactionService from "../../../../services/TransactionService";

import { validateErrorsLabels } from "../../../../utils/validation";
import {
  capitalize,
  clearFromEmpty,
  getLastElement,
  getTransactionTotalPrice,
  isHolding,
  isProduct,
  createSeparatorsNumber,
  createSeparatorsQuantityNumber,
  getAmountPrice,
  createQueryString,
  getErrorMessageName,
} from "../../../../utils/fn";

import { PaymentFrequency, Product, ProductCategory } from "../../../../../../shared/types/product";
import { Holding } from "../../../../../../shared/types/holding";
import { Status, AccountStatus } from "../../../../../../shared/types/common";

import {
  BasicData,
  CreateTransactionFormValues,
  CreateTransactionRequest,
  PaymentType,
  TransactionType,
} from "../../../../../../shared/types/transaction";

import { Option } from "../../../components/UI/Select";
import { InputProps } from "../../../components/UI/Input/input.props";
import { SelectProps } from "../../../components/UI/Select";
import { useSnackbar } from "../../../components/Hooks/useSnackbar";
import { EuroIcon } from "../../../components/icons";

import { createInvestorItem, createProductItem } from "../transactions.utils";
import { transactionTypes } from "../transactions.constants";

import {
  createAmountReceivedRow,
  createTransactionValidationFields,
  defaultErrors,
  defaultValues,
  getAvailableValues,
  paymentTypes,
  tableHeadAmountReceived,
  transactionErrors,
} from "./createTransaction.constants";
import Validation from "./validation";
import SummaryContext from "../../../../store/contexts/summary-context";
import { PopupForm } from "../../../components/UI/Popup/popup.props";
import { Query } from "../../../../../../shared/types/response";
import {
  BadgeOperation,
  BadgesProps,
} from "../../../components/UI/Badges/badges.hook";
import { CheckboxProps } from "../../../components/UI/Checkbox";
import { Investor } from "../../../../../../shared/types/investor";
import { Row } from "../../../components/UI/Table";



export interface CreateTransactionFormProps extends PopupForm { }

const useCreateTransaction = ({
  onClose,
  visible,
}: CreateTransactionFormProps) => {
  const [values, setValues] =
    useState<CreateTransactionFormValues>(defaultValues);

  const [errorMessage, setErrorMessage] = useState("");

  const [quantityTipText, setQuantityTipText] = useState("");

  const [purchaseAmount, setPurchaseAmount] = useState(0);

  const [formIsValid, setFormIsValid] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [errors, setErrors] = useState(defaultErrors);

  const [products, setProducts] = useState<(Product | Holding)[]>([]);
  const [defaultTicketSize, setDefaultTicketSize] = useState(0);

  const [sellHolding, setSellHolding] = useState<Holding | null>(null);

  const [productsOptions, setProductsOptions] = useState<Option[]>([]);
  const [paymentTypeOptions, setPaymentTypeOptions] = useState<Option[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [investorsOptions, setInvestorsOptions] = useState<Option[]>([]);
  const [receiversOptions, setReceiversOptions] = useState<Option[]>([]);
  const [selectedInvestors, setSelectedInvestors] = useState<Option[]>([]);
  const [investorsAmountReceived, setInvestorsAmountReceived] = useState<Row[]>([]);
  const {
    data: { isSuccess, isShown },
    setData: setSummaryData,
  } = SummaryContext.useContext();

  const { t } = useTranslation();

  const { isActive, message, openSnackBar } = useSnackbar();

  const transactionTypesItems = transactionTypes
    .slice()
    .map((type) => ({ ...type, label: t(type.label) }));

  const isSellTransaction = useMemo(() => values.type === TransactionType.SELL, [values.type]);
  const isPaymentTransaction = useMemo(() => values.type === TransactionType.PAYMENT, [values.type]);

  const getReceivers = () => {
    const query: Query = {
      skip: 0,
      limit: 0,
      status: AccountStatus.active
    };

    InvestorService.getList(createQueryString(query))
      .then((res) => {
        setReceiversOptions(
          res.data.data.map((investor) => createInvestorItem(investor))
        );
      });
  };

  const getInvestors = async () => {
    const isPayment = values.type === TransactionType.PAYMENT && Boolean(values.product.id);

    const query: Query = {
      skip: 0,
      limit: 0,
      status: AccountStatus.active,
      isHolding: String(values.type !== TransactionType.BUY),
      ...(isPayment ? { productId: values.product.id } : {})
    };

    await InvestorService.getList(createQueryString(query))
      .then((res) => {
        setInvestors(res.data.data);
        setInvestorsOptions(
          res.data.data.map((investor) => createInvestorItem(investor))
        );
      });

    return () => {
      Validation.reset();
    };
  };

  const getCurrentProduct = (productId: string): Product => {
    const chosenProduct = products.find((product) => {
      const productID = isHolding(product)
        ? (product.product as Product).id
        : product.id;

      return productId === productID;
    });

    if (isHolding(chosenProduct)) {
      return chosenProduct.product as Product;
    }

    return chosenProduct as Product;
  };

  const getProducts = async () => {
    const query: Query = {
      skip: 0,
      limit: 0,
      status: Status.active,
      isRealAvailableVolume: String(values.type !== TransactionType.PAYMENT),
      isBought: String(values.type === TransactionType.PAYMENT)
    };

    await ProductService.getList(createQueryString(query))
      .then((res) => {
        setProducts(res.data.data as Product[]);
        setProductsOptions(
          res.data.data.map((product) => createProductItem(product))
        );
      })
      .catch((err) => console.log(err));
  };

  const calculationErrorPriceQuantity = () => {
    const chosenProduct = products.find((product) => {
      const productId = isHolding(product)
        ? (product.product as Product).id
        : product.id;

      return values.product.id === productId;
    });

    let enteredAmount = getTransactionTotalPrice({
      ...values,
      ticketSize: chosenProduct?.ticketSize!,
    });

    const maxVolume = isProduct(chosenProduct!)
      ? chosenProduct?.availableVolume! * chosenProduct?.ticketSize!
      : chosenProduct?.ticketSize! * chosenProduct?.quantity!;

    if (values.type === TransactionType.PAYMENT) {
      if (enteredAmount > maxVolume) {
        Validation.setFieldError(
          "ticketSize",
          validateErrorsLabels.invalidTransactionAmount
        );
        Validation.setFieldError("quantity", validateErrorsLabels.invalid);
      }
    }

    if ([TransactionType.BUY, TransactionType.SELL].includes(values.type)) {
      const productToCalculate = (values.type === TransactionType.SELL ? sellHolding : chosenProduct) as Product | Holding;

      const [availableVolume, availableAmount] = getAvailableValues(productToCalculate, Number(values.ticketSize));

      const enteredVolume = Number(values.ticketSize) * values.quantity!;

      setPurchaseAmount(enteredVolume);

      let tipString = "";

      if (values.ticketSize) {
        tipString = `Max: ${createSeparatorsQuantityNumber(
          availableAmount
        )} (€ ${createSeparatorsNumber(availableVolume)})`;
      }

      setQuantityTipText(tipString);

      if (enteredVolume > availableVolume && values.quantity! > 0) {
        setQuantityTipText("");
        Validation.setFieldError(
          "quantity",
          validateErrorsLabels.maximumAvailableAmount
        );
      }
    }

    if (values.type === TransactionType.SELL) {
      const chosenHolding = chosenProduct as Holding;

      if (chosenHolding.nonCallPeriod && new Date(chosenHolding.nonCallPeriod) > new Date() && (chosenHolding.product as Product).status === Status.active && !(chosenHolding.product as Product).isRequestDeactivate && !values.isReturnTokens) {
        Validation.setFieldError(
          "product",
          validateErrorsLabels.invalidNonCallPeriodExpired
        );
      } else {
        Validation.resetFieldError("product");
      }
    }

    setErrors(Validation.Errors);
  };

  const handleSubmit = (
    event?: SubmitEvent | React.MouseEvent<HTMLElement>
  ) => {
    if (event) event.preventDefault();
    Validation.reset();
    setErrorMessage("");


    const valuesToValidate = values.type === TransactionType.PAYMENT ? {
      ...values,
      investors: selectedInvestors.map(investor => investor.value.toString())
    } : values;


    const { errors: validatedErrors, formIsValid: isValid } =
      Validation.validate(valuesToValidate, calculationErrorPriceQuantity);

    setErrors(validatedErrors);
    setFormIsValid(isValid);

    if (!isValid) return;

    const type = capitalize(getLastElement(values.type.split(".")));

    let receiver =
      values.type !== TransactionType.BUY ? values.receiver?.id : "";

    setIsFetching(true);

    const defaultFields = {
      type,
      product: values.product.id,
      investor: (values.investor as BasicData).id,
      quantity: values.isReturnTokens ? undefined : values.quantity
    };

    let dataToCreate: Partial<CreateTransactionRequest> = { ...defaultFields };

    if (values.type === TransactionType.SELL) {
      receiver = values.isReturnTokens ? ((sellHolding?.product as Product)?.issuer as string) : receiver;
      const receiverFieldName = values.isReturnTokens ? 'issuer' : 'receiver';

      dataToCreate = {
        ...dataToCreate,
        product: (sellHolding?.product as Product)?.id!,
        returnTokens: values.isReturnTokens,
        [receiverFieldName]: receiver
      };
    }

    if (values.type === TransactionType.PAYMENT) {
      dataToCreate = {
        ...dataToCreate,
        amount: values.ticketSize,
        investors: valuesToValidate.investors as string[],
        paymentType: values.paymentType
      };
    }

    return TransactionService
      .create(clearFromEmpty(dataToCreate))
      .finally(() => setIsFetching(false));
  };

  const onHandleSubmit = (e?: SubmitEvent | React.MouseEvent<HTMLElement>) => {
    try {
      handleSubmit(e)
        ?.then(() => {
          if (onClose) onClose();

          setSummaryData({
            isShown: true,
            isSuccess: true,
            title: "pages.transactions.success.title",
            subtitle: "pages.transactions.success.subtitle",
          });
        })
        .catch((err) => {
          console.log(err);

          const errorMessageText = err.response.data.message;
          const errorMessageName = getErrorMessageName(err.response.data.stack);
          const errorMsg = errorMessageName === 'validate' ? errorMessageText : t(`error.backend.${errorMessageName}`);

          setErrorMessage(errorMessageName === 'validate' ? errorMessageText : errorMessageName);
          openSnackBar(errorMsg);

          Object.entries(transactionErrors).forEach(([text, field]) => {
            if (errorMessageText.split(' ').includes(text))
              Validation.setFieldError(
                field as keyof createTransactionValidationFields,
                text
              );
          });
        })
        ?.finally(() => setIsFetching(false));
    } catch (error: any) {
      setErrorMessage(error.message);
      console.log(error);

      if (error?.response?.data?.stack) {
        openSnackBar(error.message);
      }
    }
  };

  const onReturnTokensToggle = () => setValues(prev => ({ ...prev, isReturnTokens: !prev.isReturnTokens }));

  const onTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...defaultValues,
      type: event.target.value as TransactionType,
    });

    setProducts([]);
    setProductsOptions([]);
    setInvestorsOptions([]);
    setReceiversOptions([]);
    setPaymentTypeOptions([]);

    setErrors(defaultErrors);
    setErrorMessage("");
  };

  const onInvestorChange = (option: Option) => {
    const product =
      values.type === TransactionType.PAYMENT
        ? values.product
        : defaultValues.product;
    const ticketSize =
      values.type === TransactionType.PAYMENT ? values.ticketSize : 0;
    const quantity = 0;

    const investor: BasicData = {
      id: option.value as string,
      name: option.label,
    };

    setValues({
      ...values,
      ticketSize,
      product,
      investor,
      quantity,
    });

    if (values.type !== TransactionType.PAYMENT) {
      Validation.resetFieldError("product");
    }

    Validation.resetFieldError("investor");
    setErrorMessage("");
  };

  const onInvestorOptionChange = (option: Option, operation: BadgeOperation) => {
    if (operation === BadgeOperation.add) return setSelectedInvestors(prev => prev.concat(option));

    const optionToDelete = selectedInvestors.find(el => el.value === option.value);

    if (!optionToDelete) return;

    setSelectedInvestors(prev => prev.filter(el => el.value !== option.value));
  };

  const onRecieverChange = (option: Option) => {
    setValues({
      ...values,
      receiver: {
        id: option.value as string,
        name: option.label,
      },
    });

    Validation.resetFieldError("receiver");
    setErrorMessage("");
  };

  const currentPrice = (productId: string) => {
    if (!productId) {
      return 0;
    }

    if (values.type === TransactionType.SELL && productId) {
      const chosenHolding = products.find((holding) => {
        const holdingId = isHolding(holding)
          ? (holding.product as Product).id
          : holding.id;

        return productId === holdingId;
      });

      setSellHolding(chosenHolding as Holding);
      setDefaultTicketSize(chosenHolding?.ticketSize!);

      return chosenHolding?.ticketSize!;
    }

    if (values.type === TransactionType.PAYMENT && productId && values.paymentType) {
      if (values.paymentType === PaymentType.DIVIDEND) return 0;

      const chosenProduct = products.find(
        (product) => product.id === productId
      );
      const amountPrice = getAmountPrice(chosenProduct as Product, values.paymentType!);

      setDefaultTicketSize(amountPrice);

      return amountPrice;
    }

    return values.ticketSize!;
  };

  const onProductChange = (option: Option) => {
    const currentProduct = getCurrentProduct(String(option.value));

    const productPaymentFrequency = currentProduct?.paymentFrequency as PaymentFrequency;
    let paymentType = defaultValues.paymentType;

    if (values.type === TransactionType.PAYMENT) {
      const paymentTypesItems = paymentTypes(currentProduct?.category as ProductCategory).map((item) => ({ ...item, label: t(item.label) }));

      setPaymentTypeOptions(paymentTypesItems);

      if (currentProduct && currentProduct?.category !== ProductCategory.Bond) {
        paymentType = PaymentType.DIVIDEND;
      }
    }

    const valuesToChange = {
      ...values,
      paymentType,
      ticketSize: currentPrice(option.value as string),
      isReturnTokens: currentProduct?.status === Status.inactive,
      product: {
        ...defaultValues.product,

        status: currentProduct?.status,
        id: option.value as string,
        name: option.label,
        paymentFrequency: productPaymentFrequency
          ? t(`paymentFrequency.${productPaymentFrequency}`)
          : ''
      },
    };

    setValues(valuesToChange);

    Validation.resetFieldError("product");
    Validation.resetFieldError("paymentType");
    setErrorMessage("");
  };

  const onPaymentTypeChange = (option: Option) => {
    setValues({
      ...values,
      paymentType: option.value as PaymentType
    });

    Validation.resetFieldError("paymentType");
  };

  const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    Validation.resetFieldError(
      event.target.name as keyof createTransactionValidationFields
    );
    setErrorMessage("");
  };

  const onMaskedValueChange = (
    name: string | undefined,
    value: string | number
  ) => {
    setValues({ ...values, [name as string]: value });

    Validation.resetFieldError(name as keyof createTransactionValidationFields);

    setErrorMessage("");
  };

  const updateInvestorsAmountReceived = () => {
    if (values.type === TransactionType.PAYMENT && values.paymentType) {
      const investorIds = selectedInvestors.map(item => item.value);

      const chosenProduct = products.find(product => product.id === values.product.id) as Product;
      const chosenInvestors = investors.filter(investor => investorIds.includes(investor.id!));

      if (chosenInvestors && chosenProduct) {
        setInvestorsAmountReceived(createAmountReceivedRow({
          investors: chosenInvestors,
          product: chosenProduct,
          paymentType: values.paymentType!,
          amount: values.ticketSize || 0
        }));
      }
    } else {
      setInvestorsAmountReceived([]);
    }
  };

  const investorFieldProps: SelectProps | BadgesProps = useMemo(
    () =>
      values.type === TransactionType.PAYMENT
        ? ({
          options: investorsOptions,
          onChange: onInvestorOptionChange,
          label: t("pages.transactions.form.investor"),
          placeholder: t("pages.transactions.form.investorPlaceholder"),
          values: selectedInvestors,
          errorMessage: t(errors.investors),
          disabled: isFetching,
        } as BadgesProps)
        : ({
          options: investorsOptions,
          onChange: onInvestorChange,
          label: t("pages.transactions.form.investor"),
          placeholder: t("pages.transactions.form.investorPlaceholder"),
          value: {
            label: (values.investor as BasicData).name,
            value: (values.investor as BasicData).id,
          },
          errorMessage: t(errors.investor),
          disabled: isFetching,
        } as SelectProps),
    [
      values.type,
      selectedInvestors,
      investorsOptions,
      values.investor,
      errors.investors,
      errors.investor,
    ]
  );

  const productFieldProps: SelectProps = {
    options: productsOptions,
    onChange: onProductChange,
    label: t("pages.transactions.form.product"),
    placeholder: t("pages.transactions.form.productPlaceholder"),
    value: { label: values.product.name, value: values.product.id },
    errorMessage: t(errors.product),
    disabled: isFetching
  };

  const paymentTypeFieldProps: SelectProps = {
    options: paymentTypeOptions,
    onChange: onPaymentTypeChange,
    label: t("pages.transactions.form.paymentType"),
    placeholder: t("pages.transactions.form.paymentTypePlaceholder"),
    value: { value: values.paymentType!, label: paymentTypeOptions.find(item => item.value === values.paymentType)?.label! },
    errorMessage: t(errors.paymentType),
    disabled: isFetching,
  };

  const quantityProps = useCallback(() => {
    const value = values.isReturnTokens && isSellTransaction ? getAvailableValues(sellHolding!, Number(values.ticketSize))[1] : (values.quantity || '');

    return {
      label: t("pages.transactions.form.quantity"),
      name: "quantity",
      inputProps: {
        value,
        onChange: onFieldChange,
        type: "number",
      },
      tipText: values.isReturnTokens ? '' : quantityTipText,
      isWithMask: true,
      isFloatValue: false,
      onMaskedValueChange: onMaskedValueChange,
      errorMessage: values.isReturnTokens ? '' : t(errors.quantity),
      disabled: isFetching || values.isReturnTokens
    };
  }, [
    values.quantity,
    values.type,
    values.isReturnTokens,
    values.product,
    values.holding,
    quantityTipText,
    errors.quantity
  ]);

  const priceInputProps = useCallback(
    () =>
      (name: string): InputProps => {
        const ticketSize = values.ticketSize || "";

        let label = t(`pages.transactions.form.${name}`);

        if ([TransactionType.BUY, TransactionType.SELL].includes(values.type)) {
          label = t(`pages.transactions.form.ticketSize`);
        }

        if (values.type === TransactionType.PAYMENT) {
          if (values.paymentType === PaymentType.INTEREST && values.product.paymentFrequency) {
            label = t('pages.transactions.form.amountPerFrequency', { paymentFrequency: values.product.paymentFrequency });
          }

          if (values.paymentType === PaymentType.REPAYMENT) {
            label = t('pages.transactions.form.amountRepayment', { paymentFrequency: values.product.paymentFrequency });
          }
        }


        return {
          label,
          name: "ticketSize",
          inputProps: {
            value: ticketSize,
            onChange: onFieldChange,
            type: "number",
            className:
              ticketSize &&
                Number(ticketSize) === Number(defaultTicketSize.toFixed(2))
                ? "input__value-prefilled"
                : "",
          },
          placeholder: t(`pages.transactions.form.ticketSize`),
          isWithMask: true,
          onMaskedValueChange: onMaskedValueChange,
          icon: <EuroIcon width="16px" height="16px" />,
          errorMessage: t(errors.ticketSize),
          disabled: values.type !== TransactionType.PAYMENT || isFetching,
        };
      },
    [
      values.type,
      values.paymentType,
      values.ticketSize,
      values.quantity,
      values.product.id,
      values.product.paymentFrequency,
      errors.ticketSize,
      (values.investor as BasicData).id,
      values.investors,
    ]
  );

  const returnTokensProps: CheckboxProps = useMemo(() => ({
    label: t('pages.transactions.form.returnTokensToIssuer'),
    checked: values.isReturnTokens!,
    onChange: onReturnTokensToggle,
    disabled: isFetching || (!values.product.id || !values.investor || values.product.status === Status.active)
  }), [values.holding, values.investor, values.isReturnTokens, values.product.id]);

  useEffect(() => {
    setErrors(Validation.Errors);
  }, [Validation.Errors]);

  useEffect(() => {
    Validation.reset();
    setErrorMessage("");

    if (values.type !== TransactionType.PAYMENT) {
      getInvestors();
    }

    if (values.type === TransactionType.SELL) {
      getReceivers();
    }

    if (values.type === TransactionType.PAYMENT) getProducts();
  }, [values.type]);

  useEffect(() => {
    if (values.type === TransactionType.PAYMENT && values.product.id) {
      setInvestorsOptions([]);
      setSelectedInvestors([]);
      getInvestors();
    }

  }, [values.type, values.product.id]);

  useEffect(() => {
    if ((values.investor as BasicData).id) {
      if (values.type === TransactionType.SELL) {
        const query: Query = {
          skip: 0,
          limit: 0,
          investorId: (values.investor as BasicData).id,
          isSellList: "true",
        };

        HoldingsService.getList(createQueryString(query))
          .then((res) => {
            const { data } = res.data;

            setProducts(data);
            setProductsOptions(
              data.map((holding) => createProductItem(holding))
            );
          })
          .catch((err) => console.log(err));
      }

      if (values.type === TransactionType.BUY) getProducts();
    } else {
      if ([TransactionType.BUY, TransactionType.SELL].includes(values.type)) {
        setProducts([]);
        setProductsOptions([]);
      }
    }
  }, [values.type, (values.investor as BasicData).id]);

  useEffect(() => {
    if (values.product.id && values.type === TransactionType.BUY) {
      ProductService.getItem(values.product.id)
        .then((res) => {
          const {
            data: { ticketSize },
          } = res;

          setValues({
            ...values,
            ticketSize: ticketSize || 0,
          });
        })
        .catch((err) => {
          console.log(err);

          setValues({
            ...values,
            product: defaultValues.product,
          });
        });
    }
  }, [values.product.id]);

  useEffect(() => {
    if (!errorMessage || !isActive) return;

    const errorField = errorMessage?.split(
      '"'
    )[1] as keyof createTransactionValidationFields;

    const fieldsErrors = Validation.setFieldError(
      errorField,
      validateErrorsLabels.invalid
    );

    setErrors(fieldsErrors);
  }, [errorMessage, isActive]);

  useEffect(() => {
    if (!values.product.id) setPurchaseAmount(0);

    if ([TransactionType.BUY, TransactionType.SELL].includes(values.type) && values.product.id) {
      calculationErrorPriceQuantity();
    } else {
      setQuantityTipText("");
    }
  }, [
    values.type,
    values.amount,
    values.quantity,
    values.product,
    values.ticketSize,
    values.isReturnTokens
  ]);

  useEffect(() => {
    if (!values.isReturnTokens) setValues({ ...values, quantity: 0 });
  }, [values.isReturnTokens]);

  useEffect(() => {
    updateInvestorsAmountReceived();
  }, [selectedInvestors, values.paymentType]);

  useEffect(() => {
    if (values.paymentType && [PaymentType.DIVIDEND, PaymentType.GENERIC].includes(values.paymentType)) {
      updateInvestorsAmountReceived();
    }
  }, [values.ticketSize]);

  useEffect(() => {
    setValues({
      ...values,
      ticketSize: currentPrice(values.product.id as string),
    });
  }, [values.paymentType]);

  return {
    t,
    onClose,
    onFieldChange,
    handleSubmit,
    onInvestorChange,
    onProductChange,
    onTypeChange,
    onRecieverChange,
    onHandleSubmit,
    onMaskedValueChange,

    values,
    errors,
    message,
    quantityTipText,
    purchaseAmount,

    formIsValid,
    isShown,
    isSuccess,
    visible,
    transactionTypesItems,
    receiversOptions,
    productsOptions,
    isFetching,
    isActive,
    isSellTransaction,
    isPaymentTransaction,


    investorFieldProps,
    productFieldProps,
    paymentTypeFieldProps,
    quantityProps,
    priceInputProps,
    returnTokensProps,
    tableHeadAmountReceived,
    investorsAmountReceived
  };
};

export default useCreateTransaction;
