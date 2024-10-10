/* eslint-disable no-underscore-dangle */
import { GraphError } from '@microsoft/microsoft-graph-client';
import { generate } from 'generate-password';
import { Collection, Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { AdminChartData, AdminOverview, AdminOverviewRequest } from '../../../shared/types/admin';
import { AccountStatus, ComplianceStatus, Entities, PeriodType, Roles, Status } from '../../../shared/types/common';
import { Holding } from '../../../shared/types/holding';
import { ComplexInvestor, ComplexInvestorRequest, Investor, InvestorChartData, InvestorIntervalChartData, InvestorOverview, InvestorOverviewRequest, InvestorPortfolio, InvestorPortfolioRequest, InvestorsListRequest } from '../../../shared/types/investor';
import { ComplexIssuer, ComplexIssuerRequest, Issuer, IssuerOverview, IssuerOverviewRequest, IssuersListRequest } from '../../../shared/types/issuer';
import { EntityType, NotificationType } from '../../../shared/types/notification';
import { Product } from '../../../shared/types/product';
import { Pageable } from '../../../shared/types/response';
import { PaymentType, Transaction, TransactionStatus, TransactionType } from '../../../shared/types/transaction';
import { AssignRoleRequest, ChangeEmailRequest, getDisplayName, isAdmin, isInvestor, isIssuer, ChangePasswordRequest, ChangePhoneRequest, User } from '../../../shared/types/user';
import { CheckVerificationCodeRequest, GenerateVerificationCode, VerificationCode, VerificationCodeType } from '../../../shared/types/verification-code';
import { IGraphClient } from '../clients/GraphClient';
import { IMailClient } from '../clients/MailClient';
import config from '../config';
import { ErrorMessage } from '../constants/errorMessage';
import { IComplianceRepository } from '../domains/compliance';
import { INotificationRepository } from '../domains/notifications';
import { IUserRepository } from '../domains/users';
import BadRequestError from '../errors/BadRequestError';
import BussinessError from '../errors/BussinessError';
import CustomError from '../errors/CustomError';
import ForbiddenError from '../errors/ForbiddenError';
import NotFoundError from '../errors/NotFoundError';
import { calculateAmounts } from '../repositories/MongoUserRepository';
import { formatDate, getCountOfDatesForPeriod, getEmailFirstPart } from '../utils/fn';

export default class UserService {
  private _repository: IUserRepository;

  private _graphClient: IGraphClient;

  private _collection: Collection<User>;

  private _verificationCodeCollection: Collection<VerificationCode>;

  private _transactionsCollection: Collection<Transaction>;

  private _holdingsCollection: Collection<Holding>;

  private _productsCollection: Collection<Product>;

  private _complianceRepo: IComplianceRepository;

  private _notifyRepo: INotificationRepository;

  private _mailClient: IMailClient;

  constructor(repository: IUserRepository, complianceRepository: IComplianceRepository, notificationsRepository: INotificationRepository, mailClient: IMailClient, client: IGraphClient, pool: Db) {
    this._repository = repository;
    this._graphClient = client;
    this._collection = pool.collection<User>('users');
    this._verificationCodeCollection = pool.collection<VerificationCode>('verificationCodes');
    this._transactionsCollection = pool.collection<Transaction>('transactions');
    this._holdingsCollection = pool.collection<Holding>('holdings');
    this._productsCollection = pool.collection<Product>('products');
    this._complianceRepo = complianceRepository;
    this._notifyRepo = notificationsRepository;

    this._mailClient = mailClient;
  }

  getEntityName = (role?: Roles): Entities => {
    if (role === Roles.investor) return Entities.investor;
    if (role === Roles.issuer) return Entities.issuer;
    if (role === Roles.admin) return Entities.admin;
    return Entities.user;
  };

  calculateChartDataForInvestor = async (currentUser: User, query: InvestorOverviewRequest | InvestorPortfolioRequest, request: 'portfolio' | 'overview') => {
    const { periodType, from, to } = query;

    if (periodType === PeriodType.month) {

      const chartData: InvestorChartData[] = [];

      const transactionsByMonthsPipeline = [
        {
          $match: {
            $or: [
              {
                investor: currentUser.id
              },
              {
                type: TransactionType.SELL,
                receiver: currentUser.id
              }
            ],
            status: TransactionStatus.processed
          }
        },
        { $group: {
          _id: { $month: "$createdAt" },
          transactions: {
            $push: {
              receiver: '$receiver',
              type: '$type',
              paymentType: '$paymentType',
              quantity: '$quantity',
              ticketSize: '$ticketSize',
              amount: '$amount'
            }
          }
        } },
      ];

      const currentMonthIndex = new Date().getMonth();

      const transactionsByMonths = await this._transactionsCollection
        .aggregate<{
        _id: number,
        transactions: {
          receiver: string,
          type: TransactionType,
          paymentType: PaymentType,
          quantity: number,
          ticketSize: number,
          amount: number
        }[]
      }>(transactionsByMonthsPipeline).toArray();

      for (let i = 0; i <= currentMonthIndex; i++) {
        const transactionsForMonth = transactionsByMonths.find(y => y._id === i + 1);

        const period = i;
        const { totalOriginalAmount, totalAmountReceived } = calculateAmounts(transactionsForMonth?.transactions, currentUser.id!);

        chartData.push({ period, totalOriginalAmount, totalAmountReceived });
      }

      if (request === 'portfolio') return this._repository.getInvestorPortfolio(currentUser, chartData);

      if (request === 'overview') return this._repository.getInvestorOverview(currentUser, chartData);
    }

    if (periodType === PeriodType.interval) {

      const chartData: InvestorIntervalChartData[] = [];

      const transactionsForPeriodPipeline = [
        {
          $match: {
            $or: [
              {
                investor: currentUser.id
              },
              {
                type: TransactionType.SELL,
                receiver: currentUser.id
              }
            ],
            $and: [
              { createdAt: { $gte: new Date(from!) } },
              { createdAt: { $lte: new Date(new Date(to!).setDate(new Date(to!).getDate() + 1)) } },
            ],
            status: TransactionStatus.processed
          }
        },
        { $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: '$createdAt'
            },
          },
          transactions: {
            $push: {
              receiver: '$receiver',
              type: '$type',
              paymentType: '$paymentType',
              quantity: '$quantity',
              ticketSize: '$ticketSize',
              amount: '$amount'
            }
          }
        } },
      ];

      const transactionsPerDates = await this._transactionsCollection
        .aggregate<{
        _id: string,
        transactions: {
          receiver: string,
          type: TransactionType,
          paymentType: PaymentType,
          quantity?: number,
          ticketSize: number,
          amount?: number
        }[]
      }>(transactionsForPeriodPipeline).sort({ _id: 1 }).toArray();

      const countOfDays = getCountOfDatesForPeriod(from!, to!);

      // check and set the earliest date
      if (transactionsPerDates[0] && new Date(transactionsPerDates[0]._id).getTime() <= new Date(from!).getTime()) {

        const { totalOriginalAmount, totalAmountReceived } = calculateAmounts(transactionsPerDates[0].transactions, currentUser.id!);

        chartData.push({ date: formatDate(new Date(transactionsPerDates[0]._id)), totalAmountReceived, totalOriginalAmount });

      } else {

        // set 0 if first transaction processed later than start of the interval
        chartData.push({ date: formatDate(new Date(from!)), totalAmountReceived: 0, totalOriginalAmount: 0 });
      }

      // if we don't have transactions for the day - need to set date and zero values
      for (let i = 0; i < countOfDays; i++) {
        const lastDateInChart = chartData[chartData.length - 1] && new Date(chartData[chartData.length - 1].date);
        const currentDate = new Date(lastDateInChart.setDate(lastDateInChart.getDate() + 1));
        const transactionsForCurrentDate = transactionsPerDates.find(x => new Date(x._id).getTime() === currentDate.getTime());

        if (transactionsForCurrentDate) {
          const { totalOriginalAmount, totalAmountReceived } = calculateAmounts(transactionsForCurrentDate.transactions, currentUser.id!);

          chartData.push({ date: transactionsForCurrentDate!._id, totalAmountReceived, totalOriginalAmount });
        } else {
          chartData.push({ date: formatDate(currentDate), totalAmountReceived: 0, totalOriginalAmount: 0 });
        }
      }

      if (request === 'portfolio') return this._repository.getInvestorPortfolio(currentUser, chartData);

      if (request === 'overview') return this._repository.getInvestorOverview(currentUser, chartData);
    }

    throw new BadRequestError(ErrorMessage.invalidPeriodType, 'invalidPeriodType');
  };

  async createUser(data: User, currentUser: User): Promise<any> {
    let id = '';

    const mailNickname = getEmailFirstPart(data.email);

    const password = `${generate({ length: 10, numbers: true })}${Math.floor(Math.random() * 10)}`;

    const userPrincipalName = `${mailNickname}-${data.email.slice(data.email.indexOf('@') + 1)}@${config.OAUTH_TENANT_NAME}.onmicrosoft.com`;

    const user = {
      accountEnabled: false,
      displayName: getDisplayName(data, mailNickname),
      mailNickname: mailNickname,
      userPrincipalName,
      identities: [
        {
          signInType: 'emailAddress',
          issuer: `${config.OAUTH_TENANT_NAME}.onmicrosoft.com`,
          issuerAssignedId: data.email
        }
      ],
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: password
      }
    };

    try {
      const createdUser = await this._graphClient.createUser<User>(user);
      id = createdUser.id!;
    } catch (err) {
      const { message, statusCode } = err as GraphError;
      if (
        message ===
        'Another object with the same value for property userPrincipalName already exists.'
      )
        throw new BadRequestError(ErrorMessage.userPrincipalNameExist, 'userPrincipalNameExist');
      throw new CustomError({ message, name: 'GraphError', status: statusCode });
    }

    const freshUser = { id, ...data, status: AccountStatus.processing, createdAt: new Date() };
    await this._repository.create(freshUser);

    const createdUser = await this._repository.findById(id);

    let creatorId = id;
    let creatorDisplayName = getDisplayName(data, mailNickname);
    let creator: { type: Entities.admin | Entities.user, id: string } = { type: Entities.user, id: creatorId };

    if (currentUser && isAdmin(currentUser)) {
      creatorDisplayName = getDisplayName(currentUser);
      creatorId = currentUser.id!;
      creator = { type: Entities.admin, id: creatorId };
    }

    await this._complianceRepo.create({
      date: new Date().toISOString(),
      status: ComplianceStatus.Initiated,
      id: uuidv4(),
      action: {
        entity: this.getEntityName(data.role),
        entityName: creatorDisplayName,
        id: creatorId,
        name: "AddUser",
      },
      relatedUserId: freshUser.id,
      creator
    });

    this._notifyRepo.create({
      entityType: freshUser.role as unknown as EntityType,
      relatedEntityId: freshUser.id!,
      text: `New ${freshUser.role || 'user'} ${getDisplayName(freshUser)}`,
      isCompliance: true,
      type: NotificationType.addUser,
      translationData: {
        fullName: getDisplayName(freshUser),
        userRole: freshUser.role || 'user'
      }
    });

    this._mailClient.sendEmail({
      to: freshUser.email,
      subject: 'Signup',
      body: this._mailClient.signupTemplate({
        fullName: getDisplayName(freshUser)
      })
    });

    return createdUser!;
  }

  async changeEmail(user: User, data: ChangeEmailRequest) {
    if (!user.id) {
      throw new ForbiddenError(ErrorMessage.notUser, 'notUser');
    }

    const emailIsExists = await this._collection.findOne({ email: data.email });

    if (emailIsExists) throw new BadRequestError(ErrorMessage.emailExist, 'emailExist');

    await this.generateAndSendVerificationCode(user, {
      userId: user.id,
      type: VerificationCodeType.EMAIL,
      value: data.email,
    });
    
    return;
  }

  async сhangePhone(user: User, data: ChangePhoneRequest) {
    if (!user.id) {
      throw new ForbiddenError(ErrorMessage.notUser, 'notUser');
    }

    const type = VerificationCodeType.PHONE;
    const code = await this.generateAndSendVerificationCode(user, {
      userId: user.id,
      type,
      value: data.phone,
    });
    
    return this.checkVerificationCode(user, { code, type });
  }

  async changePassword(user: User, data: ChangePasswordRequest) {
    if (!user.id) {
      throw new ForbiddenError(ErrorMessage.notUser, 'notUser');
    }

    await this.generateAndSendVerificationCode(user, {
      userId: user.id,
      type: VerificationCodeType.PASSWORD,
      value: data.newPassword,
    });
    
    return;
  }

  async updateUser(id: string, data: Partial<User>, currentUser: User): Promise<User> {
    const user = await this._repository.findById(id);
    let emailIsExists = false;

    if (!user) throw new NotFoundError(ErrorMessage.notUser, 'notUser');
    if (!isAdmin(currentUser) && user.id !== currentUser.id) {
      throw new ForbiddenError(ErrorMessage.notPermission, 'notPermission');
    }

    if (data.email && data.email !== user.email) {
      const userWithSameEmail = await this._repository.findByEmail(data.email);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      userWithSameEmail && userWithSameEmail.id !== id  && (emailIsExists = true);
    }

    if (emailIsExists) throw new BadRequestError(ErrorMessage.emailExist, 'emailExist');

    data.id = id;

    let creatorId = id;
    let creatorDisplayName = getDisplayName(user);
    let creator: { type: Entities.admin | Entities.user, id: string } = { type: Entities.user, id: creatorId };

    if (isAdmin(currentUser)) {
      creatorDisplayName = getDisplayName(currentUser);
      creatorId = currentUser.id!;
      creator = { type: Entities.admin, id: creatorId };
    }

    await this._complianceRepo.create({
      date: new Date().toISOString(),
      status: ComplianceStatus.Initiated,
      id: uuidv4(),
      action: {
        entity: this.getEntityName(user.role),
        entityName: creatorDisplayName,
        id: creatorId,
        name: "UpdateUser",
        value: JSON.stringify(data),
      },
      relatedUserId: id,
      creator
    });

    this._notifyRepo.create({
      entityType: user.role as unknown as EntityType,
      relatedEntityId: user.id!,
      text: `Update ${user.role || 'user'} ${getDisplayName(user)}`,
      isCompliance: true,
      type: NotificationType.updateUser,
      translationData: {
        fullName: getDisplayName(user),
        userRole: user.role || 'user'
      }
    });

    return user;
  }

  async getInvestorOverview(query: InvestorOverviewRequest, user: User): Promise<InvestorOverview> {
    return this.calculateChartDataForInvestor(user, query, 'overview') as Promise<InvestorOverview>;
  }

  async getInvestorsList(query: InvestorsListRequest): Promise<Pageable<Investor>> {
    return this._repository.getInvestorsList({ ...query });
  }

  async getComplexInvestor(query: ComplexInvestorRequest): Promise<ComplexInvestor> {
    return this._repository.getComplexInvestor(query);
  }

  async getInvestorPortfolio(query: InvestorPortfolioRequest, user: User): Promise<InvestorPortfolio> {
    return this.calculateChartDataForInvestor(user, query, 'portfolio') as Promise<InvestorPortfolio>;
  }

  async getIssuersList(query: IssuersListRequest): Promise<Pageable<Issuer>> {
    return this._repository.getIssuersList(query);
  }

  async getIssuerOverview(query: IssuerOverviewRequest, user: User): Promise<IssuerOverview> {
    return this._repository.getIssuerOverview(query, user);
  }

  async getComplexIssuer(query: ComplexIssuerRequest): Promise<ComplexIssuer> {
    return this._repository.getComplexIssuer(query);
  }

  async getAdminOverview(query: AdminOverviewRequest): Promise<AdminOverview> {

    const { periodType } = query;

    const transactionsByMonthsPipeline = [
      {
        $match: {
          status: {
            $in: [TransactionStatus.processing, TransactionStatus.processed]
          }
        }
      },
      { $group: {
        _id: { $month: "$createdAt" },
        transactions: {
          $push: {
            status: '$status',
            type: '$type',
            quantity: '$quantity',
            ticketSize: '$ticketSize',
            amount: '$amount'
          }
        }
      } },
    ];

    let chartData: AdminChartData = [];

    if (periodType === PeriodType.month) {
      const currentMonthIndex = new Date().getMonth();
      const transactionsByMonths = await this._transactionsCollection.aggregate<{
        _id: number,
        transactions: {
          status: TransactionStatus,
          type: TransactionType,
          quantity: number,
          ticketSize: number,
          amount: number
        }[] }>(transactionsByMonthsPipeline).toArray();


      for (let i = 0; i <= currentMonthIndex; i++) {
        const transactionsForMonth = transactionsByMonths.find(y => y._id === i + 1);

        const period = i;
        let buyVolume = 0;
        let sellVolume = 0;
        let paymentVolume = 0;
        let processingVolume = 0;

        if (transactionsForMonth) {
          transactionsForMonth.transactions.forEach(x => {
            if (x.type === TransactionType.BUY && x.status === TransactionStatus.processed && x.quantity) buyVolume += (x.quantity * x.ticketSize);
            if (x.type === TransactionType.SELL && x.status === TransactionStatus.processed && x.quantity) sellVolume += (x.quantity * x.ticketSize);
            if (x.type !== TransactionType.PAYMENT && x.status === TransactionStatus.processing && x.quantity) processingVolume += (x.quantity * x.ticketSize);
            if (x.type === TransactionType.PAYMENT && x.status === TransactionStatus.processing) processingVolume += x.amount;
            if (x.type === TransactionType.PAYMENT && x.status !== TransactionStatus.processing) paymentVolume += x.amount;
          });
        }

        chartData.push({ period, buyVolume, sellVolume, paymentVolume, processingVolume });
      }
    }

    return this._repository.getAdminOverview(query, chartData as AdminOverview['chartData']);
  }

  async getUser(id: string): Promise<User | null> {
    const user = await this._repository.findById(id);

    return user;
  }

  async requestDeactivate(user: User): Promise<void> {
    if (isInvestor(user)) {
      const holdings = await this._holdingsCollection.find({ investor: user.id, availableVolume: { $gt: 0 } }).toArray();
      if (holdings.length) throw new BussinessError(ErrorMessage.notPossibleDeactivationInvestor, 'notPossibleDeactivationInvestor');
    }

    if (isIssuer(user)) {
      const products = await this._productsCollection.find({ issuer: user.id, status: Status.active }).toArray();
      if (products.length) throw new BussinessError(ErrorMessage.notPossibleDeactivationIssuer, 'notPossibleDeactivationIssuer');
    }

    const emails = await this._repository.getEmailsAdmin();

    if (emails.length > 0) {
      const subject = `${getDisplayName(user, 'User')} deactivate account`;
      const body = `
        ${getDisplayName(user, 'User')} requested to deactivate his account
      `;

      this._mailClient.sendEmail({
        to: emails,
        subject,
        body
      });
    }

    this._notifyRepo.create({
      id: uuidv4(),
      entityType: user.role === Roles.investor ? EntityType.INVESTOR : EntityType.ISSUER,
      relatedEntityId: user.id!,
      text: `${user.role || 'User'} ${getDisplayName(user)} requested to deactivate his account`,
      isRead: false,
      createdAt: new Date(),
      type: NotificationType.requestDeactivateUser,
      translationData: {
        fullName: getDisplayName(user),
        userRole: user.role || 'User'
      }
    });
  }

  async deactivateUser(id: string, currentUser: User) {
    const user = await this._repository.findById(id);
    if (!user) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

    if ((isInvestor(user) || isIssuer(user)) && user.status === AccountStatus.inactive) {
      throw new NotFoundError(ErrorMessage.isAccountDeactivated, 'isAccountDeactivated');
    }

    if (user.isRequestDeactivate) {
      throw new NotFoundError(ErrorMessage.alreadySentWaitDecision, 'alreadySentWaitDecision');
    }

    if (isInvestor(user)) {
      const holdings = await this._holdingsCollection.find({ investor: user.id, availableVolume: { $gt: 0 } }).toArray();
      if (holdings.length) throw new BussinessError(ErrorMessage.notPossibleDeactivationInvestor, 'notPossibleDeactivationInvestor');
    }

    if (isIssuer(user)) {
      const products = await this._productsCollection.find({ issuer: user.id, status: Status.active }).toArray();
      if (products.length) throw new BussinessError(ErrorMessage.notPossibleDeactivationIssuer, 'notPossibleDeactivationIssuer');
    }

    const complianceBody = {
      userId: id,
    };

    let creatorId = id;
    let creatorDisplayName = getDisplayName(user);
    let creator: { type: Entities.admin | Entities.user, id: string } = { type: Entities.user, id: creatorId };

    if (currentUser && isAdmin(currentUser)) {
      creatorDisplayName = getDisplayName(currentUser);
      creatorId = currentUser.id!;
      creator = { type: Entities.admin, id: creatorId };
    }

    if (isInvestor(user) || isIssuer(user)) {
      await this._complianceRepo.create({
        id: uuidv4(),
        date: new Date().toISOString(),
        status: ComplianceStatus.Initiated,
        action: {
          entity: this.getEntityName(user.role),
          entityName: creatorDisplayName,
          id: creatorId,
          name: "DeactivateUser",
          value: JSON.stringify(complianceBody),
        },
        relatedUserId: id,
        creator
      });

      this._notifyRepo.create({
        entityType: user.role as unknown as EntityType,
        relatedEntityId: user.id!,
        text: `Deactivate ${user.role || 'user'} ${getDisplayName(user)}`,
        isCompliance: true,
        type: NotificationType.deactivateUser,
        translationData: {
          fullName: getDisplayName(user),
          userRole: user.role || 'user'
        }
      });

      await this._repository.updateById(id, { isRequestDeactivate: true });

      return user;
    }

    throw new BussinessError(ErrorMessage.invalidUserType, 'invalidUserType');
  }

  async deleteUser(id: string, currentUser: User): Promise<void> {
    const user = await this._collection.findOne({ id });

    if (!user) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

    if (!isInvestor(user) && !isIssuer(user)) {
      throw new NotFoundError(ErrorMessage.invalidUserType, 'invalidUserType');
    }

    const complianceBody = {
      userId: id,
    };

    let creatorId = id;
    let creatorDisplayName = getDisplayName(user);
    let creator: { type: Entities.admin | Entities.user, id: string } = { type: Entities.user, id: creatorId };

    if (currentUser && isAdmin(currentUser)) {
      creatorDisplayName = getDisplayName(currentUser);
      creatorId = currentUser.id!;
      creator = { type: Entities.admin, id: creatorId };
    }

    await this._complianceRepo.create({
      id: uuidv4(),
      date: new Date().toISOString(),
      status: ComplianceStatus.Initiated,
      action: {
        entity: this.getEntityName(user.role),
        entityName: creatorDisplayName,
        id: creatorId,
        name: "DeleteUser",
        value: JSON.stringify(complianceBody),
      },
      relatedUserId: id,
      creator
    });

    this._notifyRepo.create({
      entityType: user.role as unknown as EntityType,
      relatedEntityId: user.id!,
      text: `Delete ${user.role || 'user'} ${getDisplayName(user)}`,
      isCompliance: true,
      type: NotificationType.deleteUser,
      translationData: {
        fullName: getDisplayName(user),
        userRole: user.role
      }
    });
  }

  async assignRole(data: AssignRoleRequest): Promise<User> {
    console.log(data);

    return {} as Promise<User>;
  }

  private async updatePhone(user: User, newPhone: string) {
    await this._repository.updateById(user.id, { phone: newPhone });
  }

  private async updatePassword(user: User, newPassword: string) {
    const userData = {
      passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: newPassword
      }
    };

    try {
      await this._graphClient.updateUser(user.id!, userData);
    } catch (err) {
      const { message, statusCode } = err as GraphError;
      throw new CustomError({ message, name: 'GraphError', status: statusCode });
    }
  }

  private async updateEmail(user: User, newEmail: string) {
    const mailNickname = getEmailFirstPart(newEmail);

    const userPrincipalName = `${mailNickname}-${newEmail.slice(newEmail.indexOf('@') + 1)}@${config.OAUTH_TENANT_NAME}.onmicrosoft.com`;

    const userData = {
      accountEnabled: true,
      displayName: getDisplayName(user, mailNickname),
      mailNickname: mailNickname,
      userPrincipalName,
      identities: [
        {
          signInType: 'emailAddress',
          issuer: `${config.OAUTH_TENANT_NAME}.onmicrosoft.com`,
          issuerAssignedId: newEmail
        }
      ],
    };

    try {
      await this._graphClient.updateUser(user.id!, userData);
      await this._repository.updateById(user.id, { email: newEmail });
    } catch (err) {
      const { message, statusCode } = err as GraphError;
      throw new CustomError({ message, name: 'GraphError', status: statusCode });
    }
  }

  private async generateAndSendVerificationCode(user: User, { type, userId, value }: GenerateVerificationCode): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString().substring(0,4);
    
    await this._verificationCodeCollection.deleteMany({
      userId,
      type,
    });

    await this._verificationCodeCollection.insertOne({
      userId,
      type,
      code,
      value
    });

    if (type !== VerificationCodeType.PHONE) {
      this._mailClient.sendEmail({
        to: type === VerificationCodeType.EMAIL ? value : user.email,
        subject: 'Verification Code',
        body: `
          <p><b>Your code is: ${code}</b></p>
        `
      });
    }

    return code;
  }

  async checkVerificationCode(user: User, { code, type }: CheckVerificationCodeRequest) {
    const verification = await this._verificationCodeCollection.findOne({
      userId: user.id,
      type,
      code,
    });

    if (!verification) {
      throw new BadRequestError(ErrorMessage.wrongData, 'wrongData');
    }

    await this._verificationCodeCollection.deleteOne({
      _id: verification._id
    });

    switch (verification.type) {
      case VerificationCodeType.PHONE:
        return await this.updatePhone(user, verification.value);
      case VerificationCodeType.PASSWORD:
        return await this.updatePassword(user, verification.value);
      case VerificationCodeType.EMAIL:
        return await this.updateEmail(user, verification.value);
    }

    throw new BadRequestError(ErrorMessage.wrongData, 'wrongData');
  }
}
