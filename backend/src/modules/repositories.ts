import { Db } from 'mongodb';
import { IHoldingRepository } from '../domains/holdings';
import { INotificationRepository } from '../domains/notifications';
import { IProductRepository } from '../domains/products';
import { ITransactionRepository } from '../domains/transactions';
import { IUserRepository } from '../domains/users';
import MongoHoldingRepository from '../repositories/MongoHoldingRepository';
import MongoProductRepository from '../repositories/MongoProductRepository';
import MongoTransactionRepository from '../repositories/MongoTransactionRepository';
import MongoUserRepository from '../repositories/MongoUserRepository';
import MongoNotificationRepository from '../repositories/MongoNotificationRepository';
import { IComplianceRepository } from "../domains/compliance";
import MongoComplianceRepository from "../repositories/MongoComplianceRepository";

export default class Repositories {

  readonly productRepository: IProductRepository;

  readonly transactionRepository: ITransactionRepository;

  readonly holdingRepository: IHoldingRepository;

  readonly userRepository: IUserRepository;

  readonly notificationRepository: INotificationRepository;

  readonly complianceRepository: IComplianceRepository;

  constructor(pool: Db) {
    this.productRepository = new MongoProductRepository(pool);
    this.transactionRepository = new MongoTransactionRepository(pool);
    this.holdingRepository = new MongoHoldingRepository(pool);
    this.userRepository = new MongoUserRepository(pool);
    this.notificationRepository = new MongoNotificationRepository(pool);
    this.complianceRepository = new MongoComplianceRepository(pool);
  }
}
