import { PaymentType } from "./transaction";

export type Modify<T, R> = Omit<T, keyof R> & R;

export type Filter<T extends {}> = {
  [key in keyof Partial<T>]: string;
};

export type ObjWithKeys<T extends ObjKeyValue> = {
  [key: string]: T
};

export type Label = {
  label: string;
  value: string;
}

export interface InputDefaultProps {
  label?: string;
  className?: string;
  errorMessage?: string;
  disabled?: boolean;
  placeholder?: string;
}

export enum CellStatus {
  processing = 'Processing',
  fulfilled = 'Fulfilled',
  finalizing = 'Finalizing',
  active = 'Active',
  inactive = "Inactive"
}

export enum Status {
  processing = 'Processing',
  processed = 'Processed',
  pending = 'Pending',
  active = 'Active',
  inactive = "Inactive",
  fulfilled = 'Fulfilled',
  finalizing = 'Finalizing',
  failed = 'Failed',
  rejected = "Rejected",
}

export enum AccountStatus {
  processing = 'Processing',
  active = 'Active',
  inactive = 'Inactive',
  failed = 'Failed',
  rejected = "Rejected"
}

export enum PeriodType {
  year = 'year',
  month = 'month',
  interval = 'interval'
}

export type ValueForPeriod = {
  period: number
  value: number
}

export enum Roles {
  investor = 'investor',
  admin = 'admin',
  issuer = 'issuer',
  compliance = 'compliance'
}

export enum ComplianceStatus {
  Initiated = 'Initiated',
  Accepted = 'Accepted',
  Rejected = 'Rejected'
}

export enum Entities {
  user = 'User',
  investor = 'Investor',
  issuer = 'Issuer',
  product = 'Product',
  transaction = 'Transaction',
  admin = 'Admin'
}

export type ComplianceActionName = 'AddUser' | 'AddProduct' | 'BuyTransaction' | 'SellTransaction' | 'PaymentTransaction' | 'PaymentTransactionArray' | 'UpdateUser' | 'DeactivateUser' | 'DeactivateProduct' | 'DeleteUser';

export type ComplianceInvestors = {
  id: string
  fullName: string
  amount: number
}

export type ComplianceLogAction = {
  id: string;
  entity: 'User' | 'Investor' | 'Issuer' | 'Product' | 'Transaction' | 'Admin';
  entityName: string;
  name: ComplianceActionName;
  value?: string;
  receiver?: {
    id: string
    name: string
    role: Roles.investor | Roles.issuer
  },
  investors?: ComplianceInvestors[]
  paymentType?: PaymentType
}

export type ComplianceLogItem = {
  _id?: string;
  id?: string;
  date: string;
  relatedUserId: string;
  action: ComplianceLogAction;
  remarks?: string;
  status: ComplianceStatus;
  creator: {
    type: Entities.admin | Entities.user,
    id: string
  };
  requestedBy?: {
    id: string,
    type: string,
    role: Roles,
    firstName: string,
    lastName: string,
    companyName: string,
    name: string
  }
  verifier?: string;
  transactionHash?: string
};

export type ObjKeyValue = {
  [key: string]: any;
}
