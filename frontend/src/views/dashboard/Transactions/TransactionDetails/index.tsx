import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import NumberFormat from "react-number-format";
import classNames from "classnames";
import { formatDate, getTransactionTotalPrice, getTransactionType, isSuperUser } from "../../../../utils/fn";
import UserContext from "../../../../store/contexts/user-context";
import { CreateTransactonResponse, Transaction } from "../../../../../../shared/types/transaction";
import { isNaturalPerson, LegalEntityInvestor } from "../../../../../../shared/types/investor";
import { getColorForColoredString, TextColors } from "../../../components/UI/Table/table.constants";
import Snackbar from "../../../components/UI/Snackbar";
import { useSnackbar } from "../../../components/Hooks/useSnackbar";
import { DetailType } from "../transactions.constants";

import './transaction-details.scss';

type TransactionDetailsProps = {
  transactionDetails: CreateTransactonResponse | Transaction;
  isPageTransactions?: boolean;
  detailType?: DetailType;
};

const TransactionDetails = ({ transactionDetails, isPageTransactions = true, detailType = DetailType.NONE }: TransactionDetailsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data: { role },
  } = UserContext.useContext();
  const { isActive, message, openSnackBar } = useSnackbar();

  const investorColumnValue = isNaturalPerson(transactionDetails.investor) ?
    `${transactionDetails.investor.firstName} ${transactionDetails.investor.lastName}` :
    (transactionDetails.investor as LegalEntityInvestor)?.companyName;
  const investorLink = isSuperUser(role) ? `/investor/${transactionDetails.investor.id}` : '';

  const transactionType = getTransactionType(transactionDetails);
  const colorValue: TextColors = getColorForColoredString(transactionType) || TextColors.gray;
  const transactionHash = isSuperUser(role) ? (transactionDetails as Transaction).transactionHash : '';

  const availableInvestor =  (isSuperUser(role) && isPageTransactions) || (!isPageTransactions && detailType !== DetailType.INVESTOR && detailType !== DetailType.NONE);
  const availableProduct = isPageTransactions || (!isPageTransactions && detailType !== DetailType.PRODUCT && detailType !== DetailType.NONE);

  const copyText = (text: string, messageText: string) => {
    navigator.clipboard.writeText(text);
    openSnackBar(messageText);
  };

  return (
    <section className='transaction-details__container'>
      <div className="transaction-details__wrapper">
        <div className="form">
          <h2 className="form__heading transaction-details__heading">
            {t("pages.transactions.details.title")}
          </h2>

          <ul className="list list-vertical">
            {transactionDetails.status && (
              <li className="list-item">
                <p className="list-item__title">{t('pages.transactions.table.head.status')}</p>
                <div className="table__status-wrapper">
                  <div
                    className={classNames(
                      "table__status",
                      `table__status_${transactionDetails.status.toLowerCase()}`,
                    )}
                  ></div>

                  <p className="list-item__content">{t(`components.table.status.${transactionDetails.status.toLowerCase()}`)}</p>
                </div>
              </li>
            )}

            <li className="list-item">
              <p className="list-item__title">{t('pages.transactions.table.head.date')}</p>
              <p className="list-item__content">{transactionDetails.createdAt ? formatDate(transactionDetails.createdAt) : 'N/A'}</p>
            </li>

            <li className="list-item">
              <p className="list-item__title">{t('pages.transactions.table.head.type')}</p>
              <p
                className={classNames(
                  'list-item__content',
                  "table__colored-string",
                  `table__colored-string-${colorValue}`
                )}
              >
                {t(`components.table.transactions.type.${transactionType.toLowerCase()}`)}
              </p>
            </li>

            {availableInvestor && investorColumnValue && (<li className="list-item">
              <p className="list-item__title">{t('pages.transactions.table.head.investor')}</p>
              <p className={classNames('list-item__content', { 'table__link': investorLink })} onClick={() => investorLink && navigate(investorLink)}>
                {investorColumnValue}
              </p>
            </li>)}

            {availableProduct && transactionDetails.product.name && (<li className="list-item">
              <p className="list-item__title">{t('pages.transactions.table.head.product')}</p>
              <p className="list-item__content table__link" onClick={() => navigate(`/products/${transactionDetails.product.id}`)}>
                {transactionDetails.product.name}
              </p>
            </li>)}

            <li className="list-item">
              <p className="list-item__title">{t('pages.transactions.table.head.amount')}</p>
              <p className="list-item__content">
                <NumberFormat
                  value={getTransactionTotalPrice(transactionDetails) || 0}
                  style={{ color: "#000000" }}
                  displayType={"text"}
                  decimalScale={2}
                  fixedDecimalScale
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix={"€\u00a0"}
                />
              </p>
            </li>

            {transactionHash && (
              <li className="list-item">
                <p className="list-item__title">{t('pages.transactions.details.transactionHash')}</p>
                <p className="list-item__content table__link" onClick={() => copyText(transactionHash!, t(`pages.transactions.details.copyTransactionHash`))}>
                  {transactionHash}
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
      <Snackbar message={message} isActive={isActive} />
    </section>
  );
};

export default TransactionDetails;