import { ProductCategory } from './../../../../../../shared/types/product';
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";

import { ComplexProduct } from "../../../../../../shared/types/product";

import ProductService from "../../../../services/ProductService";

import { delay, getErrorMessageName, getOutstandingCapital, getProductTotalAmount, isInvestor, isSuperUser, translate } from "../../../../utils";

import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row, TableCellTypes } from "../../../components/UI/Table";
import { HorizontalStackedBarData } from "../../../components/UI/HorizontalStackedBar";

import {
  myHoldingsTHead,
  complianceLogTHHeader,
  documentsTHead,
  createHoldingsRows,
  createProductDetailsList,
  createProductOverviewList,
  rolesForComplianceLog,
  rolesForDeactivate,
  createSuccessSummary,
  createFailSummary,
  investorsTHeader,
} from './product-view.constants';

import { useWindowSize } from "../../../components/Hooks/useWindowSize";
import { Holding } from "../../../../../../shared/types/holding";
import UserContext from "../../../../store/contexts/user-context";
import SummaryContext from "../../../../store/contexts/summary-context";
import { CreateTransactionFormValues } from "../../../../../../shared/types/transaction";
import { Roles, Status } from "../../../../../../shared/types/common";
import { BreadcrumpItem } from "../../../components/UI/Breadcrumps";
import { createInvestorsRows } from "./product-view.constants";

type ProductViewParams = 'id' | 'issuerId';

