/* eslint-disable no-underscore-dangle */

import { ComplianceListRequest, PaymentTransactionAction, RejectComplianceRequest } from '../../../shared/types/compliance';
import { IComplianceRepository } from '../domains/compliance';
import { AccountStatus, ComplianceLogItem, ComplianceStatus, Status } from "../../../shared/types/common";
import { IMailClient } from "../clients/MailClient";
import { IGraphClient } from "../clients/GraphClient";
import { generate } from "generate-password";
import { getEmailFirstPart, getProductNonCallPeriod } from "../utils/fn";
import NotFoundError from '../errors/NotFoundError';
import { IProductRepository } from '../domains/products';
import axios from 'axios';
import config from '../config';
import { Collection, Db } from 'mongodb';
import { Holding } from '../../../shared/types/holding';
import { Product } from '../../../shared/types/product';
import { v4 as uuidv4 } from 'uuid';
import { EntityType, Notification, NotificationType } from "../../../shared/types/notification";
import BussinessError from '../errors/BussinessError';
import { IUserRepository } from '../domains/users';
import { getDisplayName, isIssuer, User } from '../../../shared/types/user';
import { PaymentType, Transaction, TransactionStatus } from '../../../shared/types/transaction';
import BlockChainError from '../errors/BlockChainError';
import BadRequestError from '../errors/BadRequestError';
import { ErrorMessage } from '../constants/errorMessage';

export default class ComplianceService {
  private _complianceRepository: IComplianceRepository;

  private _userRepository: IUserRepository;

  private _productRepository: IProductRepository;

  private _mailClient: IMailClient;

  private _graphClient: IGraphClient;

  private _holdingsCollection: Collection<Holding>;

  private _productsCollection: Collection<Product>;

  private _notificationsCollection: Collection<Notification>;

  private _transactionsCollection: Collection<Transaction>;

  constructor(complianceRepository: IComplianceRepository, userRepository: IUserRepository, productRepository: IProductRepository, mailClient: IMailClient, graphClient: IGraphClient, pool: Db) {
    this._complianceRepository = complianceRepository;
    this._userRepository = userRepository;
    this._productRepository = productRepository;
    this._mailClient = mailClient;
    this._graphClient = graphClient;
    this._holdingsCollection = pool.collection("holdings");
    this._productsCollection = pool.collection("products");
    this._notificationsCollection = pool.collection("notifications");
    this._transactionsCollection = pool.collection("transactions");
  }

  async rejectCompliance(id: ComplianceLogItem["id"], body: RejectComplianceRequest, user: User) {
    const compliance = await this._complianceRepository.findOneById(id);
    if (!compliance) throw new NotFoundError(ErrorMessage.notCompliance, 'notCompliance');
    if (compliance.creator.id === user.id) throw new BussinessError(ErrorMessage.notComplianceReject, 'notComplianceReject');
    if (compliance.status !== ComplianceStatus.Initiated) throw new NotFoundError(ErrorMessage.complianceResolved, 'complianceResolved');

    compliance.remarks = body.reason;

    return this.switchCompliance(compliance, true);
  }

  async approveCompliance(id: ComplianceLogItem["id"], user: User) {
    const compliance = await this._complianceRepository.findOneById(id);
    if (!compliance) throw new NotFoundError(ErrorMessage.notCompliance, 'notCompliance');
    if (compliance.creator.id === user.id) throw new BussinessError(ErrorMessage.notComplianceReject, 'notComplianceReject');
    if (compliance.status !== ComplianceStatus.Initiated) throw new NotFoundError(ErrorMessage.complianceResolved, 'complianceResolved');

    return this.switchCompliance(compliance);
  }

  private async switchCompliance(compliance: ComplianceLogItem, reject: boolean = false) {
    switch (compliance.action.name) {
      case 'AddUser':
        await this.doAddUser(compliance, reject);
        break;
      case 'AddProduct':
        await this.doAddProduct(compliance, reject);
        break;
      case 'BuyTransaction':
        await this.doTransactionBuy(compliance, reject);
        break;
      case 'SellTransaction':
        await this.doTransactionSell(compliance, reject);
        break;
      case 'PaymentTransaction':
        await this.doPaymentTransaction(compliance, reject);
        break;
      case 'PaymentTransactionArray':
        await this.doPaymentTransactionArray(compliance, reject);
        break;
      case 'DeactivateUser':
        await this.doDeactivateUser(compliance, reject);
        break;
      case 'UpdateUser':
        await this.updateUser(compliance, reject);
        break;
      case 'DeleteUser':
        await this.deleteUser(compliance, reject);
        break;
      case 'DeactivateProduct':
        await this.doDeactivateProduct(compliance, reject);
        break;

      default:
        throw new BadRequestError(ErrorMessage.invalidComplianceAction, 'invalidComplianceAction');
    }
  }

