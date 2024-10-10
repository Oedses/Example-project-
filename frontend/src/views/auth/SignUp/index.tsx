/* eslint-disable @typescript-eslint/no-redeclare */
import { Input, Button, Radio } from "../../components/UI";
import { InvestorType, isNaturalPerson } from "../../../../../shared/types/investor";
import "../auth.scss";
import { ArrowLeft, SendIcon } from "../../components/icons";
import Snackbar from "../../components/UI/Snackbar";

import { hoc } from "./../../../utils/hoc";
import { useSignUp } from "./signUp.hook";
import { Fragment } from "react";
import { ButtonSize, ButtonView } from "../../components/UI/Button/button.props";

const SignUp = hoc(
  useSignUp,
  ({
    t,
    imageIsReady,
    values,
    onRadioChange,
    errors,
    onFieldChange,
    onLanguageChange,
    onCancel,
    onSubmit,
    message,
    isActive,
    isFetching,
    background,
    onBlur,
    currentLanguage
  }) => {
    return (
      <div className="auth-page">
        {imageIsReady && (
          <Fragment>
            <div className="auth-page__background">
              <img src={background} alt="Netherland" />
            </div>

            <div className="container">
              <div className="form-container form-container_signup">
                <div className="form">
                  <h2 className="form__heading">
                    {t("pages.signUp.form.title")}
                  </h2>

                  <div className="form__description-wrapper">
                    <p className="form__text">
                      {t("pages.signUp.form.subtitle")}
                    </p>
                  </div>

                  <div className="form__row-container form-locale__container">
                    <p className='form-locale__text'>{t('menu.currentLanguage', { currentLanguage })}</p>

                    <Button
                      view={ButtonView.link}
                      size={ButtonSize.small}
                      onClick={onLanguageChange}
                      disabled={isFetching}
                    >
                      {t("menu.changeLanguage")}
                    </Button>
                  </div>


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
                        disabled: isFetching
                      }}
                    />
                    {isNaturalPerson(values) ? (
                      <div className="form__row-container">
                        <Input
                          label={t("pages.signUp.form.firstName")}
                          name="firstName"
                          errorMessage={t(errors.firstName)}
                          disabled={isFetching}
                          inputProps={{
                            value: values.firstName,
                            placeholder: t("pages.signUp.form.firstName"),
                            onChange: onFieldChange,
                            onBlur: onBlur
                          }}
                        />

                        <Input
                          label={t("pages.signUp.form.lastName")}
                          name="lastName"
                          errorMessage={t(errors.lastName)}
                          disabled={isFetching}
                          inputProps={{
                            value: values.lastName,
                            placeholder: t("pages.signUp.form.lastName"),
                            onChange: onFieldChange,
                            onBlur: onBlur
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <Input
                          label={t("pages.signUp.form.kvk")}
                          name="kvk"
                          errorMessage={t(errors.kvk)}
                          disabled={isFetching}
                          maxLength={8}
                          inputProps={{
                            value: values.kvk,
                            placeholder: '00000000',
                            onChange: onFieldChange,
                            onBlur: onBlur
                          }}
                        />

                        <Input
                          label={t("pages.signUp.form.companyName")}
                          name="companyName"
                          errorMessage={t(errors.companyName)}
                          disabled={isFetching}
                          inputProps={{
                            value: values.companyName,
                            placeholder: t("pages.signUp.form.companyName"),
                            onChange: onFieldChange,
                            onBlur: onBlur
                          }}
                        />
                      </>
                    )}

                    <div className="form__row-container">
                      <Input
                        label={t("pages.signUp.form.email")}
                        name="email"
                        errorMessage={t(errors.email)}
                        disabled={isFetching}
                        inputProps={{
                          value: values.email,
                          placeholder: t("pages.signUp.form.email"),
                          onChange: onFieldChange,
                          onBlur: onBlur
                        }}
                      />

                      <Input
                        label={t("pages.signUp.form.phoneNumber")}
                        name="phone"
                        errorMessage={t(errors.phone)}
                        disabled={isFetching}
                        inputProps={{
                          value: values.phone,
                          placeholder: '+31 000000000',
                          onChange: onFieldChange,
                          onBlur: onBlur
                        }}
                      />
                    </div>

                    {isNaturalPerson(values) && (
                      <Input
                        label={t("pages.signUp.form.bsn")}
                        name="bsn"
                        errorMessage={t(errors.bsn)}
                        disabled={isFetching}
                        maxLength={9}
                        inputProps={{
                          value: values.bsn,
                          placeholder: '000000000',
                          onChange: onFieldChange,
                          onBlur: onBlur
                        }}
                      />
                    )}

                    <Input
                      label={t("pages.signUp.form.streetAddress")}
                      name="address"
                      errorMessage={t(errors.address)}
                      disabled={isFetching}
                      inputProps={{
                        value: values.address,
                        placeholder: t("pages.signUp.form.streetAddress"),
                        onChange: onFieldChange,
                        onBlur: onBlur
                      }}
                    />

                    <div className="form__row-container">
                      <Input
                        label={t("pages.signUp.form.postalCode")}
                        name="postcode"
                        errorMessage={t(errors.postcode)}
                        disabled={isFetching}
                        inputProps={{
                          value: values.postcode,
                          placeholder: '0000AA',
                          onChange: onFieldChange,
                          onBlur: onBlur
                        }}
                      />

                      <Input
                        label={t("pages.signUp.form.city")}
                        name="city"
                        errorMessage={t(errors.city)}
                        disabled={isFetching}
                        inputProps={{
                          value: values.city,
                          placeholder: t("pages.signUp.form.city"),
                          onChange: onFieldChange,
                          onBlur: onBlur
                        }}
                      />
                    </div>
                  </div>

                  <div className="form__buttons-container">
                    <Button
                      view={ButtonView.unfilled}
                      onClick={onCancel}
                      disabled={isFetching}
                    >
                      <ArrowLeft width="16px" height="16px" />
                      {t("pages.signUp.form.cancel")}
                    </Button>

                    <Button
                      onClick={onSubmit}
                      disabled={isFetching}
                    >
                      <SendIcon width="16px" height="16px" />
                      {t("pages.signUp.form.submit")}
                    </Button>
                  </div>
                </div>
              </div>
              <Snackbar message={message} isActive={isActive} />
            </div>
          </Fragment>
        )}
      </div>
    );
  }
);

export default SignUp;
