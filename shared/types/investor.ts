import { AccountStatus, PeriodType } from "./common";
import { Holding } from "./holding";
import { Product } from "./product";
import { Transaction } from "./transaction";
import { BaseUser } from "./user";

export enum InvestorType {
  NATURAL_PERSON = 'Natural person',
  LEGAL_ENTITY = 'Legal entity',
}

type BaseInvestor = BaseUser & {
  type: InvestorType,
  phone: string
  address: string
  postcode: string
  city: string
  date?: string
  totalPayments?: number
  totalProducts?: number
  status?: AccountStatus
  holding?: Holding
  createdAt?: Date
};

type NaturalPersonInvestor = {
  firstName: string
  lastName: string
  bsn: string
} & BaseInvestor;

type LegalEntityInvestor = {
  kvk: string
  companyName: string
} & BaseInvestor;

type InvestorsListRequest = {
  skip: string
  limit: string
  name?: string
  status?: AccountStatus,
  productId?: string,
  isHolding: string
  startDate: Date,
  endDate: Date,
  startTotalProducts: number,
  endTotalProducts: number,
  entityType: InvestorType
}

type InvestorOverview = {
  firstHoldingDate: Date | null
  totalRecievedAmount: number
  totalOriginalAmount: number
  products: Product[]
  transactions: Transaction[]
  chartData: InvestorChartData[] | InvestorIntervalChartData[]
}

type InvestorChartData = {
  period: number
  totalAmountReceived: number
  totalOriginalAmount: number
}

type InvestorIntervalChartData = {
  date: string,
  totalAmountReceived: number
  totalOriginalAmount: number
}

type InvestorPortfolio = {
  firstHoldingDate: Date | null
  totalRecievedAmount: number
  totalOriginalAmount: number
  holdings: Holding[]
  chartData: InvestorChartData[] | InvestorIntervalChartData[]
}

type InvestorFilters = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  entityType: InvestorFiltersEntityType | undefined;
  startTotalProducts: number | undefined;
  endTotalProducts: number | undefined;
}

type InvestorFiltersEntityType ={
  id: string 
  name: string
}

type InvestorOverviewRequest = {
  periodType: PeriodType
  from?: Date,
  to?: Date
}

type InvestorPortfolioRequest = {
  periodType: PeriodType
  from?: Date,
  to?: Date
}

type ComplexInvestorRequest = {
  id: string
}

type ComplexInvestor = Investor & {
  totalRecieved: number
  totalOriginalAmount: number
  totalTransactions: number
  holdings: {
    data: Holding[]
    count: number
  }
}

export type Investor = NaturalPersonInvestor | LegalEntityInvestor;

export const isNaturalPerson = (x: unknown): x is NaturalPersonInvestor => {
  return (
    (x as NaturalPersonInvestor).type === InvestorType.NATURAL_PERSON ||
    Boolean( (x as NaturalPersonInvestor).firstName)
    );
};

export const isLegalEntity = (x: unknown): x is LegalEntityInvestor => {
  return (
    (x as LegalEntityInvestor).type === InvestorType.LEGAL_ENTITY ||
    Boolean( (x as LegalEntityInvestor).companyName)
  );
};

export type { BaseInvestor, NaturalPersonInvestor, LegalEntityInvestor, InvestorsListRequest,
  InvestorOverview, InvestorOverviewRequest, InvestorPortfolioRequest, InvestorPortfolio, InvestorChartData,
  ComplexInvestorRequest, ComplexInvestor, InvestorIntervalChartData, InvestorFilters, InvestorFiltersEntityType };