  private async doDeactivateUser(compliance: ComplianceLogItem, reject: boolean = false) {
    const { userId } = JSON.parse(compliance.action.value!);

    const user = await this._userRepository.findById(userId);

    if (!reject) {
      if (!user) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

      await this._userRepository.updateById(user.id, {
        status: AccountStatus.inactive,
        isRequestDeactivate: false
      });

      const body = {
        accountEnabled: false,
      };

      await this._graphClient.updateUser(user.id!, body);

      this._notificationsCollection.insertOne({
        id: uuidv4(),
        entityType: user.role as unknown as EntityType,
        relatedEntityId: user.id!,
        text: `The ${ user.role } ${getDisplayName(user, '')} is deactivated`,
        createdAt: new Date(),
        isRead: false,
        type: NotificationType.approveDeactivateUser,
        translationData: {
          fullName: getDisplayName(user, ''),
          userRole: user.role
        }
      });

      compliance.status = ComplianceStatus.Accepted;
      await this._complianceRepository.update(compliance);

      this._mailClient.sendEmail({
        to: user.email,
        subject: 'Account deactivated',
        body: 'Your account has been deactivated'
      });
    } else {
      compliance.status = ComplianceStatus.Rejected;
      await this._complianceRepository.update(compliance);
      await this._userRepository.updateById(user?.id, {
        isRequestDeactivate: false
      });

      if (compliance.remarks && user) {
        this._notificationsCollection.insertMany([
          {
            id: uuidv4(),
            entityType: user.role as unknown as EntityType,
            relatedEntityId: user.id!,
            text: `The account deactivated request for the ${ user.role } ${getDisplayName(user, 'user')} was denied.`,
            receiverId: compliance.creator.id,
            createdAt: new Date(),
            isRead: false,
            type: NotificationType.rejectDeactivateUserAdmin,
            translationData: {
              userRole: user.role,
              fullName: getDisplayName(user, '')
            }
          },
          {
            id: uuidv4(),
            entityType: user.role as unknown as EntityType,
            relatedEntityId: user.id!,
            text: `The account deactivated request for the was denied.`,
            receiverId: user.id,
            createdAt: new Date(),
            isRead: false,
            type: NotificationType.rejectDeactivateUser,
            translationData: {
              userRole: user.role,
              fullName: getDisplayName(user, '')
            }
          },
        ]);

        this._mailClient.sendEmail({
          to: user.email,
          subject: 'Account deactivated',
          body: compliance.remarks
        });
      }
    }
  }

