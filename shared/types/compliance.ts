import { ComplianceActionName, ComplianceStatus, Roles } from "./common";
import { InvestorType } from "./investor";
import { PaymentType, Product } from "./product";
import { CreateTransactionRequest } from "./transaction";

export type ComplianceListRequest = {
    skip: number;
    limit: number;
    status?: ComplianceStatus;
    relatedUserId?: string;
    actionType?: ComplianceActionName | PaymentType
    relatedTo?: string
    startDate?: Date
    endDate?: Date
}

export type RejectComplianceRequest = {
    reason: string;
}

export type ComplianceCategory = {
    [key in ComplianceStatus]: number;
}

export type PaymentTransactionAction = {
    createTransaction: CreateTransactionRequest
    product: Product
    transactionId: string
}

export type ComplianceFilters = {
    startDate: Date | undefined;
    endDate: Date | undefined;
    relatedBy: ComplianceFiltersRelatedBy | undefined;
    relatedTo: ComplianceFiltersRelatedTo | undefined;
    action: ComplianceFiltersAction | undefined;
    status: ComplianceFiltersStatus | undefined;
}

export type ComplianceFiltersRelatedBy = {
    id: string 
    firstName?: string
    lastName?: string
    companyName?: string
    name?: string
    type?: InvestorType
    role?: Roles
}

export type ComplianceFiltersRelatedTo = {
    id: string 
    name: string
}

export type ComplianceFiltersAction = {
    id: string 
    name: string
}

export type ComplianceFiltersStatus = {
    id: string 
    name: string
}

export type ComplianceFiltersDataResponse = {
    relatedTo: ComplianceFiltersRelatedTo[]
    relatedBy: ComplianceFiltersRelatedBy[]
}

export enum ComplianceFiltersActionType {
    addUser = "AddUser",
    addProduct = "AddProduct",
    buyTransaction = "BuyTransaction",
    sellTransaction = "SellTransaction",
    paymentTransaction = "PaymentTransaction",
    paymentTransactionArray = "PaymentTransactionArray",
    updateUser = "UpdateUser",
    deactivateUser = "DeactivateUser",
    deactivateProduct = "DeactivateProduct",
    deleteUser = "DeleteUser",
    generic = "Generic",
    repayment = "Repayment",
    interest = "Interest",
    dividend = "Dividend",
}
