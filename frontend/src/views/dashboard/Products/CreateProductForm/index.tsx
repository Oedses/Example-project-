import { Fragment } from 'react';
import { isInterestProduct, ProductCategory } from '../../../../../../shared/types/product';

import { Issuer } from '../../../../../../shared/types/issuer';

import { hoc } from '../../../../utils';

import { Button, Input, Radio, Select, DatePicker, Popup } from '../../../components/UI';
import { EuroIcon, PercentIcon, CheckMarkIcon } from '../../../components/icons';
import Snackbar from '../../../components/UI/Snackbar';

import useCreateProduct from './createProduct.hook';
import { ButtonView } from '../../../components/UI/Button/button.props';

const CreateProductForm = hoc(
  useCreateProduct,
  ({
    t,
    values,
    errors,
    isShown,
    onClose,
    onFieldChange,
    onMaskedValueChange,
    onPaymentTypeChange,
    onPaymentFrequencyChange,
    onMaturityChange,
    onNonCallPeriodChange,
    onHandleSubmit,
    onListingDateChange,
    onCategoryChange,
    onIssuerChange,
    paymentTypesItems,
    paymentFrequenciesItems,
    isFetching,
    isActive,
    message,
    issuers,
    visible,
    productCategories,
    productMaturityUnits,
    productNonCallPeriodUnits
  }) => (
    <Popup visible={!isShown && visible} onClose={onClose}>
      <div className="form-wrapper">
        <div className='form-container form-container_signup'>
          <div className="form">
            <h2 className='form__heading'>
              {t('pages.products.form.title')}
            </h2>

            <div className="form__description-wrapper">
              <p className='form__text'>
                {t('pages.products.form.subtitle')}
              </p>
            </div>

            <div className='form__inputs-wrapper'>
              <Input
                label={t('pages.products.form.productName')}
                name='name'
                inputProps={{
                  value: values.name,
                  onChange: onFieldChange,
                  disabled: isFetching
                }}
                disabled={isFetching}
                errorMessage={t(errors.name)}
              />

              <div className="form__row-container">
                <Input
                  icon={<EuroIcon width='16px' height='16px' />}
                  label={t('pages.products.form.ticketSize')}
                  name='ticketSize'
                  inputProps={{ value: values.ticketSize || '', onChange: onFieldChange, disabled: isFetching }}
                  isWithMask
                  onMaskedValueChange={onMaskedValueChange}
                  errorMessage={t(errors.ticketSize)}
                  disabled={isFetching}
                />

                <Input
                  label={t('pages.products.form.quantity')}
                  name='quantity'
                  inputProps={{ value: values.quantity || '', onChange: onFieldChange, disabled: isFetching }}
                  isWithMask
                  isFloatValue={false}
                  onMaskedValueChange={onMaskedValueChange}
                  disabled={isFetching}
                  errorMessage={t(errors.quantity)}
                />
              </div>

              <div className="form__row-container">
                <Select
                  options={issuers}
                  onChange={onIssuerChange}
                  label={t('pages.products.form.issuer')}
                  placeholder={t('pages.products.form.selectIssuer')}
                  value={{
                    label: (values.issuer as Pick<Issuer, 'id' | 'name'>).name,
                    value: (values.issuer as Pick<Issuer, 'id' | 'name'>).id as string
                  }}
                  disabled={isFetching}
                  errorMessage={t(errors.issuer)}
                />

                <Select
                  options={productCategories}
                  onChange={onCategoryChange}
                  label={t('pages.products.form.category')}
                  placeholder={t('pages.products.form.categoryPlaceholder')}
                  value={{ label: values.category, value: values.category }}
                  disabled={isFetching}
                  errorMessage={t(errors.category)}
                />
              </div>

              <Radio
                items={paymentTypesItems}
                inputProps={{ onChange: onPaymentTypeChange, disabled: isFetching }}
                label={t('pages.products.form.paymentType')}
                value={values.paymentType}
              />

              {values.category === ProductCategory.Bond ? (
                <Radio
                  items={paymentFrequenciesItems}
                  inputProps={{ onChange: onPaymentFrequencyChange, disabled: isFetching }}
                  label={t('pages.products.form.paymentFrequency')}
                  value={values.paymentFrequency}
                />
              ) : null}


              {isInterestProduct(values) &&
                <Fragment>
                  <div className="form__row-container">
                    <Input
                      label={t('pages.products.form.couponRate')}
                      name='couponRate'
                      inputProps={{
                        value: values.couponRate || '',
                        onChange: onFieldChange,
                        disabled: isFetching,
                        type: 'number',
                        step: 0.5,
                        min: 0.5
                      }}
                      icon={<PercentIcon width='16px' height='16px' />}
                      disabled={isFetching}
                      errorMessage={t(errors.couponRate)}
                    />
                  </div>

                  <div className="form__row-container">
                    <Input
                      label={t('pages.products.form.maturity')}
                      name='maturity'
                      inputProps={{
                        value: values.maturity || '',
                        onChange: onFieldChange,
                        disabled: isFetching,
                        type: 'number',
                        min: 1
                      }}
                      disabled={isFetching}
                      errorMessage={t(errors.maturity)}
                    />

                    <Radio
                      items={productMaturityUnits}
                      inputProps={{ onChange: onMaturityChange, disabled: isFetching }}
                      label={t('pages.products.form.maturityUnit')}
                      value={values.maturityUnit}
                    />
                  </div>
                  <div className="form__row-container">
                    <Input
                      label={t('pages.products.form.nonCallPeriod')}
                      name='nonCallPeriod'
                      inputProps={{
                        value: values.nonCallPeriod || '',
                        onChange: onFieldChange,
                        type: 'number',
                        disabled: isFetching,
                        min: 0
                      }}
                      disabled={isFetching}
                      errorMessage={t(errors.nonCallPeriod)}
                    />

                    <Radio
                      items={productNonCallPeriodUnits}
                      inputProps={{ onChange: onNonCallPeriodChange, disabled: isFetching }}
                      label={t('pages.products.form.nonCallPeriodUnit')}
                      value={values.nonCallPeriodUnit}
                    />
                  </div>

                  <div className='form__row-container'>
                    <Input
                      label={t('pages.products.form.depository')}
                      name='depository'
                      inputProps={{
                        value: values.depository,
                        onChange: onFieldChange,
                        disabled: isFetching,
                      }}
                      disabled={isFetching}
                      errorMessage={t(errors.depository)}
                    />

                    <Input
                      label={t('pages.products.form.isin')}
                      name='isin'
                      inputProps={{
                        value: values.isin,
                        onChange: onFieldChange,
                        disabled: isFetching,
                      }}
                      disabled={isFetching}
                      errorMessage={t(errors.isin)}
                    />
                  </div>
                </Fragment>
              }

              <div className="radio">
                <label  className="label">
                  {t('pages.products.form.listingDate')}
                </label>
                <div className="form__row-container">
                  <DatePicker
                    className="form__full-width-datepicker"
                    date={values.listingDate}
                    onChange={onListingDateChange}
                    placeholder={t(
                      'pages.products.form.listingDatePlaceholder'
                    )}
                    disabled={isFetching}
                    errorMessage={t(errors.listingDate)}
                  />
                </div>
              </div>

            </div>

            <Button
              view={ButtonView.green}
              fullWidth
              onClick={onHandleSubmit}
              disabled={isFetching}
            >
              <CheckMarkIcon width="16px" height="16px" />
              {t('pages.products.form.submit')}
            </Button>
          </div>
        </div>
      </div>
      <Snackbar message={message} isActive={isActive} />
    </Popup>
  )
);

export default CreateProductForm;