  private async doDeactivateProduct(compliance: ComplianceLogItem, reject: boolean = false) {
    const product = JSON.parse(compliance.action.value!).product as Product;
    const { userId } = JSON.parse(compliance.action.value!);
    const user = await this._userRepository.findById(userId);

    if (!user) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

    if (!reject) {
      if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

      this._notificationsCollection.insertOne({
        id: uuidv4(),
        receiverId: product.issuer as string,
        entityType: EntityType.PRODUCT,
        relatedEntityId: product.id!,
        text: `The product ${ product.name } is deactivated.`,
        createdAt: new Date(),
        isRead: false,
        type: NotificationType.approveDeactivateProductIssuer,
        translationData: {
          productName: product.name,
        }
      });

      // if issuer has all tokens - burn them
      let transactionHash = '';
      if (product.quantity === product.availableVolume) {
        try {
          const { data: { transactionHash: blockchainTransactionHash } } = await axios.post(
            `${config.BLOCKCHAIN_URL}/api/products/${product.id}/burn`,
            { userId: user.id, amount: product.quantity }
          );
          if (blockchainTransactionHash) transactionHash = blockchainTransactionHash;
        } catch (e: any) {
          throw new BlockChainError(e.message);
        }
      } else {
        const holdings = await this._holdingsCollection.find({ product: product.id, availableVolume: { $ne: 0 } }).toArray();
        const investorsIds = holdings.map(x => x.investor as string);

        const investors = await this._userRepository.find({ id: { $in: investorsIds } });

        const textMessage = `Dear investor, the ${product.name} will be delisted. You will be contacted by one of tokyo Capitals' agents soon.`;

        investors.forEach(x => {
          this._notificationsCollection.insertOne({
            id: uuidv4(),
            receiverId: x.id,
            entityType: EntityType.PRODUCT,
            relatedEntityId: product.id!,
            text: textMessage,
            createdAt: new Date(),
            isRead: false,
            type: NotificationType.approveDeactivateProductInvestor,
            translationData: {
              productName: product.name,
            }
          });

          this._mailClient.sendEmail({
            to: x.email,
            subject: 'Delist on of your products',
            body: textMessage
          });
        });

      }

      await this._productRepository.updateById(product.id, {
        status: Status.inactive,
        isRequestDeactivate: false
      });

      compliance.status = ComplianceStatus.Accepted;
      compliance.transactionHash = transactionHash;
      await this._complianceRepository.update(compliance);
    } else {
      await this._productRepository.updateById(product.id, { isRequestDeactivate: false });
      compliance.status = ComplianceStatus.Rejected;
      await this._complianceRepository.update(compliance);

      this._notificationsCollection.insertOne({
        id: uuidv4(),
        receiverId: product.issuer as string,
        entityType: EntityType.PRODUCT,
        relatedEntityId: product.id!,
        text: `The product deactivation for ${ product.name } was denied.`,
        createdAt: new Date(),
        isRead: false,
        type: NotificationType.rejectDeactivateProductIssuer,
        translationData: {
          productName: product.name,
        }
      });
    }
  }

  private async deleteUser(compliance: ComplianceLogItem, reject: boolean = false) {
    const { userId } = JSON.parse(compliance.action.value!);

    const user = await this._userRepository.findById(userId);

    if (!reject) {
      if (!user) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

      try {
        await this._graphClient.deleteUser(user.id!);
      } catch (err) {
        throw new NotFoundError(ErrorMessage.notUserDeleted, 'notUserDeleted');
      }

      await this._userRepository.userDelete(user.id!);

      compliance.status = ComplianceStatus.Accepted;
      await this._complianceRepository.update(compliance);

      this._notificationsCollection.insertOne({
        id: uuidv4(),
        entityType: user.role as unknown as EntityType,
        relatedEntityId: user.id!,
        text: `The ${ user.role } ${getDisplayName(user, 'user')} is deleted`,
        createdAt: new Date(),
        isRead: false,
        type: NotificationType.approveDeleteUser,
        translationData: {
          userRole: user.role,
          fullName: getDisplayName(user, 'user'),
        }
      });
    } else {
      compliance.status = ComplianceStatus.Rejected;
      await this._complianceRepository.update(compliance);

      if (compliance.remarks && user) {
        this._notificationsCollection.insertOne({
          id: uuidv4(),
          entityType: user.role as unknown as EntityType,
          relatedEntityId: user.id!,
          text: `The deletion request for the ${ user.role } ${getDisplayName(user, 'user')} was denied.`,
          createdAt: new Date(),
          isRead: false,
          type: NotificationType.rejectDeleteUser,
          translationData: {
            userRole: user.role,
            fullName: getDisplayName(user, 'user'),
          }
        });
      }
    }
  }

  private async updateUser(compliance: ComplianceLogItem, reject: boolean = false) {
    const data = JSON.parse(compliance.action.value!);
    const user = await this._userRepository.findById(data.id);

    if (!reject) {
      if (user && data.email && data.email !== user.email) {
        const mailNickname = getEmailFirstPart(data.email);

        const userPrincipalName = `${mailNickname}-${data.email.slice(data.email.indexOf('@') + 1)}@${config.OAUTH_TENANT_NAME}.onmicrosoft.com`;

        const userData = {
          accountEnabled: true,
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
        };

        await this._graphClient.updateUser(data.id, userData);
      }

      await this._userRepository.updateById(data.id, data);
      compliance.status = ComplianceStatus.Accepted;
      await this._complianceRepository.update(compliance);
    } else {
      compliance.status = ComplianceStatus.Rejected;
      await this._complianceRepository.update(compliance);
    }
  }

