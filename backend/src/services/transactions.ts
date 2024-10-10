/* eslint-disable no-underscore-dangle */
import { Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Db } from 'mongodb';
import { ITransactionRepository } from '../domains/transactions';
import { CreateTransactionRequest, PaymentType, Transaction, TransactionsListRequest, TransactionStatus, TransactionType } from '../../../shared/types/transaction';
import { Pageable } from '../../../shared/types/response';
import NotFoundError from '../errors/NotFoundError';
import { Holding } from '../../../shared/types/holding';
import { isInterestProduct, PaymentFrequency, Product } from '../../../shared/types/product';
import BussinessError from '../errors/BussinessError';
import { ComplianceInvestors, ComplianceLogItem, ComplianceStatus, Entities, ObjKeyValue, Roles, Status } from '../../../shared/types/common';
import { IComplianceRepository } from '../domains/compliance';
import { IUserRepository } from '../domains/users';
import { getDisplayName, isInvestor, User } from '../../../shared/types/user';
import { ErrorMessage } from '../constants/errorMessage';
import { isNaturalPerson } from '../../../shared/types/investor';
import { INotificationRepository } from '../domains/notifications';
import { EntityType, NotificationType } from '../../../shared/types/notification';
import { getDateQuarter } from '../utils/fn';
import ForbiddenError from '../errors/ForbiddenError';
import { IMailClient } from '../clients/MailClient';

const createReceiverName = (user: User) => {
  if (isInvestor(user)) {
    return isNaturalPerson(user) ? `${user.firstName} ${user.lastName}` : `${user.companyName}`;
  }
  return user?.name!;
};


const getPaymentFrequency = (paymentFrequency: PaymentFrequency): number => {
  switch (paymentFrequency) {
    case PaymentFrequency.ANNUALLY:
      return 1;
    case PaymentFrequency.BIANNUALLY:
      return 2;
    case PaymentFrequency.QUARTERLY:
      return 4;
    default:
      return 1;
  }
};


export default class TransactionService {

  private _repository: ITransactionRepository;

  private _holdingsCollection: Collection<Holding>;

  private _productsCollection: Collection<Product>;

  private _transactionsCollection: Collection<Transaction | CreateTransactionRequest>;

  private _complianceRepo: IComplianceRepository;

  private _userRepo: IUserRepository;

  private _notificationsRepo: INotificationRepository;

  private _mailClient: IMailClient;

  constructor(
    repository: ITransactionRepository,
    complianceRepo: IComplianceRepository,
    userRepo: IUserRepository,
    notificationsRepo: INotificationRepository,
    mailClient: IMailClient,
    pool: Db
  ) {
    this._repository = repository;
    this._holdingsCollection = pool.collection("holdings");
    this._productsCollection = pool.collection("products");
    this._transactionsCollection = pool.collection("transactions");
    this._complianceRepo = complianceRepo;
    this._userRepo = userRepo;
    this._notificationsRepo = notificationsRepo;
    this._mailClient = mailClient;
  }

  async getTransactionsList(
    query: TransactionsListRequest & { userId: string }
  ): Promise<Pageable<Transaction>> {
    return this._repository.getTransactionsList({
      ...query,
      userId: query.userId,
    });
  }

  getFiltersData(user: User) {
    return this._repository.getFiltersData(user);
  }


