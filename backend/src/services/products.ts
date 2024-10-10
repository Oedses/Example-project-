/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from 'uuid';
import { IProductRepository } from '../domains/products';
import { ComplexProduct, GetProductRequest, InterestProduct, isInterestProduct, Product, ProductsListRequest, RequestBuy } from '../../../shared/types/product';
import { Pageable } from '../../../shared/types/response';
import { ComplianceStatus, Entities, Status } from '../../../shared/types/common';
import { IComplianceRepository } from "../domains/compliance";
import { IUserRepository } from '../domains/users';
import { getDisplayName, isAdmin, User } from '../../../shared/types/user';
import BadRequestError from '../errors/BadRequestError';
import { INotificationRepository } from '../domains/notifications';
import { EntityType, NotificationType } from '../../../shared/types/notification';
import BussinessError from '../errors/BussinessError';
import { IMailClient } from '../clients/MailClient';
import { ErrorMessage } from '../constants/errorMessage';
import NotFoundError from '../errors/NotFoundError';
import { Collection, Db } from 'mongodb';
import { CreateTransactionRequest, Transaction, TransactionStatus } from '../../../shared/types/transaction';

export default class ProductService {
  private _repository: IProductRepository;

  private _complianceRepo: IComplianceRepository;

  private _userRepo: IUserRepository;

  private _notificationsRepo: INotificationRepository;

  private _mailClient: IMailClient;

  private _transactionsCollection: Collection<Transaction | CreateTransactionRequest>;

  constructor(repository: IProductRepository, complianceRepo: IComplianceRepository, userRepo: IUserRepository, notificationsRepo: INotificationRepository, mailClient: IMailClient, pool: Db) {
    this._repository = repository;
    this._complianceRepo = complianceRepo;
    this._userRepo = userRepo;
    this._notificationsRepo = notificationsRepo;
    this._mailClient = mailClient;
    this._transactionsCollection = pool.collection('transactions');
  }

  isValidNonCallPeriod = (createProduct: InterestProduct) => {
    let nonCallPeriod = 0;
    let maturity = 0;

    if (createProduct.maturityUnit === 'years') maturity = createProduct.maturity! * 12;
    else maturity = createProduct.maturity!;

    if (createProduct.nonCallPeriodUnit === 'years') nonCallPeriod = createProduct.nonCallPeriod! * 12;
    else nonCallPeriod = createProduct.nonCallPeriod!;

    if (nonCallPeriod > maturity) return false;

    return true;
  };

  async createProduct(
    createProduct: Product, userId: string
  ): Promise<Product | null> {
    const id = uuidv4();

    if (isInterestProduct(createProduct)){
      const isValid = this.isValidNonCallPeriod(createProduct);

      if (!isValid) throw new BussinessError(ErrorMessage.invalidNonCallPeriod, 'invalidNonCallPeriod');
    }

    const user = await this._userRepo.findById(userId);

    const productWithSameName = await this._repository.collection.findOne({ name: { $regex: `^${createProduct.name}$`, $options: 'i' } });

    if (productWithSameName) throw new BadRequestError(ErrorMessage.productNameExists, 'productNameExists');

    const creator: { type: Entities.admin | Entities.user, id: string } = isAdmin(user) ? { type: Entities.admin, id: userId } : { type: Entities.user, id: userId };

    const complianceBody = {
      userId: createProduct.issuer,
      productId: id,
      initialAmount: createProduct.quantity,
      name: createProduct.name,
      symbol: createProduct.name
    };

    await this._complianceRepo.create({
      id: uuidv4(),
      date: new Date().toISOString(),
      status: ComplianceStatus.Initiated,
      action: {
        entity: "Product",
        entityName: createProduct.name,
        id,
        name: "AddProduct",
        value: JSON.stringify(complianceBody),
      },
      relatedUserId: createProduct.issuer.toString(),
      creator
    });

    this._notificationsRepo.create({
      entityType: EntityType.PRODUCT,
      relatedEntityId: id,
      text: `New product ${ createProduct.name }`,
      isCompliance: true,
      type: NotificationType.newProduct,
      translationData: {
        productName: createProduct.name
      }
    });

    return this._repository.create({ id, ...createProduct, availableVolume: createProduct.quantity, status: Status.processing, createdAt: new Date() });
  }

