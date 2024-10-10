import { ChangeEvent, FocusEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessageName } from "../../../../utils/fn";
import { Button, Input, Popup } from "../../../components/UI";
import { CheckMarkIcon } from "../../../components/icons";
import SummaryContext from "../../../../store/contexts/summary-context";
import { ChangePhoneRequest } from "../../../../../../shared/types/user";
import UserService from "../../../../services/UserService";
import { defaultErrors, defaultValues, maxPhoneLength, VerifyPhoneFields } from "./ChangePhonePopup.constants";
import { ValidationChangePhone } from './validation';

type changePhonePopupProps = {
    visible: boolean;
    callback: () => void;
    onClose: () => void;
    openSnackBar: (msg: string) => void;
};

const ChangePhonePopup = ({ visible, callback, onClose, openSnackBar }: changePhonePopupProps) => {
    const { t } = useTranslation();
    const [isFetching, setIsFetching] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);

    const { setData: setSummaryData } = SummaryContext.useContext();

    const [values, setValues] = useState<ChangePhoneRequest>(defaultValues);
    const [errors, setErrors] = useState<VerifyPhoneFields>(defaultErrors);

    const onFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputName = event.target.name as keyof ChangePhoneRequest;
        let { value } = event.target;

        if (inputName === 'phone' && value?.length > maxPhoneLength) return;

        ValidationChangePhone.resetFieldError(
            inputName as keyof ChangePhoneRequest
        );

        setErrors(ValidationChangePhone.Errors);

        if (inputName === 'phone') {
            if (value && !value.includes('+')) {
                setValues({ ...values, [inputName]: `+${value}` });
            }

            if (value && value.includes('+')) {
                setValues({ ...values, [inputName]: value });
            }

            if (value === '+') {
                setValues({ ...values, [inputName]: '' });
            }
        } else {
            setValues({ ...values, [inputName]: value });
        }
    };

    const onBlur = (event: FocusEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        ValidationChangePhone.validateField(name as keyof ChangePhoneRequest, value);

        setErrors(ValidationChangePhone.Errors);
    };


    const onCloseSuccessPopup = () => {
        callback();
        onClose();
    };

    const changeSubmit = () => {
        const { errors: validatedErrors, formIsValid: isValid } = ValidationChangePhone.validate(values);

        setErrors(validatedErrors);

        if (!isValid) return;

        setIsFetching(true);

        UserService.сhangePhone(values)
            .then(() => {
                setOpenSuccess(true);

                setSummaryData({
                    isShown: true,
                    isSuccess: true,
                    title: 'pages.myAccount.changePhonePopup.success.title',
                    subtitle: 'pages.myAccount.changePhonePopup.success.subtitle',
                    onCloseCallback: onCloseSuccessPopup
                });
            })
            .catch(err => {
                const errorMessageText = err.response.data.message;
                const errorMessageName = getErrorMessageName(err.response.data.stack);
                const errorMsg = errorMessageName !== 'validate' ? t(`error.backend.${errorMessageName}`) : errorMessageText;

                openSnackBar(errorMsg);
            })
            .finally(() => setIsFetching(false));
    };


    return (
        <>
            <Popup visible={visible && !openSuccess} onClose={onClose}>
                <div className="form-container">
                    <div className="form">
                        <h2 className="form__heading">
                            {t("pages.myAccount.changePhonePopup.title")}
                        </h2>

                        <div className="form__description-wrapper">
                            <p className="form__text">
                                {t("pages.myAccount.changePhonePopup.subtitle")}
                            </p>
                        </div>

                        <div className="form__inputs-wrapper">
                            <div className="font__row-container">
                                <Input
                                    label={t("pages.myAccount.changePhonePopup.phone")}
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

                            <div className="form__buttons-container">
                                <Button
                                    fullWidth
                                    onClick={changeSubmit}
                                    disabled={isFetching}
                                >
                                    <CheckMarkIcon width="16px" height="16px" />
                                    {t("pages.myAccount.changePhonePopup.save")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    );
};

export default ChangePhonePopup;