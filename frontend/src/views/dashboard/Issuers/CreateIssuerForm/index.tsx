import { hoc } from '../../../../utils';

import { Button, Input, Popup } from '../../../components/UI';
import { CheckMarkIcon } from '../../../components/icons';
import Snackbar from '../../../components/UI/Snackbar';

import { maxKVKLength, maxVATLength } from './CreateIssuer.constants';
import { useCreateInvestor } from './CreateIssuer.hook';

const CreateIssuerForm = hoc(
  useCreateInvestor,
  ({
    t,
    values,
    errors,
    onFieldChange,
    onSubmit,
    message,
    isActive,
    isFetching,
    onClose,
    onBlur,
    visible,
    isShown,
    isEdit
  }) => (
    <Popup visible={!isShown && visible} onClose={onClose}>
      <div className="form-container form-container_create-investor">
        <div className="form">
          <h2 className="form__heading">
            {isEdit ?
              t("pages.issuer.form.edit.title") :
              t("pages.issuer.form.title")
            }
          </h2>


          <div className="form__description-wrapper">
            <p className="form__text">
              {isEdit ?
                t("pages.issuer.form.edit.subtitle") :
                t("pages.issuer.form.subtitle")
              }
            </p>
          </div>

          <div className="form__inputs-wrapper">
            <div className="font__row-container">
              <Input
                label={t("pages.issuer.form.name")}
                name="name"
                inputProps={{
                  value: values.name,
                  placeholder: t("pages.issuer.form.namePLaceholder"),
                  onChange: onFieldChange,
                  onBlur: onBlur
                }}
                errorMessage={t(errors.name)}
                disabled={isFetching}
              />
            </div>

            <div className="form__row-container">
              <Input
                label={t("pages.signUp.form.email")}
                name="email"
                inputProps={{
                  value: values.email,
                  placeholder: t("pages.signUp.form.email"),
                  onChange: onFieldChange,
                  onBlur: onBlur
                }}
                errorMessage={t(errors.email)}
                disabled={isFetching}
              />

              <Input
                label={t("pages.signUp.form.phoneNumber")}
                name="phone"
                inputProps={{
                  value: values.phone,
                  placeholder: '+31 000000000',
                  onChange: onFieldChange,
                  onBlur: onBlur
                }}
                errorMessage={t(errors.phone)}
                disabled={isFetching}
              />
            </div>

            <div className="form__row-container">
              <Input
                label={t("pages.issuer.form.kvk")}
                name="kvk"
                inputProps={{
                  value: values.kvk,
                  placeholder: '00000000',
                  onChange: onFieldChange,
                  onBlur: onBlur
                }}
                maxLength={maxKVKLength}
                errorMessage={t(errors.kvk)}
                disabled={isFetching}
              />
              <Input
                label={t("VAT ID")}
                name="vat"
                inputProps={{
                  value: values.vat,
                  placeholder: 'NL000000000',
                  onChange: onFieldChange,
                  onBlur: onBlur
                }}
                maxLength={maxVATLength}
                errorMessage={t(errors.vat)}
                disabled={isFetching}
              />
            </div>


            <Input
              label={t("pages.signUp.form.streetAddress")}
              name="address"
              inputProps={{
                value: values.address,
                placeholder: t("pages.signUp.form.streetAddress"),
                onChange: onFieldChange,
                onBlur: onBlur
              }}
              errorMessage={t(errors.address)}
              disabled={isFetching}
            />

            <div className="form__row-container">
              <Input
                label={t("pages.signUp.form.postalCode")}
                name="postcode"
                inputProps={{
                  value: values.postcode,
                  placeholder: '0000AA',
                  onChange: onFieldChange,
                  onBlur: onBlur
                }}
                errorMessage={t(errors.postcode)}
                disabled={isFetching}
              />

              <Input
                label={t("pages.signUp.form.city")}
                name="city"
                inputProps={{
                  value: values.city,
                  placeholder: t("pages.signUp.form.city"),
                  onChange: onFieldChange,
                  onBlur: onBlur
                }}
                errorMessage={t(errors.city)}
                disabled={isFetching}
              />
            </div>
          </div>

          <div className="form__buttons-container">
            <Button
              fullWidth
              onClick={onSubmit}
              disabled={isFetching}
            >
              <CheckMarkIcon width="16px" height="16px" />
              {t("pages.issuer.form.submit")}
            </Button>
          </div>
        </div>
      </div>
      <Snackbar message={message} isActive={isActive} />
    </Popup>
  )
);

export default CreateIssuerForm;
