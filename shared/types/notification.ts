export enum EntityType {
  PRODUCT = 'product',
  INVESTOR = 'investor',
  ISSUER = 'issuer'
}

export enum NotificationType {
  // === userRole + fullName
  addUser = 'addUser',
  updateUser = 'updateUser',
  requestDeactivateUser = 'requestDeactivateUser',
  deactivateUser = 'deactivateUser',
  deleteUser = 'deleteUser',
  approveDeactivateUser = 'approveDeactivateUser',
  rejectDeactivateUser = 'rejectDeactivateUser',
  rejectDeactivateUserAdmin = 'rejectDeactivateUserAdmin',
  approveDeleteUser = 'approveDeleteUser',
  rejectDeleteUser = 'rejectDeleteUser',

  // === productName
  newTransactionBuy = 'newTransactionBuy',
  newTransactionSell = 'newTransactionSell',
  newTransactionPayment = 'newTransactionPayment',
  approveTransactionBuyIssuer = 'approveTransactionBuyIssuer',
  approveTransactionBuyInvestor = 'approveTransactionBuyInvestor',
  approveTransactionBuyAdmin = 'approveTransactionBuyAdmin',
  rejectTransactionBuy = 'rejectTransactionBuy',
  approveTransactionSellIssuer = 'approveTransactionSellIssuer',
  approveTransactionSellInvestor = 'approveTransactionSellInvestor',
  approveTransactionSellReceiver = 'approveTransactionSellReceiver',
  approveTransactionSellAdmin = 'approveTransactionSellAdmin',
  approveTransactionSellReturned = 'approveTransactionSellReturned',
  approveTransactionSellReturnedAdmin = 'approveTransactionSellReturnedAdmin',
  rejectTransactionSell = 'rejectTransactionSell',
  rejectTransactionSellReturned = 'rejectTransactionSellReturned',
  approveTransactionPaymentIssuer = 'approveTransactionPaymentIssuer',
  approveTransactionPaymentInvestor = 'approveTransactionPaymentInvestor',
  approveTransactionPaymentAdmin = 'approveTransactionPaymentAdmin',
  rejectTransactionPayment = 'rejectTransactionPayment',
  deactivateProduct = 'deactivateProduct',

  newProduct = 'newProduct',

  remindForPayment = 'remindForPayment',
  remindForMature = 'remindForMature',

  // === investorName + productName + amount
  // === fullName + productName + amount
  requestBuy = 'requestBuy',

  // === fullName + productName
  requestDelistProduct = 'requestDelistProduct',

  approveDeactivateProductIssuer = 'approveDeactivateProductIssuer',
  rejectDeactivateProductIssuer = 'rejectDeactivateProductIssuer',
  approveDeactivateProductInvestor = 'approveDeactivateProductInvestor',
}

export type NotificationTranslationData = {
  fullName?: string
  userRole?: string
  productName?: string
  amount?: number | string
  countOfDaysForMaturity?: number
}

export type Notification = {
  id?: string
  receiverId?: string
  entityType: EntityType
  relatedEntityId: string
  text: string
  isRead: boolean
  isCompliance?: boolean
  createdAt: Date
  type: NotificationType
  translationData: NotificationTranslationData
}

export type NotificationCreate = {
  id?: string
  receiverId?: string
  entityType: EntityType
  relatedEntityId: string
  text: string
  isRead?: boolean
  isCompliance?: boolean
  createdAt?: Date
  type: NotificationType
  translationData: NotificationTranslationData
}

export type ReadNotificationRequest = {
  ids?: string[],
}

export type NotificationsListRequest = {
  skip: string
  limit: string
  isRead?: boolean
}
