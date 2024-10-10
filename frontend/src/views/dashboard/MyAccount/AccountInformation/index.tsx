import { Fragment } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { Heading } from "../../../components/UI/Heading";
import { Admin } from "../../../../../../shared/types/admin";
import { Roles } from "../../../../../../shared/types/common";
import { Investor, isNaturalPerson } from "../../../../../../shared/types/investor";
import { Issuer } from "../../../../../../shared/types/issuer";
import { User } from "../../../../../../shared/types/user";

type AccountInformationProps = {
    userData: User;
};

type UserDataProps<T> = {
    userData: T;
    t: TFunction;
};

const InvestorInformation = ({ userData, t }: UserDataProps<Investor>) => (
    <Fragment>
        <li className="list-item">
            <p className="list-item__title">{t('pages.myAccount.accountInformation.accountType')}</p>
            <p className="list-item__content">{userData.type}</p>
        </li>

        {isNaturalPerson(userData)
            ? (
                <Fragment>
                    <li className="list-item">
                        <div className="form__row-container">
                            <div>
                                <p className="list-item__title">{t('pages.myAccount.accountInformation.firstName')}</p>
                                <p className="list-item__content">{userData.firstName}</p>
                            </div>
                            <div>
                                <p className="list-item__title">{t('pages.myAccount.accountInformation.lastName')}</p>
                                <p className="list-item__content">{userData.lastName}</p>
                            </div>
                        </div>
                    </li>

                    <li className="list-item">
                        <p className="list-item__title">{t('pages.myAccount.accountInformation.bsn')}</p>
                        <p className="list-item__content">{userData.bsn}</p>
                    </li>
                </Fragment>
            )
            : (
                <Fragment>
                    <li className="list-item">
                        <div className="form__row-container">
                            <div>
                                <p className="list-item__title">{t('pages.myAccount.accountInformation.companyName')}</p>
                                <p className="list-item__content">{userData.companyName}</p>
                            </div>
                            <div>
                                <p className="list-item__title">{t('pages.myAccount.accountInformation.kvk')}</p>
                                <p className="list-item__content">{userData.kvk}</p>
                            </div>
                        </div>
                    </li>
                </Fragment>
            )}

        <li className="list-item">
            <p className="list-item__title">{t('pages.myAccount.accountInformation.streetAddress')}</p>
            <p className="list-item__content">{userData.address}</p>
        </li>

        <li className="list-item">
            <div className="form__row-container">
                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.postalCode')}</p>
                    <p className="list-item__content">{userData.postcode}</p>
                </div>
                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.city')}</p>
                    <p className="list-item__content">{userData.city}</p>
                </div>
            </div>
        </li>
    </Fragment>
);

const IssuerInformation = ({ userData, t }: UserDataProps<Issuer>) => (
    <Fragment>
        <li className="list-item">
            <p className="list-item__title">{t('pages.myAccount.accountInformation.issuerName')}</p>
            <p className="list-item__content">{userData.name}</p>
        </li>

        <li className="list-item">
            <div className="form__row-container">
                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.kvk')}</p>
                    <p className="list-item__content">{userData.kvk}</p>
                </div>

                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.vat')}</p>
                    <p className="list-item__content">{userData.vat}</p>
                </div>
            </div>
        </li>

        <li className="list-item">
            <p className="list-item__title">{t('pages.myAccount.accountInformation.streetAddress')}</p>
            <p className="list-item__content">{userData.address}</p>
        </li>

        <li className="list-item">
            <div className="form__row-container">
                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.postalCode')}</p>
                    <p className="list-item__content">{userData.postcode}</p>
                </div>
                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.city')}</p>
                    <p className="list-item__content">{userData.city}</p>
                </div>
            </div>
        </li>
    </Fragment>
);

const AdminInformation = ({ userData, t }: UserDataProps<Admin>) => (
    <Fragment>
        <li className="list-item">
            <div className="form__row-container">
                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.firstName')}</p>
                    <p className="list-item__content">{userData.firstName}</p>
                </div>
                <div>
                    <p className="list-item__title">{t('pages.myAccount.accountInformation.lastName')}</p>
                    <p className="list-item__content">{userData.lastName}</p>
                </div>
            </div>
        </li>
    </Fragment>
);


const UserRoleInformation = ({ userData, t }: UserDataProps<User>) => {
    switch (userData.role) {
        case Roles.investor:
            return <InvestorInformation t={t} userData={userData as Investor} />;
        case Roles.issuer:
            return <IssuerInformation t={t} userData={userData as Issuer} />;
        case Roles.admin:
        case Roles.compliance:
            return <AdminInformation t={t} userData={userData as Admin} />;
        default:
            return <Fragment />;
    }
};

const AccountInformation = ({ userData }: AccountInformationProps) => {
    const { t } = useTranslation();

    return (
        <div className="section my-account__section">
            <Heading view="secondary" active>
                {t('pages.myAccount.accountInformation.title')}
            </Heading>

            <p className="form__text form__text-start">
                {t("pages.myAccount.accountInformation.accountDetailsChanged")}
            </p>

            <ul className="list list-vertical my-account__max-width">
                <UserRoleInformation userData={userData} t={t} />
            </ul>
        </div>
    );
};

export default AccountInformation;