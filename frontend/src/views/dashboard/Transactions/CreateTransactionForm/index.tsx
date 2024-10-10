/* eslint-disable @typescript-eslint/no-use-before-define */
import { Fragment } from "react";

import { hoc } from "./../../../../utils";

import { Button, Input, Popup, Radio, Select, Table } from "../../../components/UI";
import Snackbar from "../../../components/UI/Snackbar";
import { EuroIcon } from "../../../components/icons";

import { PaymentType, TransactionType } from "../../../../../../shared/types/transaction";

import useCreateTransaction from "./createTransaction.hook";
import { FieldsForPayment, DefaultFields } from "./createTransaction.helper";
import { Checkbox } from "../../../components/UI/Checkbox";
import { ButtonView } from "../../../components/UI/Button/button.props";


const CreateProductForm = hoc(
  useCreateTransaction,
  ({
    t,
    onClose,
    onTypeChange,
    onRecieverChange,
    onHandleSubmit,
    onMaskedValueChange,

    values,
    errors,
    message,
    purchaseAmount,

    isShown,
    visible,
    transactionTypesItems,
    receiversOptions,
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
  }) => {
    return (
      <Fragment>

        <Popup visible={!isShown && visible} onClose={onClose}>
          <div className="form-wrapper">
            <div className="form-container form-container_signup">
              <div className="form">
                <h2 className="form__heading">
                  {t("pages.transactions.form.title")}
                </h2>

                <div className="form__description-wrapper">
                  <p className="form__text">
                    {t("pages.transactions.form.subtitle")}
                  </p>
                </div>

                <div className="form__inputs-wrapper">
                  <Radio
                    items={transactionTypesItems}
                    label={t("pages.transactions.form.transactionType")}
                    inputProps={{
                      onChange: onTypeChange,
                      disabled: isFetching,
                    }}
                    value={values.type}
                  />

                  {isPaymentTransaction ? (
                    <FieldsForPayment
                      investorFieldProps={investorFieldProps}
                      productFieldProps={productFieldProps}
                      paymentTypeFieldProps={paymentTypeFieldProps}
                      amountInputsProps={{
                        type: TransactionType.PAYMENT,
                        name: 'amount',
                        quantityProps: quantityProps(),
                        priceProps: priceInputProps()
                      }}
                    />
                  ) : (
                    <DefaultFields
                      investorFieldProps={investorFieldProps}
                      productFieldProps={productFieldProps}
                      amountInputsProps={{
                        type: values.type,
                        name: 'ticketSize',
                        quantityProps: quantityProps(),
                        priceProps: priceInputProps()
                      }}
                    />
                  )}

                {!isPaymentTransaction &&
                  (<div className="form__row-container">
                    <Input
                      label={t('pages.transactions.form.purchaseAmount')}
                      name='amount'
                      inputProps={{
                        value: purchaseAmount,
                        disabled: true,
                      }}
                      isWithMask
                      onMaskedValueChange={onMaskedValueChange}
                      icon={<EuroIcon width='16px' height='16px' />}
                      disabled={true}
                    />

                    {isSellTransaction && (
                      <Checkbox {...returnTokensProps}/>
                    )}
                  </div>)
                }

                  {isSellTransaction && !returnTokensProps.checked && (
                    <Select
                      options={receiversOptions}
                      onChange={onRecieverChange}
                      label={t("pages.transactions.form.receiver")}
                      placeholder={t(
                        "pages.transactions.form.receiverPlaceholder"
                      )}
                      value={{
                        label: values.receiver.name,
                        value: values.receiver.id,
                      }}
                      errorMessage={t(errors.receiver)}
                      disabled={isFetching}
                    />
                  )}
                </div>

                {investorsAmountReceived && investorsAmountReceived.length > 0 && (
                  <div>
                    <h2 className="form__heading">
                      { values.paymentType === PaymentType.INTEREST ? t("pages.transactions.form.amountReceived") : t("pages.transactions.form.amountRepaid")}
                    </h2>

                    <Table
                      theadData={tableHeadAmountReceived(values.paymentType!).map(item => t(item))}
                      tbodyData={investorsAmountReceived}
                      centeredColumns={[1, 2]}
                    />
                  </div>
                )}
                <Button
                  view={ButtonView.green}
                  fullWidth
                  onClick={onHandleSubmit}
                  disabled={isFetching}
                >
                  {t("pages.transactions.form.submit")}
                </Button>
              </div>
            </div>
          </div>
        </Popup>
        <Snackbar message={message} isActive={isActive} />
      </Fragment>
    );
  }
);

export default CreateProductForm;