  private async doTransactionBuy(compliance: ComplianceLogItem, reject: boolean = false) {
    const { createTransaction, maturityDate, transactionId } = JSON.parse(compliance.action.value!);
    const { investor: buyerId, product: productId, quantity } = createTransaction;

    const product = await this._productsCollection.findOne({ id: productId });

    if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

    if (!reject) {
      if (product.availableVolume! - quantity! < 0) throw new BussinessError(ErrorMessage.invalidMaximumAvailableAmount, 'invalidMaximumAvailableAmount');

      let transactionHash = '';
      try {
        const { data: { transactionHash: blockchainTransactionHash } } = await axios.post(`${config.BLOCKCHAIN_URL}/api/products/${createTransaction.product}/buy`, { buyerId, amount: quantity });

        if (blockchainTransactionHash) transactionHash = blockchainTransactionHash;
      } catch (e: any) {
        this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.failed } });
        throw new BlockChainError(e.message);
      }

      await this._productsCollection.updateOne({ id: productId }, { $set: { availableVolume: product.availableVolume! - Number(quantity) } });

      const holding = await this._holdingsCollection.findOne({ product: product.id, investor: buyerId });

      if (holding) {
        await this._holdingsCollection.updateOne({ id: holding.id },
          {
            $set: {
              quantity: holding.quantity + quantity,
              heldSince: new Date(),
              nonCallPeriod: getProductNonCallPeriod(product),
              availableVolume: holding.availableVolume + quantity
            }
          });
      } else {
        await this._holdingsCollection.insertOne({
          id: uuidv4(),
          category: product.category,
          product: productId,
          investor: buyerId,
          quantity: Number(quantity),
          name: product.name,
          heldSince: new Date(),
          nonCallPeriod: getProductNonCallPeriod(product),
          maturityDate,
          amountReceived: 0,
          ticketSize: product.ticketSize!,
          availableVolume: Number(quantity),
          amountRepaid: 0,
        });
      }

      await this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.processed, transactionHash } });

      this._notificationsCollection.insertMany([
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.approveTransactionBuyIssuer),
          receiverId: product.issuer!,
          text: "Product sold",
        },
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.approveTransactionBuyInvestor),
          receiverId: createTransaction.investor!,
          text: "Product purchased",
        },
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.approveTransactionBuyAdmin),
          text: `Transaction Buy product ${product.name} was approved`,
        },
      ]);

      compliance.status = ComplianceStatus.Accepted;
      compliance.transactionHash = transactionHash;
      await this._complianceRepository.update(compliance);
    } else {
      await this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.rejected } });
      compliance.status = ComplianceStatus.Rejected;
      await this._complianceRepository.update(compliance);

      this._notificationsCollection.insertMany([
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.rejectTransactionBuy),
          receiverId: product.issuer!,
          text: `Transaction Buy product ${product.name} was rejected`,
        },
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.rejectTransactionBuy),
          receiverId: createTransaction.investor!,
          text: `Transaction Buy product ${product.name} was rejected`,
        },
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.rejectTransactionBuy),
          text: `Transaction Buy product ${product.name} was rejected`,
        },
      ]);
    }
  }

  private async doTransactionSell(compliance: ComplianceLogItem, reject: boolean = false) {
    const { createTransaction, maturityDate, transactionId } = JSON.parse(compliance.action.value!);
    const { investor: sellerId, receiver: buyerId, product: productId, quantity, returnTokens, issuer: issuerId } = createTransaction;
    const holding = await this._holdingsCollection.findOne({ product: productId, investor: sellerId });
    const product = await this._productsCollection.findOne({ id: productId });

    if (!reject) {
      if (!holding) throw new NotFoundError(ErrorMessage.notHolding, 'notHolding');
      if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

      let transactionHash = '';

      if (returnTokens && issuerId) {
        const issuer = await this._userRepository.findById(issuerId);

        // transfer tokens to issuer
        try {
          const { data: { transactionHash: blockchainTransactionHash }} = await axios.post(
            `${config.BLOCKCHAIN_URL}/api/products/${createTransaction.product}/sell`,
            { buyerId: issuer?.id, sellerId, amount: holding.availableVolume }
          );

          if (blockchainTransactionHash) transactionHash = blockchainTransactionHash;
        } catch (e: any) {
          throw new BlockChainError(e.message);
        }

        const updatedProduct = await this._productRepository.updateById(productId, { availableVolume: product.availableVolume! + holding.availableVolume });

        // clean holding balance for investors' holding
        await this._holdingsCollection.updateOne({ id: holding.id },
          {
            $set: { quantity: 0, availableVolume: 0 }
          });

        // if this is the last transaction and all tokens returned to issuer - burn them
        if (updatedProduct?.availableVolume === updatedProduct?.quantity && updatedProduct?.status === Status.inactive) {
          try {
            const { data: { transactionHash: blockchainTransactionHash }} = await axios.post(
              `${config.BLOCKCHAIN_URL}/api/products/${product.id}/burn`,
              { userId: issuer?.id, amount: product.quantity }
            );

            if (blockchainTransactionHash) transactionHash = blockchainTransactionHash;
          } catch (e: any) {
            throw new BlockChainError(e.message);
          }
        }

        await this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.processed, transactionHash } });

        this._notificationsCollection.insertMany([
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.approveTransactionSellReturned),
            receiverId: product.issuer!,
            text: `Tickets was returned product ${product.name}`,
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.approveTransactionSellReturned),
            receiverId: createTransaction.investor!,
            text: `Tickets was returned product ${product.name}`,
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.approveTransactionSellReturnedAdmin),
            text: `Transaction tickets returned product ${product.name} was approved`,
          },
        ]);
      } else {
        if (holding.availableVolume - quantity < 0) throw new BussinessError(ErrorMessage.invalidMaximumAvailableAmount, 'invalidMaximumAvailableAmount');

        try {
          const { data: { transactionHash: blockchainTransactionHash }} = await axios.post(
            `${config.BLOCKCHAIN_URL}/api/products/${createTransaction.product}/sell`,
            { buyerId, sellerId, amount: quantity }
          );

          if (blockchainTransactionHash) transactionHash = blockchainTransactionHash;
        } catch (e: any) {
          this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.failed } });
          throw new BlockChainError(e.message);
        }

        await this._holdingsCollection.updateOne({ id: holding.id },
          {
            $set: {
              quantity: holding.quantity - quantity,
              availableVolume: holding.availableVolume - quantity
            }
          });

        const buyersHolding = await this._holdingsCollection.findOne({ product: productId, investor: buyerId });

        if (buyersHolding) {
          await this._holdingsCollection.updateOne({ id: buyersHolding.id },
            {
              $set: {
                quantity: buyersHolding.quantity + quantity,
                heldSince: new Date(),
                nonCallPeriod: getProductNonCallPeriod(product),
                availableVolume: buyersHolding.availableVolume + quantity
              }
            });
        } else {
          await this._holdingsCollection.insertOne({
            id: uuidv4(),
            category: product.category,
            product: productId as string,
            investor: buyerId!,
            quantity,
            name: product.name,
            heldSince: new Date(),
            nonCallPeriod: getProductNonCallPeriod(product),
            maturityDate,
            amountReceived: 0,
            ticketSize: product.ticketSize!,
            availableVolume: Number(quantity),
            amountRepaid: 0,
          });
        }

        this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.processed, transactionHash } });

        this._notificationsCollection.insertMany([
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.approveTransactionSellIssuer),
            receiverId: product.issuer!,
            text: "Product transferred",
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.approveTransactionSellInvestor),
            receiverId: createTransaction.investor!,
            text: "Holding sold",
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.approveTransactionSellReceiver),
            receiverId: createTransaction.receiver!,
            text: "Product purchased",
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.approveTransactionSellAdmin),
            text: `Transaction Sell product ${product.name} was approved`,
          },
        ]);
      }

      compliance.status = ComplianceStatus.Accepted;
      compliance.transactionHash = transactionHash;
      await this._complianceRepository.update(compliance);
    } else {
      this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.rejected } });
      compliance.status = ComplianceStatus.Rejected;
      await this._complianceRepository.update(compliance);

      if (!product) return;

      if (returnTokens) {
        this._notificationsCollection.insertMany([
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.rejectTransactionSellReturned),
            receiverId: product.issuer!,
            text: `Transaction Sell tickets returned product ${product.name} was rejected`,
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.rejectTransactionSellReturned),
            receiverId: createTransaction.investor!,
            text: `Transaction Sell tickets returned product ${product.name} was rejected`,
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.rejectTransactionSellReturned),
            text: `Transaction Sell tickets returned product ${product.name} was rejected`,
          },
        ]);
      } else {
        this._notificationsCollection.insertMany([
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.rejectTransactionSell),
            receiverId: product.issuer!,
            text: `Transaction Sell product ${product.name} was rejected`,
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.rejectTransactionSell),
            receiverId: createTransaction.investor!,
            text: `Transaction Sell product ${product.name} was rejected`,
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.rejectTransactionSell),
            receiverId: createTransaction.receiver!,
            text: `Transaction Sell product ${product.name} was rejected`,
          },
          {
            id: uuidv4(),
            ...this.getBaseNotification(product, NotificationType.rejectTransactionSell),
            text: `Transaction Sell product ${product.name} was rejected`,
          },
        ]);
      }
    }
  }

  private async doPaymentTransaction(compliance: ComplianceLogItem, reject: boolean = false) {
    const { createTransaction, product, transactionId } = JSON.parse(compliance.action.value!);

    if (!reject) {
      await this.paymentTransactionActionApproved({ createTransaction, product, transactionId });
      compliance.status = ComplianceStatus.Accepted;
      await this._complianceRepository.update(compliance);
    } else {
      this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.rejected } });
      compliance.status = ComplianceStatus.Rejected;
      await this._complianceRepository.update(compliance);

      await this._notificationsCollection.insertMany([
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.rejectTransactionPayment),
          receiverId: product.issuer!,
          text: `Transaction Payment product ${product.name} was rejected`,
        },
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.rejectTransactionPayment),
          receiverId: createTransaction.investor!,
          text: `Transaction Payment product ${product.name} was rejected`,
        },
        {
          id: uuidv4(),
          ...this.getBaseNotification(product, NotificationType.rejectTransactionPayment),
          text: `Transaction Payment product ${product.name} was rejected`,
        },
      ]);
    }
  }

  private async doPaymentTransactionArray(compliance: ComplianceLogItem, reject: boolean = false) {
    const actionValues = JSON.parse(compliance.action.value!);

    if (actionValues && actionValues.length > 0) {
      const promises = actionValues.map(async actionValue => {
        const { createTransaction, product, transactionId } = actionValue;

        if (!reject) {
          await this.paymentTransactionActionApproved({ createTransaction, product, transactionId });
        } else {
          await this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.rejected } });

          await this._notificationsCollection.insertMany([
            {
              id: uuidv4(),
              ...this.getBaseNotification(product, NotificationType.rejectTransactionPayment),
              receiverId: product.issuer!,
              text: `Transaction Payment product ${product.name} was rejected`,
            },
            {
              id: uuidv4(),
              ...this.getBaseNotification(product, NotificationType.rejectTransactionPayment),
              receiverId: createTransaction.investor!,
              text: `Transaction Payment product ${product.name} was rejected`,
            },
            {
              id: uuidv4(),
              ...this.getBaseNotification(product, NotificationType.rejectTransactionPayment),
              text: `Transaction Payment product ${product.name} was rejected`,
            },
          ]);
        }
      });

      await Promise.all(promises);

      if (!reject) {
        compliance.status = ComplianceStatus.Accepted;
        await this._complianceRepository.update(compliance);
      } else {
        compliance.status = ComplianceStatus.Rejected;
        await this._complianceRepository.update(compliance);
      }
    } else {
      throw new BussinessError(ErrorMessage.wrongData, 'wrongData');
    }
  }

  private async paymentTransactionActionApproved({
    createTransaction,
    product,
    transactionId
  }: PaymentTransactionAction) {
    const { investor: investorId, product: productId, paymentType } = createTransaction;
    const amount: number = Number(createTransaction.amount) || 0;
    const holding = await this._holdingsCollection.findOne({ product: productId, investor: investorId });

    if (holding) {
      let amountReceived = holding.amountReceived || 0;

      if (paymentType && [PaymentType.INTEREST, PaymentType.GENERIC].includes(paymentType)) {
        amountReceived += amount;
      }

      const updateHolding = {
        amountReceived,
        amountRepaid: (holding.amountRepaid || 0) + (paymentType === PaymentType.REPAYMENT ? amount : 0)
      };

      await this._holdingsCollection.updateOne({ id: holding.id }, { $set: updateHolding });
    }

    await this._transactionsCollection.updateOne({ id: transactionId }, { $set: { status: TransactionStatus.processed } });

    await this._notificationsCollection.insertMany([
      {
        id: uuidv4(),
        ...this.getBaseNotification(product, NotificationType.approveTransactionPaymentIssuer),
        receiverId: product.issuer! as string,
        text: "Product paid",
      },
      {
        id: uuidv4(),
        ...this.getBaseNotification(product, NotificationType.approveTransactionPaymentInvestor),
        receiverId: createTransaction.investor!,
        text: "Product paid",
      },
      {
        id: uuidv4(),
        ...this.getBaseNotification(product, NotificationType.approveTransactionPaymentAdmin),
        text: `Transaction Payment product ${product.name} was approved`,
      },
    ]);
  }

  private getBaseNotification(product: Product, type: NotificationType): Notification {
    return {
      entityType: EntityType.PRODUCT,
      relatedEntityId: product.id!,
      text: "",
      createdAt: new Date(),
      isRead: false,
      type,
      translationData: {
        productName: product.name,
      }
    };
  }

  private async doAddProduct(compliance: ComplianceLogItem, reject: boolean = false) {
    try {
      const { userId, productId, initialAmount, name, symbol } = JSON.parse(compliance.action.value!);
      const product = await this._productsCollection.findOne({ id: productId });
      if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

      if (!reject) {
        const issuer = await this._userRepository.findById(product.issuer as string);

        if (!issuer || !isIssuer(issuer)) throw new NotFoundError(ErrorMessage.notIssuer, 'notIssuer');
        if (issuer.status !== AccountStatus.active) throw new NotFoundError(ErrorMessage.notActiveIssuer, 'notActiveIssuer');

        await this._productRepository.updateById(productId, {
          status: Status.active
        });

        const {status, data: { transactionHash }} = await axios.post(`${ config.BLOCKCHAIN_URL }/api/products`, { userId, productId, initialAmount, name, symbol });

        if (status !== 200) {
          await this._productRepository.updateById(productId, {
            status: Status.failed
          });
          throw new BussinessError(ErrorMessage.invalidContract, 'invalidContract');
        }

        compliance.status = ComplianceStatus.Accepted;
        compliance.transactionHash = transactionHash;
        await this._complianceRepository.update(compliance);
      } else {
        await this._productRepository.updateById(productId, {
          status: Status.rejected
        });
        compliance.status = ComplianceStatus.Rejected;
        await this._complianceRepository.update(compliance);
      }
    } catch (err: any) {
      throw new BussinessError(err.message, 'Error');
    }
  }


  private async doAddUser(compliance: ComplianceLogItem, reject: boolean = false) {
    try {
      const userId = compliance.relatedUserId;
      const user = await this._userRepository.findById(userId);
      if (!user || !user.id) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

      if (!reject) {
        const password = `${generate({ length: 10, numbers: true })}${Math.floor(Math.random() * 10)}`;
        const body = {
          accountEnabled: true,
          passwordProfile: {
            forceChangePasswordNextSignIn: false,
            password
          }
        };

        await this._graphClient.updateUser(user.id, body);

        this._mailClient.sendEmail({
          to: user.email,
          subject: 'Your request has been approved',
          body: this._mailClient.signupApprovedTemplate({
            login: user.email,
            password,
            fullName:getDisplayName(user, '')
          })
        });

        await this._userRepository.updateById(userId, { status: AccountStatus.active });
        compliance.status = ComplianceStatus.Accepted;
        await this._complianceRepository.update(compliance);
      } else {
        await this._userRepository.updateById(userId, { status: AccountStatus.rejected });
        compliance.status = ComplianceStatus.Rejected;
        await this._complianceRepository.update(compliance);

        this._mailClient.sendEmail({
          to: user.email,
          subject: 'Your request has been rejected',
          body: this._mailClient.signupRejectedTemplate({
            fullName:getDisplayName(user, '')
          })
        });
      }
    } catch (err: any) {
      throw new BussinessError(err.message, 'Error');
    }
  }

  async getComplianceList(body: ComplianceListRequest) {
    return this._complianceRepository.list(body);
  }

  getFiltersData() {
    return this._complianceRepository.getFiltersData();
  }
}