  async createTransaction(
    createTransaction: CreateTransactionRequest,
    user: User
  ): Promise<Transaction> {
    let maturityDate: Date | null = null;

    if (user.role === Roles.investor && createTransaction.type !== TransactionType.BUY) {
      throw new ForbiddenError(ErrorMessage.notPermission, 'notPermission');
    }

    const product = await this._productsCollection.findOne({
      id: createTransaction.product,
    });

    if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

    if (product.isRequestDeactivate && product.status === Status.active && !createTransaction.returnTokens) {
      throw new NotFoundError(ErrorMessage.productPendingDeactivation, 'productPendingDeactivation');
    }

    if (product.status !== Status.active && !createTransaction.returnTokens) {
      throw new NotFoundError(ErrorMessage.notActiveProduct, 'notActiveProduct');
    }

    if (isInterestProduct(product) && product.listingDate) {
      const maturityYear =
        product.maturityUnit === "years"
          ? product.listingDate.getFullYear() + product.maturity!
          : product.listingDate.getFullYear();
      const maturityMonths =
        product.maturityUnit === "months"
          ? product.listingDate.getMonth() + product.maturity!
          : product.listingDate.getMonth();

      maturityDate = new Date(
        maturityYear,
        maturityMonths,
        product.listingDate.getDate()
      );
    }

    const creatorId: string = user.id!;
    const creator: { type: Entities.admin; id: string } = { type: Entities.admin, id: creatorId, };

    if (createTransaction.type === TransactionType.BUY) {
      return this.createBuyTransaction(createTransaction, product, maturityDate, creator);
    }

    if (createTransaction.type === TransactionType.SELL) {
      return this.createSellTransaction(createTransaction, product, maturityDate, creator);
    }

    if (createTransaction.type === TransactionType.PAYMENT) {
      return this.createPaymentTransaction(createTransaction, product, creator);
    }

    throw new BussinessError(ErrorMessage.invalidTransactionType, 'invalidTransactionType');
  }

  private async createBuyTransaction(
    createTransaction: CreateTransactionRequest,
    product: Product,
    maturityDate: Date | null,
    creator: { type: Entities.admin; id: string }
  ): Promise<Transaction> {
    const transactionId = uuidv4();
    const { quantity } = createTransaction;

    const [productTransaction] = await this._transactionsCollection.aggregate([
      {
        $match: {
          status: TransactionStatus.processing,
          product: product.id
        },
      },
      {
        $group:
          {
            _id: null,
            quantity: { $sum: '$quantity' },
          }
      },
    ]).toArray();

    if (product.availableVolume! - ((productTransaction && productTransaction.quantity || 0) + quantity!) < 0) {
      throw new BussinessError(ErrorMessage.invalidMaximumAvailableAmount, 'invalidMaximumAvailableAmount');
    }

    const complianceBody = { createTransaction, maturityDate, transactionId };

    const transaction = await this._repository.create({
      id: transactionId,
      ...createTransaction,
      ticketSize: product.ticketSize!,
      status: TransactionStatus.processing,
      createdAt: new Date(),
    });

    await this._complianceRepo.create({
      id: uuidv4(),
      date: new Date().toISOString(),
      status: ComplianceStatus.Initiated,
      action: {
        entity: 'Transaction',
        entityName: product.name,
        id: product.id!,
        name: "BuyTransaction",
        value: JSON.stringify(complianceBody),
      },
      relatedUserId: createTransaction.investor as string,
      creator,
    });

    this._notificationsRepo.create({
      entityType: EntityType.PRODUCT,
      relatedEntityId: product.id!,
      text: `New Transaction Buy product ${ product.name }`,
      isCompliance: true,
      type: NotificationType.newTransactionBuy,
      translationData: {
        productName: product.name
      }
    });

    return transaction;
  }

