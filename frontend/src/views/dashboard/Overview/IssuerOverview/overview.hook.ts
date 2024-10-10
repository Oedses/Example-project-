import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import IssuerService from "../../../../services/IssuerService";
import UserService from "../../../../services/UserService";

import UserContext from "../../../../store/contexts/user-context";
import SummaryContext from "../../../../store/contexts/summary-context";

import { IssuerOverview } from "../../../../../../shared/types/issuer";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row } from "../../../components/UI/Table";
import { HorizontalStackedBarData } from "../../../components/UI/HorizontalStackedBar";

import {
  createProductRows,
  createTransactionRows,
  transactionsTHeader,
  productsTHeader
} from "./overview.constants";

import { getErrorMessageName, translate } from "../../../../utils/fn";
import { Transaction } from "../../../../../../shared/types/transaction";

export const useOverview = () => {
  const { data: { name, id } } = UserContext.useContext();
  const { setData: setSummaryData } = SummaryContext.useContext();

  const [issuedAmount, setIssuedAmount] = useState(0);
  const [interestQuater, setInterestQarter] = useState(0);
  const [outstandingCapital, setOutstandingCapital] = useState(0);

  const [products, setProducts] = useState<Row[]>([]);
  const [transactions, setTransactions] = useState<Row[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [transactionDetails, setTransactionDetails] = useState<Transaction | null>(null);

  const [stackedBarData, setStackedBarData] = useState<HorizontalStackedBarData[]>([]);
  const [isStackedBarDataShow, setIsStackedBarDataShow] = useState(false);

  const [isOverviewfetching, setIsOverviewFetching] = useState(true);
  const [isProductsFetching, setIsProductsFetching] = useState(true);
  const [isTransactionsFetching, setIsTransactionsFetching] = useState(true);
  const [showDeactivateFail, setShowDeactivateFail] = useState(false);

  const productsRef = useRef<HTMLDivElement>(null);
  const transactionsRef = useRef<HTMLDivElement>(null);

  const productsTableHeader = translate(productsTHeader);
  const transactionsTableHeader = translate(transactionsTHeader);

  const { t, i18n } = useTranslation();

  const { width } = useWindowSize();

  const navigate = useNavigate();

  const onViewClick = (to: string) => navigate(`/issuer/${to}`);

  const onFailClose = () => setShowDeactivateFail(false);

  const platformSummaryList: ListItemProps[] = [
    {
      title: t('pages.issuer.overview.platformOverview.summary.outstandingAmount'),
      content: (outstandingCapital || 0).toString(),
      isAmount: true,
    },
    {
      title: t('pages.issuer.overview.platformOverview.summary.issuedAmount'),
      content: (issuedAmount || 0).toString(),
      isAmount: true,
    },
    {
      title: t('pages.issuer.overview.platformOverview.summary.interest'),
      content: (interestQuater || 0).toString(),
      isAmount: true,
    },
  ];

  const onRequestDeactivate = () => {
    UserService.requestDeactivate()
      .then(() => {
        setSummaryData({
          isShown: true,
          isSuccess: true,
          title: 'pages.investors.view.deactivateSuccess.title',
          subtitle: 'pages.investors.view.deactivateSuccess.subtitle'
        });
      })
      .catch(err => {
        console.log(err);
        setShowDeactivateFail(true);

        const errorMessageName = getErrorMessageName(err.response.data.stack);
        const errorMsg = `error.backend.${errorMessageName}`;

        setSummaryData({
          isShown: true,
          isSuccess: false,
          title: 'pages.investors.view.deactivateError.title',
          subtitle: errorMsg,
          onCloseCallback: onFailClose
        });
      });
  };

  const onOpenTransactionDetails = (transactionId: string) => {
    const transaction = transactionsList.find(item => item.id === transactionId);
    
    if (transaction) setTransactionDetails(transaction);
  };

  const onCloseTransactionDetails = () => {
    setTransactionDetails(null);
  };

  useEffect(() => {
    if (id) {
      IssuerService.getOverview()
        .then((res) => {
          const { data } = res;

          const {
            totalIssuedAmount,
            totalInterestQarter,
            repaidAmount: totalRepaid,
            products: productsList,
            transactions: transactionsData
          } = data as IssuerOverview;

          setIssuedAmount(totalIssuedAmount);
          setInterestQarter(totalInterestQarter);

          setOutstandingCapital(totalIssuedAmount - totalRepaid);

          setStackedBarData([
            {
              data: {
                label: t('pages.issuer.overview.platformOverview.bar.repaid'),
                amount: totalRepaid.toString()
              }
            },
            {
              data: {
                label: t('pages.issuer.overview.platformOverview.bar.outstandingAmount'),
                amount: (totalIssuedAmount - totalRepaid).toString()
              }
            }
          ]);

          setIsStackedBarDataShow(totalRepaid > 0 && totalIssuedAmount - totalRepaid > 0);

          setProducts(createProductRows(productsList));
          setTransactionsList(transactionsData);
        })
        .catch(error => console.log(error))
        .finally(() => {
          setIsOverviewFetching(false);
          setIsProductsFetching(false);
          setIsTransactionsFetching(false);
        });
    }
  }, [id, i18n.language]);

  useEffect(() => {
    setTransactions(createTransactionRows(transactionsList, onOpenTransactionDetails));
  }, [transactionsList]);

  return {
    t,
    i18n,
    name,
    width,
    platformSummaryList,
    productsTableHeader,
    products,
    onViewClick,
    isProductsFetching,
    transactionsTableHeader,
    transactions,
    isTransactionsFetching,
    productsRef,
    transactionsRef,
    stackedBarData,
    isStackedBarDataShow,
    isOverviewfetching,
    showDeactivateFail,
    onRequestDeactivate,
    transactionDetails,
    onCloseTransactionDetails
  };
};
