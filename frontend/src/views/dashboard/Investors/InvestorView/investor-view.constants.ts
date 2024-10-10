import { t } from "i18next";
import { Status } from "../../../../../../shared/types/common";
import { Holding } from "../../../../../../shared/types/holding";
import { ComplexInvestor, isNaturalPerson, LegalEntityInvestor } from "../../../../../../shared/types/investor";
import { Product, ProductCategory } from "../../../../../../shared/types/product";
import { formatDate, getOutstandingCapital, getProductTotalAmount } from "../../../../utils";

import { ListItemProps } from "../../../components/UI/List/ListItem";
import { Row, TableCell, TableCellTypes } from "../../../components/UI/Table";
import { MAX_VALUE_LENGTH } from "../../../components/UI/Table/table.constants";

const tPath = 'components.table';


export const createInvestorDetails = (investor: Partial<ComplexInvestor>): ListItemProps[] => {
  const type = t(`${tPath}.investors.type.${isNaturalPerson(investor) ? 'naturalPerson' : 'legalEntity'}`);

  const name = isNaturalPerson(investor) ? [
    {
      title: t('pages.investors.view.details.list.firstName'),
      content: investor.firstName
    },
    {
      title: t('pages.investors.view.details.list.lastName'),
      content: investor.lastName
    },
  ] : [
    {
      title: t('pages.investors.view.details.list.companyName'),
      content: (investor as LegalEntityInvestor).companyName
    }
  ];

  const bsn = isNaturalPerson(investor) ? [
    {
      title: t('pages.investors.view.details.list.bsn'),
      content: investor.bsn
    }
  ] : [];

  return [
    {
      title: t('pages.investors.view.details.list.status'),
      content: t(`${tPath}.status.${investor.status!.toLowerCase()}`),
      status: investor.status as unknown as Status,
      isStatus: true,
    },
    {
      title: t('pages.investors.view.details.list.createdOn'),
      content: formatDate(investor.createdAt)
    },
    {
      title: t('pages.investors.view.details.list.entityType'),
      content: type
    },

    ...name,

    {
      title: t('pages.investors.view.details.list.email'),
      content: investor.email
    },
    {
      title: t('pages.investors.view.details.list.phone'),
      content: investor.phone
    },

    ...bsn,

    {
      title: t('pages.investors.view.details.list.address'),
      content: investor.address
    },
    {
      title: t('pages.investors.view.details.list.postcode'),
      content: investor.postcode
    },
    {
      title: t('pages.investors.view.details.list.city'),
      content: investor.city
    }
  ];
};

type InvestorSummary = {
  totalRecieved: number;
  totalOriginalAmount: number;
  totalHoldings: number;
  totalTransactions: number;
};

export const createInvestorSummary = ({ totalRecieved, totalOriginalAmount, totalHoldings, totalTransactions }: InvestorSummary): ListItemProps[] => [
  {
    title: t('pages.investors.view.summary.list.recieved'),
    content: totalRecieved.toString(),
    isAmount: true
  },
  {
    title: t('pages.investors.view.summary.list.payments'),
    content: totalOriginalAmount?.toString(),
    isAmount: true,
  },
  {
    title: t('pages.investors.view.summary.list.holdings'),
    content: totalHoldings.toString(),
    contentClasses: 'list-item__montserrat'
  },
  {
    title: t('pages.investors.view.summary.list.transactions'),
    content: totalTransactions.toString(),
    contentClasses: 'list-item__montserrat'
  }
];

export const createInvestorHoldingsRows = (holdings: Holding[]): Row[] => {
  return holdings.map((holding: Holding) => {
    const { name, product, heldSince } = holding;

    const holdingName = name;
    const withTooltip = holdingName.length > MAX_VALUE_LENGTH;

    const isOutStandingCapitalDisplayed = holding.category === ProductCategory.Bond;

    return [
      {
        type: TableCellTypes.STRING,
        value: holdingName,
        withTooltip
      },
      {
        type: TableCellTypes.STRING,
        value: t(`${tPath}.products.category.${(product as Product).category.toLowerCase()}`)
      },
      {
        type: TableCellTypes.CURRENCY,
        value: getProductTotalAmount(holding).toString()
      },
      {
        type: isOutStandingCapitalDisplayed ? TableCellTypes.CURRENCY : TableCellTypes.STRING,
        value: isOutStandingCapitalDisplayed ? getOutstandingCapital(holding).toString() : 'N/A',
        contentClasses: 'table-cell__centered'
      },
      {
        type: TableCellTypes.CURRENCY,
        value: holding?.amountReceived ? (holding.amountReceived).toFixed(2) : '0'
      },
      {
        type: TableCellTypes.DATE,
        value: formatDate(heldSince),
      },
      {
        type: TableCellTypes.DATE,
        value: formatDate(holding.maturityDate!),
      },
      {
        type: TableCellTypes.DATE,
        value: holding.nonCallPeriod ? formatDate(holding.nonCallPeriod) : "N/A",
      },
      {
        type: TableCellTypes.ROW_DATA,
        value: (product as Product).id || "",
        rowData: {
          navigateUrl: `/products/${(product as Product).id}`,
        }
      }
    ] as TableCell[];
  });
};

export const holdingsTableHeader = [
  'pages.investors.view.holdings.table.head.holding',
  'pages.investors.view.holdings.table.head.category',
  'pages.investors.view.holdings.table.head.originalAmount',
  'pages.investors.view.holdings.table.head.outstandingAmount',
  'pages.investors.view.holdings.table.head.amountRecieved',
  'pages.investors.view.holdings.table.head.heldSince',
  'pages.investors.view.holdings.table.head.maturityDate',
  'pages.investors.view.holdings.table.head.nonCallPeriod'
];

export const colors = [
  '#0099CC',
  '#a55eea',
  '#eb3b5a',
  '#fd9644',
  '#fed330',
  '#20bf6b',
  '#26de81',
  '#0fb9b1',
  '#4b6584',
  '#a5b1c2',
];

