import { useCreateInvestor } from './createInvestor.hook';

import { hoc } from '../../../../utils';

import { Button, Input, Popup, Radio } from '../../../components/UI';
import { CheckMarkIcon } from '../../../components/icons';
import Snackbar from '../../../components/UI/Snackbar';

import { InvestorType, isNaturalPerson } from '../../../../../../shared/types/investor';

const CreateInvestorForm = hoc(
  useCreateInvestor,
  ({
    t,
    values,
    onRadioChange,
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
              {isEdit ? t("pages.investors.form.edit.title") : t("pages.investors.form.title")}
            </h2>

            {!isEdit && (
              <div className="form__description-wrapper">
                <p className="form__text">
                  {t("pages.investors.form.subtitle")}
                </p>
              </div>
            )}

            <div className="form__inputs-wrapper">
              <Radio
                label={t("pages.signUp.form.entityType")}
                value={values.type}
                items={[
                  {
                    value: InvestorType.NATURAL_PERSON,
                    label: t(
                      "pages.signUp.form.entityTypes.naturalPerson"
                    ),
                  },
                  {
                    value: InvestorType.LEGAL_ENTITY,
                    label: t(
                      "pages.signUp.form.entityTypes.lagalEntity"
                    ),
                  },
                ]}
                inputProps={{
                  onChange: onRadioChange,
                  disabled: isFetching || isEdit
                }}
              />
              {isNaturalPerson(values) ? (
                <div className="form__row-container">
                  <Input
                    label={t("pages.signUp.form.firstName")}
                    name="firstName"
                    inputProps={{
                      value: values.firstName,
                      placeholder: t("pages.signUp.form.firstName"),
                      onChange: onFieldChange,
                      onBlur: onBlur
                    }}
                    errorMessage={t(errors.firstName)}
                    disabled={isFetching}
                  />

                  <Input
                    label={t("pages.signUp.form.lastName")}
                    name="lastName"
                    inputProps={{
                      value: values.lastName,
                      placeholder: t("pages.signUp.form.lastName"),
                      onChange: onFieldChange,
                      onBlur: onBlur
                    }}
                    errorMessage={t(errors.lastName)}
                    disabled={isFetching}
                  />
                </div>
              ) : (
                <>
                  <Input
                    label={t("pages.signUp.form.kvk")}
                    name="kvk"
                    inputProps={{
                      value: values.kvk,
                      placeholder: '00000000',
                      onChange: onFieldChange,
                      onBlur: onBlur
                    }}
                    maxLength={8}
                    errorMessage={t(errors.kvk)}
                    disabled={isFetching}
                  />

                  <Input
                    label={t("pages.signUp.form.companyName")}
                    name="companyName"
                    inputProps={{
                      value: values.companyName,
                      placeholder: t("pages.signUp.form.companyName"),
                      onChange: onFieldChange,
                      onBlur: onBlur
                    }}
                    errorMessage={t(errors.companyName)}
                    disabled={isFetching}
                  />
                </>
              )}

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

              {isNaturalPerson(values) && (
                <Input
                  label={t("pages.signUp.form.bsn")}
                  name="bsn"
                  inputProps={{
                    value: values.bsn,
                    placeholder: '000000000',
                    onChange: onFieldChange,
                    onBlur: onBlur
                  }}
                  maxLength={9}
                  errorMessage={t(errors.bsn)}
                  disabled={isFetching}
                />
              )}

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
                {t("pages.investors.form.saveInvestor")}
              </Button>
            </div>
          </div>
        </div>
      <Snackbar message={message} isActive={isActive} />
    </Popup>
  )
);

export default CreateInvestorForm;
