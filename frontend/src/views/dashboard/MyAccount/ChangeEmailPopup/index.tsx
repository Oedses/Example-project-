import { ChangeEvent, FocusEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Popup } from "../../../components/UI";
import { ArrowRight, CheckMarkIcon } from "../../../components/icons";
import UserService from "../../../../services/UserService";

import { defaultErrors, defaultErrorsVerifyCode, defaultValues, defaultValuesVerifyCode, VerifyCodeFields, VerifyEmailFields } from "./ChangeEmailPopup.constants";

import { ValidationChangeEmail, ValidationVerifyCode } from './validation';
import { getErrorMessageName } from "../../../../utils/fn";
import { CheckVerificationCodeRequest } from "../../../../../../shared/types/verification-code";
import regex from "../../../../../../shared/regex";
import SummaryContext from "../../../../store/contexts/summary-context";
import { ChangeEmailRequest } from "../../../../../../shared/types/user";

type ChangeEmailPopupProps = {
    visible: boolean;
    callback: () => void;
    onClose: () => void;
    openSnackBar: (msg: string) => void;
};

const ChangeEmailPopup = ({ visible, callback, onClose, openSnackBar }: ChangeEmailPopupProps) => {
    const { t } = useTranslation();
    const [isFetching, setIsFetching] = useState(false);
    const [openVerifyCode, setOpenVerifyCode] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [resendInSecondsTimer, setResendInSecondsTimer] = useState(5);
    
    const { setData: setSummaryData } = SummaryContext.useContext();

    const [values, setValues] = useState<ChangeEmailRequest>(defaultValues);
    const [valuesVerification, setValuesVerification] = useState<CheckVerificationCodeRequest>(defaultValuesVerifyCode);
    const [errors, setErrors] = useState<VerifyEmailFields>(defaultErrors);
    const [errorsVerification, setErrorsVerification] = useState<VerifyCodeFields>(defaultErrorsVerifyCode);

    const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputName = event.target.name as keyof ChangeEmailRequest;
        let { value } = event.target;

        if (inputName === 'email' && value.includes(' ')) return;

        ValidationChangeEmail.resetFieldError(
            inputName as keyof ChangeEmailRequest
        );

        setErrors(ValidationChangeEmail.Errors);
        setValues({ ...values, [inputName]: value });
    };

    const onBlur = (event: FocusEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        ValidationChangeEmail.validateField(name as keyof ChangeEmailRequest, value);

        setErrors(ValidationChangeEmail.Errors);
    };

    const onFieldChangeVerification = (event: ChangeEvent<HTMLInputElement>) => {
        const inputName = event.target.name as keyof VerifyCodeFields;
        let { value } = event.target;

        if (value?.length && !regex.numbersOnly.test(value)) return;
        if (value?.length > 4) return;

        ValidationVerifyCode.resetFieldError(
            inputName as keyof VerifyCodeFields
        );

        setErrorsVerification(ValidationVerifyCode.Errors);
        setValuesVerification({ ...valuesVerification, [inputName]: value });
    };

    const onBlurVerification = (event: FocusEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        ValidationVerifyCode.validateField(name as keyof VerifyCodeFields, value);

        setErrorsVerification(ValidationVerifyCode.Errors);
    };

    const onCloseSuccessPopup = () => {
        callback();
        onClose();
    };

    const startTimer = (timer: number) => {
        let newSecond = timer;
        const updateTimer = async () => {
            newSecond -= 1; 

            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            if (newSecond === 0) clearInterval(timeInterval);
            
            if (timer >= 0) setResendInSecondsTimer(newSecond);
        };

        const timeInterval = setInterval(updateTimer, 1000);
    };

    const changeSubmit = () => {
        const { errors: validatedErrors, formIsValid: isValid } =
            ValidationChangeEmail.validate(values);
        const timer = 5;

        setErrors(validatedErrors);

        if (!isValid) return;

        setResendInSecondsTimer(timer);
        setIsFetching(true);

        UserService.changeEmail(values)
            .then(() => {
                setOpenVerifyCode(true);
                startTimer(timer);
            })
            .catch(err => {
                const errorMessageText = err.response.data.message;
                const errorMessageName = getErrorMessageName(err.response.data.stack);
                const errorMsg = errorMessageName !== 'validate' ? t(`error.backend.${errorMessageName}`) : errorMessageText;
                
                openSnackBar(errorMsg);
            })
            .finally(() => setIsFetching(false));
    };

    const checkVerificationCodeSubmit = () => {
        const { errors: validatedErrors, formIsValid: isValid } =
        ValidationVerifyCode.validate(valuesVerification);

        setErrorsVerification(validatedErrors);

        if (!isValid) return;

        setIsFetching(true);

        UserService.checkVerificationCode(valuesVerification)
            .then(() => {
                setOpenVerifyCode(false);
                setOpenSuccess(true);

                setSummaryData({
                    isShown: true,
                    isSuccess: true,
                    title: 'pages.myAccount.verifyEmailPopup.success.title',
                    subtitle: 'pages.myAccount.verifyEmailPopup.success.subtitle',
                    onCloseCallback: onCloseSuccessPopup
                });
            })
            .catch(err => {
                const errorMessageText = err.response.data.message;
                const errorMessageName = getErrorMessageName(err.response.data.stack);
                const errorMsg = !['GraphError', 'validate'].includes(errorMessageName) ? t(`error.backend.${errorMessageName}`) : errorMessageText;
                
                openSnackBar(errorMsg);
            })
            .finally(() => setIsFetching(false));
    };

    return (
        <>
            {openVerifyCode && <Popup visible={openVerifyCode} onClose={() => setOpenVerifyCode(false)}>
            <div className="form-container">
                    <div className="form">
                        <h2 className="form__heading">
                            {t("pages.myAccount.verifyEmailPopup.title")}
                        </h2>

                        <div className="form__description-wrapper">
                            <p className="form__text">
                                {t("pages.myAccount.verifyEmailPopup.subtitle", { email: values.email })}
                            </p>
                        </div>

                        <div className="form__inputs-wrapper">
                            <div className="font__row-container">
                                <Input
                                    label={t("pages.myAccount.verifyEmailPopup.verificationCode")}
                                    name="code"
                                    inputProps={{
                                        value: valuesVerification.code,
                                        placeholder: t("pages.myAccount.verifyEmailPopup.verificationCodePLaceholder"),
                                        onChange: onFieldChangeVerification,
                                        onBlur: onBlurVerification
                                    }}
                                    errorMessage={t(errorsVerification.code)}
                                    disabled={isFetching}
                                />
                            </div>

                            <div className="form__description-wrapper">
                                <p className={resendInSecondsTimer > 0 ? "form__text" : "form__link text-pointer"} onClick={resendInSecondsTimer === 0 ? changeSubmit : undefined}>
                                    {t("pages.myAccount.verifyEmailPopup.resendIn")} 00:{resendInSecondsTimer >= 10 ? resendInSecondsTimer : '0' + resendInSecondsTimer}
                                </p>
                            </div>

                            <div className="form__buttons-container">
                                <Button
                                    fullWidth
                                    onClick={checkVerificationCodeSubmit}
                                    disabled={isFetching}
                                >
                                    <CheckMarkIcon width="16px" height="16px" />
                                    {t("pages.myAccount.verifyEmailPopup.submit")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>}

            <Popup visible={visible && !openVerifyCode && !openSuccess} onClose={onClose}>
                <div className="form-container">
                    <div className="form">
                        <h2 className="form__heading">
                            {t("pages.myAccount.changeEmailPopup.title")}
                        </h2>

                        <div className="form__description-wrapper">
                            <p className="form__text">
                                {t("pages.myAccount.changeEmailPopup.subtitle")}
                            </p>
                        </div>

                        <div className="form__inputs-wrapper">
                            <div className="font__row-container">
                                <Input
                                    label={t("pages.myAccount.changeEmailPopup.email")}
                                    name="email"
                                    inputProps={{
                                        value: values.email,
                                        placeholder: t("pages.myAccount.changeEmailPopup.emailPLaceholder"),
                                        onChange: onFieldChange,
                                        onBlur: onBlur
                                    }}
                                    errorMessage={t(errors.email)}
                                    disabled={isFetching}
                                />
                            </div>

                            <div className="form__buttons-container">
                                <Button
                                    fullWidth
                                    onClick={changeSubmit}
                                    disabled={isFetching}
                                >
                                    {t("pages.myAccount.changeEmailPopup.continue")}
                                    <ArrowRight
                                        fill="#ffffff"
                                        className="pagination__right-arrow"
                                        width="16px"
                                        height="16px"
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    );
};

export default ChangeEmailPopup;