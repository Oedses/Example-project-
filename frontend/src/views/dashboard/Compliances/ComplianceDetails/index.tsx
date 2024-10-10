import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import classNames from "classnames";
import { formatDate, getActionNameValue, getUrlComplianceLog, isSuperUser } from "../../../../utils/fn";
import UserContext from "../../../../store/contexts/user-context";
import { ComplianceLogItem, ComplianceStatus, Roles } from "../../../../../../shared/types/common";
import ComplianceActions from "../ComplianceActions";
import './compliance-details.scss';
import { getRequestedName } from "../compliances.constants";
import { useSnackbar } from "../../../components/Hooks/useSnackbar";
import Snackbar from "../../../components/UI/Snackbar";


type ComplianceDetailsProps = {
  complianceDetails: ComplianceLogItem;
  onClose: () => void;
  callback: () => void;
};

const ComplianceDetails = ({ complianceDetails, onClose, callback }: ComplianceDetailsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    data: { role },
  } = UserContext.useContext();
  const { isActive, message, openSnackBar } = useSnackbar();

  const isArrayPayment = complianceDetails.action.investors && complianceDetails.action.investors?.length > 0 || false;
  const requestedByLink = complianceDetails.requestedBy?.role !== Roles.admin
    ? `/${complianceDetails.requestedBy?.role}/${complianceDetails.requestedBy?.id}`
    : undefined;
  const requestedToLink = getUrlComplianceLog(complianceDetails);
  const transactionHash = isSuperUser(role) ? complianceDetails.transactionHash : '';

  let actionNameValue = t(`components.table.complianceLog.action.${getActionNameValue(complianceDetails.action)}`);

  if (isArrayPayment) {
    actionNameValue += ' ' + t(`components.table.complianceLog.toAllInvestors`);
  }

  const copyText = (text: string, messageText: string) => {
    navigator.clipboard.writeText(text);
    openSnackBar(messageText);
  };

  return (
    <section className='compliance-details__container'>
      <div className="compliance-details__wrapper">
        <div className="form">
          <h2 className="form__heading compliance-details__heading">
            {t("pages.complianceLog.details.title")}
          </h2>

          <ul className="list list-vertical">
            <li className="list-item">
              <p className="list-item__title">{t('pages.complianceLog.table.head.status')}</p>
              <div className="table__status-wrapper">
                <div
                  className={classNames(
                    "table__status",
                    `table__status_${complianceDetails.status?.toLowerCase()}`,
                  )}
                ></div>

                <p className="list-item__content">{t(`components.table.complianceLog.status.${complianceDetails.status.toLowerCase()}`)}</p>
              </div>
            </li>

            <li className="list-item">
              <p className="list-item__title">{t('pages.complianceLog.table.head.date')}</p>
              <p className="list-item__content">{formatDate(new Date(complianceDetails.date).toISOString())}</p>
            </li>

            {complianceDetails.requestedBy && (
              <li className="list-item">
                <p className="list-item__title">{t('pages.complianceLog.table.head.relatedBy')}</p>
                <p className="list-item__content">
                  <span className="table__link" onClick={() => requestedByLink && navigate(requestedByLink)}
                  >
                    {getRequestedName(complianceDetails.requestedBy)}
                  </span>
                  <span className="form__entity-bg">{complianceDetails.requestedBy?.role}</span>
                </p>
              </li>
            )}

            <li className="list-item">
              <p className="list-item__title">{t('pages.complianceLog.table.head.action')}</p>
              <p className="list-item__content">{actionNameValue}</p>
            </li>

            {complianceDetails.action.entityName && (
              <li className="list-item">
                <p className="list-item__title">{t('pages.complianceLog.table.head.relatedTo')}</p>
                <p className="list-item__content table__link" onClick={() => requestedToLink && navigate(requestedToLink)}>
                  {complianceDetails.action.entityName}
                </p>
              </li>
            )}

            {transactionHash && (
              <li className="list-item">
                <p className="list-item__title">{t('pages.complianceLog.details.transactionHash')}</p>
                <p className="list-item__content table__link" onClick={() => copyText(transactionHash, t(`pages.complianceLog.details.copyTransactionHash`))}>
                  {transactionHash}
                </p>
              </li>
            )}
          </ul>

          {role === Roles.compliance && complianceDetails.status === ComplianceStatus.Initiated && <ComplianceActions
            complianceId={complianceDetails.id!}
            onClose={onClose}
            callback={callback}
            openSnackBar={openSnackBar}
          />}
        </div>
      </div>
      <Snackbar message={message} isActive={isActive} />
    </section>
  );
};

export default ComplianceDetails;