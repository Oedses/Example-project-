import { ChangeEvent, FocusEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChangePasswordRequest } from "../../../../../../shared/types/user";
import { Button, Input, Popup } from "../../../components/UI";
import { ArrowRight, CheckMarkIcon } from "../../../components/icons";
import UserService from "../../../../services/UserService";

import { ChangePasswordFields, defaultErrors, defaultErrorsVerifyPassword, defaultValues, defaultValuesVerifyPassword, VerifyPasswordFields } from "./ChangePasswordPopup.constants";

import { ValidationChangePassword, ValidationVerifyPassword } from './validation';
import { getErrorMessageName } from "../../../../utils/fn";
import { CheckVerificationCodeRequest } from "../../../../../../shared/types/verification-code";
import regex from "../../../../../../shared/regex";
import SummaryContext from "../../../../store/contexts/summary-context";

type ChangePasswordPopupProps = {
    email: string;
    visible: boolean;
    callback: () => void;
    onClose: () => void;
    openSnackBar: (msg: string) => void;
};

const ChangePasswordPopup = ({ visible, email, callback, onClose, openSnackBar }: ChangePasswordPopupProps) => {
    const { t } = useTranslation();
    const [isFetching, setIsFetching] = useState(false);
    const [openVerifyPassword, setOpenVerifyPassword] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [resendInSecondsTimer, setResendInSecondsTimer] = useState(5);

    const { setData: setSummaryData } = SummaryContext.useContext();

    const [values, setValues] = useState<ChangePasswordRequest>(defaultValues);
    const [valuesVerification, setValuesVerification] = useState<CheckVerificationCodeRequest>(defaultValuesVerifyPassword);
    const [errors, setErrors] = useState<ChangePasswordFields>(defaultErrors);
    const [errorsVerification, setErrorsVerification] = useState<VerifyPasswordFields>(defaultErrorsVerifyPassword);

    const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputName = event.target.name as keyof ChangePasswordFields;
        let { value } = event.target;

        ValidationChangePassword.resetFieldError(
            inputName as keyof ChangePasswordFields
        );

        setErrors(ValidationChangePassword.Errors);
        setValues({ ...values, [inputName]: value });
    };

    const onBlur = (event: FocusEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        ValidationChangePassword.validateField(name as keyof ChangePasswordRequest, value, values.newPassword);

        setErrors(ValidationChangePassword.Errors);
    };

    const onFieldChangeVerification = (event: ChangeEvent<HTMLInputElement>) => {
        const inputName = event.target.name as keyof VerifyPasswordFields;
        let { value } = event.target;

        if (value?.length && !regex.numbersOnly.test(value)) return;
        if (value?.length > 4) return;

        ValidationVerifyPassword.resetFieldError(
            inputName as keyof VerifyPasswordFields
        );

        setErrorsVerification(ValidationVerifyPassword.Errors);
        setValuesVerification({ ...valuesVerification, [inputName]: value });
    };

    const onBlurVerification = (event: FocusEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        ValidationVerifyPassword.validateField(name as keyof VerifyPasswordFields, value);

        setErrorsVerification(ValidationVerifyPassword.Errors);
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
            
            if (newSecond >= 0) setResendInSecondsTimer(newSecond);
        };

        const timeInterval = setInterval(updateTimer, 1000);
    };

    const changePasswordSubmit = () => {
        const { errors: validatedErrors, formIsValid: isValid } =
            ValidationChangePassword.validate(values);
        const timer = 5;

        setErrors(validatedErrors);

        if (!isValid) return;

        setResendInSecondsTimer(timer);
        setIsFetching(true);

        UserService.changePassword(values)
            .then(() => {
                setOpenVerifyPassword(true);
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
            ValidationVerifyPassword.validate(valuesVerification);

        setErrorsVerification(validatedErrors);

        if (!isValid) return;

        setIsFetching(true);

        UserService.checkVerificationCode(valuesVerification)
            .then(() => {
                setOpenVerifyPassword(false);
                setOpenSuccess(true);

                setSummaryData({
                    isShown: true,
                    isSuccess: true,
                    title: 'pages.myAccount.verifyPasswordPopup.success.title',
                    subtitle: 'pages.myAccount.verifyPasswordPopup.success.subtitle',
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
            {openVerifyPassword && <Popup visible={openVerifyPassword} onClose={() => setOpenVerifyPassword(false)}>
                <div className="form-container">
                    <div className="form">
                        <h2 className="form__heading">
                            {t("pages.myAccount.verifyPasswordPopup.title")}
                        </h2>

                        <div className="form__description-wrapper">
                            <p className="form__text">
                                {t("pages.myAccount.verifyPasswordPopup.subtitle", { email })}
                            </p>
                        </div>

                        <div className="form__inputs-wrapper">
                            <div className="font__row-container">
                                <Input
                                    label={t("pages.myAccount.verifyPasswordPopup.verificationCode")}
                                    name="code"
                                    inputProps={{
                                        value: valuesVerification.code,
                                        placeholder: t("pages.myAccount.verifyPasswordPopup.verificationCodePLaceholder"),
                                        onChange: onFieldChangeVerification,
                                        onBlur: onBlurVerification
                                    }}
                                    errorMessage={t(errorsVerification.code)}
                                    disabled={isFetching}
                                />
                            </div>

                            <div className="form__description-wrapper">
                                <p className={resendInSecondsTimer > 0 ? "form__text" : "form__link text-pointer"} onClick={resendInSecondsTimer === 0 ? changePasswordSubmit : undefined}>
                                    {t("pages.myAccount.verifyPasswordPopup.resendIn")} 00:{resendInSecondsTimer >= 10 ? resendInSecondsTimer : '0' + resendInSecondsTimer}
                                </p>
                            </div>

                            <div className="form__buttons-container">
                                <Button
                                    fullWidth
                                    onClick={checkVerificationCodeSubmit}
                                    disabled={isFetching}
                                >
                                    <CheckMarkIcon width="16px" height="16px" />
                                    {t("pages.myAccount.verifyPasswordPopup.submit")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>}

            <Popup visible={visible && !openVerifyPassword && !openSuccess} onClose={onClose}>
                <div className="form-container">
                    <div className="form">
                        <h2 className="form__heading">
                            {t("pages.myAccount.changePasswordPopup.title")}
                        </h2>

                        <div className="form__description-wrapper">
                            <p className="form__text">
                                {t("pages.myAccount.changePasswordPopup.subtitle")}
                            </p>
                        </div>

                        <div className="form__inputs-wrapper">
                            <div className="font__row-container">
                                <Input
                                    type={'password'}
                                    label={t("pages.myAccount.changePasswordPopup.newPassword")}
                                    name="newPassword"
                                    inputProps={{
                                        value: values.newPassword,
                                        placeholder: t("pages.myAccount.changePasswordPopup.newPasswordPLaceholder"),
                                        onChange: onFieldChange,
                                        onBlur: onBlur
                                    }}
                                    errorMessage={t(errors.newPassword)}
                                    disabled={isFetching}
                                />
                            </div>

                            <div className="font__row-container">
                                <Input
                                    type={'password'}
                                    label={t("pages.myAccount.changePasswordPopup.repeatNewPassword")}
                                    name="repeatNewPassword"
                                    inputProps={{
                                        value: values.repeatNewPassword,
                                        placeholder: t("pages.myAccount.changePasswordPopup.repeatNewPasswordPLaceholder"),
                                        onChange: onFieldChange,
                                        onBlur: onBlur
                                    }}
                                    errorMessage={t(errors.repeatNewPassword)}
                                    disabled={isFetching}
                                />
                            </div>

                            <div className="form__buttons-container">
                                <Button
                                    fullWidth
                                    onClick={changePasswordSubmit}
                                    disabled={isFetching}
                                >
                                    {t("pages.myAccount.changePasswordPopup.continue")}
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

export default ChangePasswordPopup;