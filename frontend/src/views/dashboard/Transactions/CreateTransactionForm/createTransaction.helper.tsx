import { memo, Fragment } from "react";
import { TransactionType } from "../../../../../../shared/types/transaction";
import { Select, Input } from "../../../components/UI";
import { Badges } from "../../../components/UI/Badges";
import { BadgesProps } from "../../../components/UI/Badges/badges.hook";
import { InputProps } from "../../../components/UI/Input/input.props";
import { SelectProps } from "../../../components/UI/Select";

type FieldsInputsProps = {
  investorFieldProps: SelectProps | BadgesProps;
  productFieldProps: SelectProps;
  amountInputsProps: AmountInputProps;
};

type FieldsInputsPaymentProps = FieldsInputsProps & {
  paymentTypeFieldProps: SelectProps
};

type AmountInputProps = {
  type: TransactionType
  name: 'amount' | 'ticketSize';
  priceProps: (name: string) => InputProps;
  quantityProps: InputProps;
};

const AmountInputs = memo(({ type, name, priceProps, quantityProps }: AmountInputProps) => (
  type !== TransactionType.PAYMENT ? (
    <div className="form__row-container" key={name}>
      <Input {...(priceProps(name))} />
      <Input {...quantityProps} />
    </div>
  ) : (
    <Input {...(priceProps(name))} />
  )
));

export const DefaultFields = memo(({ investorFieldProps, productFieldProps, amountInputsProps }: FieldsInputsProps) => (
  <Fragment>
    <Select {...investorFieldProps as SelectProps} />
    <Select {...productFieldProps} />
    <AmountInputs {...amountInputsProps} />
  </Fragment>
));

export const FieldsForPayment = memo(({ investorFieldProps, productFieldProps, amountInputsProps, paymentTypeFieldProps }: FieldsInputsPaymentProps) => (
  <Fragment>
    <Select {...productFieldProps} />
    <Select {...paymentTypeFieldProps} />
    <AmountInputs {...amountInputsProps} />
    <Badges {...investorFieldProps as BadgesProps} />
  </Fragment>
));