  private async createSellTransaction(
    createTransaction: CreateTransactionRequest,
    product: Product,
    maturityDate: Date | null,
    creator: { type: Entities.admin; id: string }
  ): Promise<Transaction> {

    const transactionId = uuidv4();
    const { investor: investorId, product: productId, quantity } = createTransaction;

    let reservedQuantity = 0;

    if (createTransaction.receiver === investorId) {
      throw new BussinessError(ErrorMessage.sellYourself, 'sellYourself');
    }

    if (createTransaction.returnTokens && product.status !== Status.inactive) {
      throw new NotFoundError(ErrorMessage.notReturnTickets, 'notReturnTickets');
    }

    const holding = await this._holdingsCollection.findOne({ product: productId, investor: investorId });

    if (!holding) throw new NotFoundError(ErrorMessage.notHolding, 'notHolding');

    if (holding.nonCallPeriod &&  new Date(holding.nonCallPeriod) > new Date() && !createTransaction.returnTokens) {
      throw new NotFoundError(ErrorMessage.invalidNonCallPeriodExpired, 'invalidNonCallPeriodExpired');
    }

    const productTransactions = await this._transactionsCollection.find({ product: productId, investor: investorId, status: TransactionStatus.processing, type: TransactionType.SELL }).toArray();

    if (productTransactions.length) productTransactions.forEach(x => reservedQuantity += x.quantity!);

    if (holding.availableVolume * holding.ticketSize - holding.amountRepaid === 0) throw new BussinessError(ErrorMessage.notPossibleCreateSellTransaction, 'notPossibleCreateSellTransaction');

    if ((Number(holding.availableVolume) - (Number(quantity) + reservedQuantity)) * holding.ticketSize - holding.amountRepaid < 0) {
      throw new BussinessError(ErrorMessage.invalidMaximumAvailableAmount, 'invalidMaximumAvailableAmount');
    }

    const buyer = await this._userRepo.findById(createTransaction.receiver! || createTransaction.issuer!);

    const transaction = await this._repository.create({
      id: transactionId,
      ...createTransaction,
      ticketSize: product.ticketSize!,
      status: TransactionStatus.processing,
      createdAt: new Date(),
      quantity: createTransaction.quantity || holding.availableVolume
    });

    const complianceBody = {
      createTransaction,
      maturityDate,
      transactionId
    };

    await this._complianceRepo.create({
      id: uuidv4(),
      date: new Date().toISOString(),
      status: ComplianceStatus.Initiated,
      action: {
        entity: 'Transaction',
        entityName: product.name,
        id: product.id!,
        name: "SellTransaction",
        value: JSON.stringify(complianceBody),
        receiver: {
          id: buyer?.id!,
          role: buyer?.role! as Roles.investor | Roles.issuer,
          name: createReceiverName(buyer!)
        }
      },
      relatedUserId: createTransaction.investor as string,
      creator,
    });

    this._notificationsRepo.create({
      entityType: EntityType.PRODUCT,
      relatedEntityId: product.id!,
      text: `New Transaction Sell product ${ product.name }`,
      isCompliance: true,
      type: NotificationType.newTransactionSell,
      translationData: {
        productName: product.name
      }
    });

    return transaction;
  }

