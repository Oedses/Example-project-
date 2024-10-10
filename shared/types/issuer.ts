import { AccountStatus, PeriodType, Status } from "./common";
import { Product } from "./product";
import { Transaction } from "./transaction";
import { BaseUser } from "./user";

type Issuer = BaseUser & {
  name: string
  phone: string
  kvk: string
  vat: string
  address: string
  postcode: string
  totalProducts?: number
  totalVolumeAllProducts?: number
  city: string
  createdAt?: Date
  status?: AccountStatus
};

type IssuerOverview = {
  totalIssuedAmount: number
  repaidAmount: number
  products: Product[]
  transactions: Transaction[]
  totalInterestQarter: number
}

type IssuerOverviewRequest = {
  id?: string
  periodType: PeriodType
}

type IssuersListRequest = {
  skip: string
  limit: string
  name?: string
  status?: Status
  startDate?: Date
  endDate?: Date
  startTotalProducts?: number
  endTotalProducts?: number
}

type IssuerFilters = {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

type ComplexIssuerRequest = {
  id: string
}

type ComplexIssuer = Issuer & {
  totalVolume: number
  totalInvestors: number
  totalPayOut: number
  products: {
    data: Product[]
    count: number
  }
}

export type { Issuer, IssuerOverviewRequest, IssuerOverview, IssuersListRequest, ComplexIssuerRequest, ComplexIssuer, IssuerFilters };