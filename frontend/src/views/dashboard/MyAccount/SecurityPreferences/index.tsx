import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Roles } from "../../../../../../shared/types/common";
import { Investor } from "../../../../../../shared/types/investor";
import { User } from "../../../../../../shared/types/user";
import { useSnackbar } from "../../../components/Hooks/useSnackbar";
import { Button } from "../../../components/UI";
import { ButtonView } from "../../../components/UI/Button/button.props";
import { Heading } from "../../../components/UI/Heading";
import Snackbar from "../../../components/UI/Snackbar";
import ChangeEmailPopup from "../ChangeEmailPopup";
import ChangePhonePopup from "../ChangePhonePopup";
import ChangePasswordPopup from "./../ChangePasswordPopup";

type SecurityPreferencesProps = {
    userData: User;
    callback: () => void;
};

const SecurityPreferences = ({ userData, callback }: SecurityPreferencesProps) => {
    const { t } = useTranslation();
    const { isActive, message, openSnackBar } = useSnackbar();
    
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openChangeEmail, setOpenChangeEmail] = useState(false);
    const [openChangePhone, setOpenChangePhone] = useState(false);

    const isViewPhone = [Roles.investor, Roles.issuer].includes(userData.role!);
    const phone = isViewPhone ? (userData as Investor).phone : '';

    return (
        <>
            {openChangePassword && <ChangePasswordPopup visible={openChangePassword} onClose={() => setOpenChangePassword(false)} callback={callback} openSnackBar={openSnackBar} email={userData.email} />}
            {openChangeEmail && <ChangeEmailPopup visible={openChangeEmail} onClose={() => setOpenChangeEmail(false)} callback={callback} openSnackBar={openSnackBar} />}
            {openChangePhone && <ChangePhonePopup visible={openChangePhone} onClose={() => setOpenChangePhone(false)} callback={callback} openSnackBar={openSnackBar} />}

            <div className="section my-account__section">
                <Heading view="secondary" active>
                    {t('pages.myAccount.securityPreferences.title')}
                </Heading>

                <p className="form__text form__text-start">
                    {t("pages.myAccount.securityPreferences.text")}
                </p>

                <ul className="list list-vertical my-account__max-width">
                    <div className="form__row-container">
                        <div>
                            <p className="list-item__title">{t('pages.myAccount.securityPreferences.email')}</p>
                            <p className="list-item__content">{userData.email}</p>
                        </div>

                        {isViewPhone && phone && (<div>
                            <p className="list-item__title">{t('pages.myAccount.securityPreferences.phoneNumber')}</p>
                            <p className="list-item__content">{phone}</p>
                        </div>)}
                    </div>
                </ul>

                <div className="my-account__actions-row">
                    <Button
                        view={ButtonView.unfilled}
                        onClick={() => setOpenChangePassword(true)}
                    >
                        {t('pages.myAccount.securityPreferences.changePassword')}
                    </Button>

                    <Button
                        view={ButtonView.unfilled}
                        onClick={() => setOpenChangeEmail(true)}
                    >
                        {t('pages.myAccount.securityPreferences.changeEmail')}
                    </Button>

                    {isViewPhone && <Button
                        view={ButtonView.unfilled}
                        onClick={() => setOpenChangePhone(true)}
                    >
                        {t('pages.myAccount.securityPreferences.changePhone')}
                    </Button>}
                </div>
            </div>

            <Snackbar message={message} isActive={isActive} />
        </>
    );
};

export default SecurityPreferences;