  async updateProduct(
    product: Product
  ): Promise<Product | null> {

    return this._repository.updateById(product.id, product);
  }

  getProductById(query: GetProductRequest, user: User): Promise<ComplexProduct> {
    return this._repository.getProductById(query, user);
  }

  getProductsList(query: ProductsListRequest, user: User): Promise<Pageable<Product>> {
    return this._repository.getProductsList(query, user);
  }

  requestBuy(data: RequestBuy) {
    const { product, investor, amount } = data;

    this._notificationsRepo.create({
      entityType: EntityType.PRODUCT,
      relatedEntityId: product.id,
      text: `Investor ${ investor.name } wants to buy the product ${ product.name } for ${amount}`,
      isRead: false,
      createdAt: new Date(),
      type: NotificationType.requestBuy,
      translationData: {
        productName: product.name,
        fullName: investor.name,
        amount,
      }
    });
  }

  async requestDelist(productId: string) {
    const adminsEmails = await this._userRepo.getEmailsAdmin();

    if (!adminsEmails.length) return;

    const product = await this._repository.findById(productId);
    const issuer = await this._userRepo.findById(product.issuer as string);

    this._notificationsRepo.create({
      entityType: EntityType.PRODUCT,
      relatedEntityId: product.id!,
      text: `Issuer ${ getDisplayName(issuer!, '') } wants to delist the product ${ product.name }`,
      isRead: false,
      createdAt: new Date(),
      type: NotificationType.requestDelistProduct,
      translationData: {
        productName: product.name,
        fullName: getDisplayName(issuer!, ''),
        userRole: issuer?.role
      }
    });

    this._mailClient.sendEmail({
      to: adminsEmails,
      subject: 'Request for delist product',
      body: `Issuer ${ getDisplayName(issuer!, '') } wants to delist the product ${ product.name }`,
    });
  }

  async deactivateProduct(productId: string, currentUser: User) {
    const product = await this._repository.findById(productId);

    if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

    if (product.status === Status.inactive) {
      throw new NotFoundError(ErrorMessage.isProductDeactivated, 'isProductDeactivated');
    }

    if (product.isRequestDeactivate) {
      throw new NotFoundError(ErrorMessage.alreadySentWaitDecision, 'alreadySentWaitDecision');
    }

    const transaction = await this._transactionsCollection.findOne({
      product: product.id,
      status: TransactionStatus.processing
    });

    if (transaction) throw new NotFoundError(ErrorMessage.notProductDeactivation, 'notProductDeactivation');

    const creator: { type: Entities.admin | Entities.user, id: string } = isAdmin(currentUser) ? { type: Entities.admin, id: currentUser.id! } : { type: Entities.user, id: currentUser.id! };

    const complianceBody = {
      userId: currentUser.id,
      product,
    };

    await this._complianceRepo.create({
      id: uuidv4(),
      date: new Date().toISOString(),
      status: ComplianceStatus.Initiated,
      action: {
        entity: "Product",
        entityName: product.name,
        id: product.id!,
        name: "DeactivateProduct",
        value: JSON.stringify(complianceBody),
      },
      relatedUserId: product.issuer.toString(),
      creator
    });

    await this._notificationsRepo.create({
      entityType: EntityType.PRODUCT,
      relatedEntityId: product.id!,
      isCompliance: true,
      text: `Deactivate product ${ product.name }`,
      isRead: false,
      createdAt: new Date(),
      type: NotificationType.deactivateProduct,
      translationData: {
        productName: product.name,
      }
    });

    await this._repository.updateById(productId, { isRequestDeactivate: true });
  }
}
