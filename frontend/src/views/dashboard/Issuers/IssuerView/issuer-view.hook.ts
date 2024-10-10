import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { getErrorMessageName, translate } from "../../../../utils/fn";

import { Issuer } from "../../../../../../shared/types/issuer";
import { Product } from "../../../../../../shared/types/product";
import { AccountStatus } from "../../../../../../shared/types/common";

import IssuerService from "../../../../services/IssuerService";
import UserService from "../../../../services/UserService";

import UserContext from "../../../../store/contexts/user-context";
import SummaryContext from "../../../../store/contexts/summary-context";

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row } from "../../../components/UI/Table";

import {
  createIssuerDetails,
  createIssuerProductsRows,
  createIssuerSummary,
  productTableHeader
} from "./issuer-view.constants";
import { BreadcrumpItem } from "../../../components/UI/Breadcrumps";

type IssuerViewParams = 'id';

const useIssuerView = () => {
  const { data: { role } } = UserContext.useContext();
  const { setData: setSummaryData } = SummaryContext.useContext();

  const [name, setName] = useState('');

  const [isFetching, setIsFetching] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [showDeactivateFail, setShowDeactivateFail] = useState(false);


  const [details, setDetails] = useState<ListItemProps[]>([]);
  const [summary, setSummary] = useState<ListItemProps[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsRows, setProductsRows] = useState<Row[]>([]);

  const [issuerData, setIssuerData] = useState<Partial<Issuer>>({});

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { width } = useWindowSize();

  const { id } = useParams<IssuerViewParams>();

  const breadcrumps: BreadcrumpItem[] = [
    {
      label: t('menu.breadcrumps.issuers'),
      path: 'issuers'
    },
    { label: (name as string) }
  ];

  const productTHeader = useMemo(() => translate(productTableHeader), [i18n.language]);

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

        setIssuerData({
          ...issuerData,
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

  const onAfterDeleteUser = () => {
    onToggleConfirmDeleteUser();
    navigate(`/${role}/issuers`);
  };

  const getIssuerData = () => {
    IssuerService.getComplex(id!)
    .then(res => {
      const { data } = res;

      const {
        name: issuerName,

        totalInvestors,
        totalPayOut,
        totalVolume,

        products: {
          data: productData,
          count: totalProducts
        }
      } = data;

      const issuerDetailsData = createIssuerDetails(data);

      const issuerSummaryData = createIssuerSummary({
        totalProducts,
        totalVolume,
        totalInvestors,
        totalPayOut
      });

      const issuerProductsRows = createIssuerProductsRows(productData);

      const { email, phone, kvk, vat, address, postcode, city, status, isRequestDeactivate } = data;

      setIssuerData({
        name: issuerName,
        email,
        role,
        phone,
        kvk: kvk ? kvk.toString() : '',
        vat,
        address,
        postcode,
        city,
        status,
        isRequestDeactivate
      });

      setName(issuerName);

      setDetails(issuerDetailsData);
      setSummary(issuerSummaryData);

      setProducts(productData);
      setProductsRows(issuerProductsRows);
    })
    .catch((error) => {
      console.log(error);

      if (role && error?.response?.status === 404) navigate(`/${role}/issuers`);
    })
    .finally(() => setIsFetching(false));
  };

  const isIssuerActive = useMemo(() =>  issuerData.status !== AccountStatus.inactive, [issuerData.status]);

  useEffect(() => {
    if (!showEditForm) {
      getIssuerData();
    }
  }, [showEditForm, role, i18n.language]);

  return {
    t,
    width,
    isFetching,
    breadcrumps,
    name,
    role,
    details,
    summary,
    products,
    productsRows,
    productTHeader,
    showEditForm,
    onToggleEditForm,
    issuerData,
    issuerId: id!,
    showDeleteUserConfirm,
    onToggleConfirmDeleteUser,
    onRequestDeactivate,
    showDeactivateFail,
    onAfterDeleteUser,
    isIssuerActive,
    getIssuerData
  };
};

export { useIssuerView };