const useProductView = () => {
  const { data: { id: userId, role, name } } = UserContext.useContext();
  const { setData: setDummaryData } = SummaryContext.useContext();

  const [isFetching, setIsFetching] = useState(true);
  const [isPopupShow, setIsPopupShow] = useState(false);
  const [isRequestBuyShow, setIsRequestBuyShow] = useState(false);

  const [product, setProduct] = useState<ComplexProduct>();
  const [isRequestDeactivateProduct, setIsRequestDeactivateProduct] = useState(false);
  const [stackedBarData, setStackedBarData] = useState<HorizontalStackedBarData[]>([]);

  const [holdings, setHoldings] = useState<Holding[]>([]);

  const [holdingsRows, setHoldingsRows] = useState<Row[]>([]);
  const [investorsRows, setInvestorsRows] = useState<Row[]>([]);

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { width } = useWindowSize();

  const onTogglePopup = () => setIsPopupShow(!isPopupShow);

  const onToggleRequestBuy = () => setIsRequestBuyShow(prev => !prev);

  const { id, issuerId } = useParams<ProductViewParams>();

  const productDetailsList: ListItemProps[] = createProductDetailsList(product);

  const productOverviewList: ListItemProps[] = createProductOverviewList(product);

  const isDeactivateAllowed = useMemo(() =>
    rolesForDeactivate.includes(role) && product?.status === Status.active,
    [role, rolesForDeactivate, product]);

  const isComplianceLogShow = useMemo(() => rolesForComplianceLog.includes(role), [role, rolesForComplianceLog]);

  const isRequestBuyAvailable = useMemo(() =>
    role !== Roles.admin && product?.status === Status.active,
    [role, product?.status]);

  const getStackedBarData = (complexProduct: ComplexProduct): HorizontalStackedBarData[] => {
    const stackedData: HorizontalStackedBarData[] = [
      {
        data: {
          label: t('pages.products.view.productOverview.bar.avialableVolume'),
          amount: complexProduct?.totals.availableVolume || 0,
          barColor: "#0099CC"
        }
      },
      {
        data: {
          label: t('pages.products.view.productOverview.bar.volumeSold'),
          amount: complexProduct?.totals.volumeSold || 0,
          barColor: "#28A745"
        }
      },
    ];

    if (role === Roles.investor) {
      stackedData.push({
        data: {
          label: t('pages.products.view.productOverview.bar.myHoldings'),
          amount: complexProduct?.totals.totalHoldingsVolume || 0,
          barColor: "#CC3300"
        }
      });
    }

    stackedData.push({
      data: {
        label: t('pages.products.view.productOverview.bar.reserved'),
        amount: complexProduct?.totals.reservedAmount || 0,
        barColor: '#ffd60a'
      }
    });

    return stackedData;
  };

  const onDeactivateClick = () => {
    const isAdmin = role === Roles.admin;

    const DeactivateReqest = isAdmin ?
      ProductService.delist :
      ProductService.requestDelist;

    DeactivateReqest(id!)
      .then(() => {
        setDummaryData(createSuccessSummary(t('pages.products.view.requestDelist.success.title')));

        if (isAdmin) setIsRequestDeactivateProduct(true);
      })
      .catch((err) => {
        const errorMessageName = getErrorMessageName(err.response.data.stack);
        const errorMsg = t(`error.backend.${errorMessageName}`);

        setDummaryData(createFailSummary(t('pages.products.view.requestDelist.fail.title'), errorMsg));
      });
  };

  const myHoldingsTableHead = myHoldingsTHead.map(item => t(item));

  const holdingsData = holdings?.reduce((acc, curr) => {
    let outstandingCapital = acc.outstandingCapital;

    if (curr.category === ProductCategory.Bond) {
      outstandingCapital = ((Number(acc.outstandingCapital) || 0) + getOutstandingCapital(curr)).toString();
    }

    return {
      recieved: acc.recieved + (Number(curr?.amountReceived) || 0),
      original: acc.original + getProductTotalAmount(curr),
      outstandingCapital
    };
  }, {
    recieved: 0,
    original: 0,
    outstandingCapital: 'N/A'
  });

  const myHoldingsList: ListItemProps[] = [
    {
      title: t('pages.products.view.myHoldings.listData.recievedAmount'),
      content: holdingsData?.recieved.toString() || '0',
      isAmount: true,
      contentClasses: 'product-view__holdings__recieved-amount'
    },
    {
      title: t('pages.products.view.myHoldings.listData.originalAmount'),
      content: holdingsData?.original.toString() || '0',
      isAmount: true
    },
    {
      title: t('pages.products.view.myHoldings.listData.outstandingAmount'),
      content: holdingsData?.outstandingCapital.toString(),
      isAmount: holdingsData?.outstandingCapital !== 'N/A'
    }
  ];

  const complianceLogTableHeader = translate(complianceLogTHHeader);

  const documentsTableHead = translate(documentsTHead);

  const investorsTableHead = translate(investorsTHeader);

  const breadcrumps: BreadcrumpItem[] = [
    {
      label: t('menu.breadcrumps.products'),
      path: 'products'
    },
    { label: (product?.name as string) }
  ];


  const documentsTableData: Row[] = [
    [
      {
        type: TableCellTypes.LINK,
        value: 'some document'
      },
      {
        type: TableCellTypes.DATE,
        value: '01-01-2021'
      }
    ],
    [
      {
        type: TableCellTypes.LINK,
        value: 'some document'
      },
      {
        type: TableCellTypes.DATE,
        value: '01-01-2021'
      }
    ]
  ];

  const requestBuyData: Pick<CreateTransactionFormValues, 'investor' | 'product'> = {
    product: {
      id: id!,
      name: product?.name as string,
      quantity: product?.quantity as number,
      realAvailableVolume: product?.realAvailableVolume as number,
      availableVolume: product?.availableVolume as number,
      ticketSize: product?.ticketSize,
    },
    investor: {
      id: (userId || localStorage.getItem('userId')) as string,
      name
    }
  };

  const getProduct = () => {
    ProductService.getItem(id!)
      .then(res => {
        const { data } = res;

        const {
          productHoldings
        } = data;

        setProduct(data);
        setIsRequestDeactivateProduct(data.isRequestDeactivate || false);

        if (isInvestor(role)) {
          const holdingData: Holding[] = data.holdings!;

          setHoldings(holdingData);

          setHoldingsRows(createHoldingsRows(holdingData));
        }

        if (isSuperUser(role)) {
          setInvestorsRows(createInvestorsRows(productHoldings));
        }

        setStackedBarData(getStackedBarData(data));
      })
      .catch((error) => {
        console.log(error);

        if (role && error?.response?.status === 404) navigate(`/${role}/products`);
      })
      .finally(() => setIsFetching(false));
  };

  useEffect(() => {
    if (id) {
      delay(() => {
        setIsFetching(true);
        getProduct();
      }, 500);
    }
  }, [userId, issuerId, role, id, i18n.language]);

  return {
    t,
    isInvestor: isInvestor(role),
    role,
    isFetching,
    isPopupShow,
    breadcrumps,
    onTogglePopup,
    product,
    productDetailsList,
    productOverviewList,
    myHoldingsList,
    holdingsRows,
    investorsRows,
    myHoldingsTableHead,
    stackedBarData,
    documentsTableHead,
    documentsTableData,
    investorsTableHead,
    width,
    id,
    userId,
    complianceLogTableHeader,
    onDeactivateClick,
    isRequestBuyShow,
    onToggleRequestBuy,
    requestBuyData,
    isComplianceLogShow,
    isRequestBuyAvailable,
    isDeactivateAllowed,
    isShowInvestorsAllowed: isSuperUser(role),
    isRequestDeactivateProduct,
    getProduct,
  };
};

export { useProductView };
