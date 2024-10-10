import { PeriodType } from "./common";
import { BaseUser } from "./user";

type Admin = BaseUser & {
  firstName: string
  lastName: string
};

type AdminOverviewRequest = {
  id: string
  periodType: PeriodType
}

type AdminChartData = {
  period: number,
  buyVolume: number,
  sellVolume: number,
  paymentVolume: number,
  processingVolume: number,
}[]

type AdminOverview = {
  lastPeriodVolume: {
    currentValue: number
    previousValue: number
  }
  lastPeriodProcessingVolume: {
    currentValue: number
    previousValue: number
  }
  lastPeriodPayment: {
    currentValue: number
    previousValue: number
  }
  lastPeriodTransactions: {
    currentValue: number
    previousValue: number
  }
  chartData: AdminChartData
}


export type { Admin, AdminOverviewRequest, AdminOverview, AdminChartData }