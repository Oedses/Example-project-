import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AccountStatus } from "../../../../../../shared/types/common";

import { Holding } from "../../../../../../shared/types/holding";
import { Investor, isLegalEntity, isNaturalPerson } from "../../../../../../shared/types/investor";

import InvestorService from "../../../../services/InvestorService";
import UserService from "../../../../services/UserService";
import SummaryContext from "../../../../store/contexts/summary-context";
import UserContext from "../../../../store/contexts/user-context";
import { getErrorMessageName, getProductTotalAmount, translate } from "../../../../utils";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { BreadcrumpItem } from "../../../components/UI/Breadcrumps";
import { DateUtils } from "../../../components/UI/DatePicker/datepicker.utils";
import { HorizontalStackedBarData } from "../../../components/UI/HorizontalStackedBar";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row } from "../../../components/UI/Table";
import { SortingDirection } from "../../../components/UI/Table/Table.utils";

import {
  colors,
  createInvestorDetails,
  createInvestorHoldingsRows,
  createInvestorSummary,
  holdingsTableHeader
} from "./investor-view.constants";

type InvestorViewParams = 'id';

const useInvestorView = () => {
  const [name, setName] = useState('');

  const [isFetching, setIsFetching] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeactivateFail, setShowDeactivateFail] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);

  const [details, setDetails] = useState<ListItemProps[]>([]);
  const [summary, setSummary] = useState<ListItemProps[]>([]);

  const [holdings, setHoldings] = useState<Holding[]>([]);

  const [holdingsChartData, setHoldingsChartData] = useState<HorizontalStackedBarData[]>([]);

  const [holdingsRows, setHoldingsRows] = useState<Row[]>([]);

  const [investorData, setInvestorData] = useState<Partial<Investor>>({});

  const { setData: setSummaryData } = SummaryContext.useContext();
  const { data: { role } } = UserContext.useContext();

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { width } = useWindowSize();

  const { id } = useParams<InvestorViewParams>();

  const breadcrumps: BreadcrumpItem[] = [
    {
      label: t('menu.breadcrumps.investors'),
      path: 'investors'
    },
    { label: (name as string) }
  ];

  const holdingsTHeader = useMemo(() => translate(holdingsTableHeader), [i18n.language]);

  const onToggleEditForm = () => setShowEditForm(show => !show);

  const onToggleConfirmDeleteUser = () => setShowDeleteUserConfirm(show => !show);

  const onFailClose = () => setShowDeactivateFail(false);

  const onRequestDeactivate = () => {
    UserService.deactivate(id!)
      .then(() => {
        setSummaryData({
          isShown: true,
          isSuccess: true,
          title: 'pages.investors.view.deactivateSuccess.title',
          subtitle: 'pages.investors.view.deactivateSuccess.subtitle'
        });

        setInvestorData({
          ...investorData,
          isRequestDeactivate: true
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

  const onAfterDeleteCallback = () => {
    onToggleConfirmDeleteUser();

    navigate(`/${role}/investors`);
  };

  const getInvestorData = () => {
    InvestorService.getComplex(id!)
    .then(res => {
      const { data } = res;

      const {
        totalRecieved,
        totalOriginalAmount,
        totalTransactions,
        holdings: {
          data: investorHoldings,
          count: totalHoldings
        }
      } = data;

      const investorName = isNaturalPerson(data) ?
        `${data.firstName} ${data.lastName}` :
        data.companyName;

      setName(investorName);

      setSummary(createInvestorSummary({
        totalRecieved,
        totalOriginalAmount,
        totalHoldings,
        totalTransactions
      }));

      const dataForChart: HorizontalStackedBarData[] = investorHoldings
        .slice(0, 5)
        .sort((curr, next) => DateUtils.sortDate(curr.heldSince, next.heldSince, SortingDirection.descending))
        .map((holding, index) => ({
          data: {
            label: holding.name,
            amount: getProductTotalAmount(holding),
            barColor: colors[index]
          },
        }));

      const { type, email, phone, address, postcode, city, status, isRequestDeactivate } = data;

      let investorInfo: Partial<Investor> = { type, email, phone, address, postcode, city, status, isRequestDeactivate };

      if (isNaturalPerson(data)) {
        const { firstName, lastName, bsn } = data;
        investorInfo = {
          ...investorInfo,
          ...{ firstName, lastName, bsn: bsn ? bsn.toString() : '' }
        };
      }

      if (isLegalEntity(data)) {
        const { kvk, companyName } = data;

        investorInfo = {
          ...investorInfo,
          ...{ kvk, companyName }
        };
      }

      setInvestorData(investorInfo);

      setHoldingsChartData(dataForChart);

      setHoldings(investorHoldings);

      setDetails(createInvestorDetails(data));
    })
    .catch((error) => {
      console.log(error);

      if (role && error?.response?.status === 404) navigate(`/${role}/investors`);
    })
    .finally(() => setIsFetching(false));
  };

  useEffect(() => {
    if (!showEditForm) getInvestorData();
  }, [showEditForm, role, i18n.language]);

  useEffect(() => {
    setHoldingsRows(createInvestorHoldingsRows(holdings));
  }, [holdings, i18n.language]);

  return {
    t,
    id,
    width,
    isFetching,
    breadcrumps,
    name,
    role,
    details,
    summary,
    holdings,
    holdingsRows,
    holdingsTHeader,
    holdingsChartData,
    showEditForm,
    onToggleEditForm,
    investorData,
    investorId: id!,
    onRequestDeactivate,
    showDeactivateFail,
    onFailClose,
    isInvestorActive: investorData.status !== AccountStatus.inactive,
    showDeleteUserConfirm,
    onToggleConfirmDeleteUser,
    onAfterDeleteCallback,
    maxStackedChartLength: colors.length,
    getInvestorData
  };
};

export { useInvestorView };
