import { AccountStatus, ComplianceStatus, Status } from "./common";
import { ProductCategory } from "./product";
import { TransactionStatus } from "./transaction";

export interface Pageable<T> {
  count: number,
  data: T[],
  totals?: { count: number, label: AccountStatus | Status | TransactionStatus | ComplianceStatus | ProductCategory }[]
}

export type Query = {
  [key: string]: string | number;
}