  private async createPaymentTransaction(createTransaction: CreateTransactionRequest, product: Product, creator: { type: Entities.user | Entities.admin; id: string }) {
    const { product: productId } = createTransaction;

    let investors = createTransaction.investors || [];

    investors = [...new Set(investors)];

    if (!investors || !investors?.length) {
      throw new BussinessError(ErrorMessage.notInvestor, 'notInvestor');
    }

    delete createTransaction.investors;

    let lastTransaction;
    let errorCreateTransaction = '';
    let errorCreateTransactionName = '';
    const countOfSoldTickets = product.quantity - (Number(product.availableVolume) || 0);
    const complianceBodyArray: ObjKeyValue[] = [];
    const complianceInvestors: ComplianceInvestors[] = [];

    const promises = investors.map(async(investorId) => {
      let amount: number = Number(createTransaction.amount) || 0;
      const dividendForOneTicket = amount / countOfSoldTickets;
      errorCreateTransaction = '';
      errorCreateTransactionName = '';
      const transactionId = uuidv4();
      const user = await this._userRepo.findById(investorId, false);

      const holding = await this._holdingsCollection.findOne({ product: productId, investor: investorId, availableVolume: { $gt: 0 } });

      if (!holding) throw new BussinessError(ErrorMessage.notHolding, 'notHolding');

      if (!user || !user.id) {
        if (investors.length === 1) {
          throw new BussinessError(ErrorMessage.notInvestor, 'notInvestor');
        } else {
          errorCreateTransaction = ErrorMessage.notInvestor;
          errorCreateTransactionName = 'notInvestor';
          return;
        }
      }

      if (createTransaction.paymentType === PaymentType.INTEREST && isInterestProduct(product)) {
        const dateQuarter = getDateQuarter();

        const interestTransactionQuarter = await this._transactionsCollection.findOne({
          status: { $in: [TransactionStatus.processing, TransactionStatus.processed] },
          paymentType: PaymentType.INTEREST,
          investor: investorId,
          product: productId,
          $and: [
            { createdAt: { $gte: dateQuarter.startFullQuarter } },
            { createdAt: { $lte: dateQuarter.endFullQuarter } },
          ]
        });

        if (interestTransactionQuarter) {
          errorCreateTransaction = ErrorMessage.isInterestTransactionQuarter;
          errorCreateTransactionName = 'isInterestTransactionQuarter';
          return;
        }

        amount = (holding.availableVolume * holding.ticketSize * (product.couponRate! / 100)) / getPaymentFrequency(product.paymentFrequency as PaymentFrequency);
      }

      if (createTransaction.paymentType === PaymentType.REPAYMENT && isInterestProduct(product)) {
        amount = (holding.availableVolume * holding.ticketSize) - (holding.amountRepaid || 0);

        const repaymentTransaction = await this._transactionsCollection.findOne({
          status: TransactionStatus.processing,
          paymentType: PaymentType.REPAYMENT,
          investor: investorId,
          product: productId
        });

        if (repaymentTransaction) {
          errorCreateTransaction = ErrorMessage.repaymentPendingApproval;
          errorCreateTransactionName = 'repaymentPendingApproval';
          return;
        }

        if (amount === 0) {
          await this._notificationsRepo.create({
            receiverId: holding.investor as string,
            entityType: EntityType.PRODUCT,
            relatedEntityId: product.id!,
            text: `The outstanding capital of the product ${product.name} is 0`,
            isCompliance: true,
            type: NotificationType.newTransactionPayment,
            translationData: {
              productName: product.name
            }
          });

          this._mailClient.sendEmail({ to: user.email, subject: 'Finally payment is processed', body: `You paid off the product ${product.name} in full` });
        }

        if (amount < 0) {
          errorCreateTransaction = ErrorMessage.repaymentAmountExceeds;
          errorCreateTransactionName = 'repaymentAmountExceeds';
          return;
        }
      }

      if ([PaymentType.DIVIDEND, PaymentType.GENERIC].includes(createTransaction.paymentType!)) {
        amount = holding.availableVolume * dividendForOneTicket;
      }

      amount = Math.round(amount * 100) / 100;

      if (amount <= 0) {
        return;
      }

      const createTransactionData = {
        ...createTransaction,
        amount,
        investor: investorId
      };

      complianceBodyArray.push({
        createTransaction: createTransactionData,
        transactionId,
        product,
      });

      complianceInvestors.push({
        id: user.id,
        fullName: getDisplayName(user),
        amount: Number(amount || 0)
      });

      lastTransaction = await this._repository.create({
        id: transactionId,
        ...createTransactionData,
        ticketSize: product.ticketSize!,
        status: TransactionStatus.processing,
        createdAt: new Date(),
      });

      this._notificationsRepo.create({
        entityType: EntityType.PRODUCT,
        relatedEntityId: product.id!,
        text: `New Transaction Payment product ${ product.name }`,
        isCompliance: true,
        type: NotificationType.newTransactionPayment,
        translationData: {
          productName: product.name
        }
      });
    });

    await Promise.all(promises);

    if (!lastTransaction && errorCreateTransaction) {
      throw new BussinessError(errorCreateTransaction, errorCreateTransactionName);
    }

    if (complianceBodyArray.length && complianceInvestors.length) {
      const complianceData: ComplianceLogItem = {
        id: uuidv4(),
        date: new Date().toISOString(),
        status: ComplianceStatus.Initiated,
        action: {
          entity: 'Transaction',
          entityName: product.name,
          id: product.id!,
          name: "PaymentTransaction",
          paymentType: createTransaction.paymentType,
          value: JSON.stringify(complianceBodyArray[0]),
        },
        relatedUserId: complianceInvestors[0].id,
        creator,
      };

      if (complianceInvestors.length > 1) {
        complianceData.action.name = 'PaymentTransactionArray';
        complianceData.action.investors = complianceInvestors;
        complianceData.action.value = JSON.stringify(complianceBodyArray);
        complianceData.relatedUserId = creator.id;
      }

      await this._complianceRepo.create(complianceData);
    }

    return lastTransaction;
  }
}