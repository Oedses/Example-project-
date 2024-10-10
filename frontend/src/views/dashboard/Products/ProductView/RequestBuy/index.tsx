import NumberFormat from "react-number-format";
import { hoc } from '../../../../../utils';

import { CheckMarkIcon, EuroIcon } from '../../../../components/icons';
import { Button, Input, Popup } from '../../../../components/UI';
import { ButtonView } from "../../../../components/UI/Button/button.props";
import Snackbar from '../../../../components/UI/Snackbar';

import { useRequestBuyProps } from './request-buy-hook';
import './request-buy.scss';


const RequestBuyForm = hoc(useRequestBuyProps, ({
  t,
  isFetching,
  errors,
  values,
  onBlur,
  onSubmit,
  visible,
  isShown,
  message,
  isActive,
  onClose,
  product,
  tipText,
  onMaskedValueChange
}) => {
  return (
    <Popup visible={!isShown && visible} onClose={onClose}>
      <div className="form-wrapper">
      <div className="form-container form-container_signup">
        <div className="form">
          <h2 className="form__heading">
            {t('pages.products.view.requestBuy.form.title')}
          </h2>

          <div className="form__description-wrapper">
            <p className="form__text">
              {t('pages.products.view.requestBuy.form.subtitle')}
            </p>
          </div>

          <div className="form__inputs-wrapper">
            <div>
              <p className="list-item__title">
                {t('pages.products.view.requestBuy.form.infoFields.product')}
              </p>
              <p className="list-item__content">{product?.name || ''}</p>
            </div>

            <div className="form_flex">
              <p className="list-item__content">
                {t('pages.products.view.requestBuy.form.infoFields.ticketSize')}
                : <NumberFormat
                    value={product?.ticketSize || 0}
                    prefix='€ '
                    thousandSeparator='.'
                    decimalSeparator=','
                    displayType='text'
                    fixedDecimalScale={true}
                    decimalScale={2}
                  />
              </p>
            </div>

            <Input
              className='request-buy__quantity'
              label={t('pages.products.view.requestBuy.form.inputFields.quantity.label')}
              name='quantity'
              inputProps={{
                value: values.quantity || '',
                placeholder: t('pages.products.view.requestBuy.form.inputFields.quantity.placeholder'),
                onBlur: onBlur,
                disabled: isFetching,
                type: 'number',
                min: 0,
              }}
              disabled={isFetching}
              errorMessage={t(errors.quantity.toString())}
              isWithMask
              tipText={tipText}
              onMaskedValueChange={onMaskedValueChange}
              isFloatValue={false}
            />

            <Input
              label={t('pages.products.view.requestBuy.form.inputFields.amount.label')}
              name='amount'
              inputProps={{
                value: product?.ticketSize! * Number(values.quantity) || '',
                placeholder: t('pages.products.view.requestBuy.form.inputFields.amount.placeholder'),
                // onBlur: onBlur,
                // onChange: onFieldChange,
                disabled: true,
                type: 'number',
              }}
              isWithMask
              onMaskedValueChange={onMaskedValueChange}
              icon={<EuroIcon width='16px' height='16px' />}
              disabled={true}
              errorMessage={t(errors.ticketSize.toString())}
            />
          </div>

          <Button
            view={ButtonView.green}
            fullWidth
            onClick={onSubmit}
            disabled={isFetching}
          >
            <CheckMarkIcon width="16px" height="16px" />

            {t('pages.products.view.requestBuy.form.submit')}
          </Button>
        </div>
      </div>
    </div>
    <Snackbar message={message} isActive={isActive} />
    </Popup>
  );
});

export { RequestBuyForm };
