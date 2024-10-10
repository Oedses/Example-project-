import Repositories from './repositories';
import Clients from './clients';
import ProductService from '../services/products';
import TransactionService from '../services/transactions';
import HoldingService from '../services/holdings';
import { Db } from 'mongodb';
import UserService from '../services/users';
import NotificationService from '../services/notifications';
import ComplianceService from "../services/compliance";
import ZipCodeService from '../services/zipCode';

export default class Services {

  readonly productService: ProductService;

  readonly transactionService: TransactionService;

  readonly holdingService: HoldingService;

  readonly userService: UserService;

  readonly notificationService: NotificationService;

  readonly complianceService: ComplianceService;

  readonly zipCodeService: ZipCodeService;

  constructor(repositories: Repositories, clients: Clients, pool: Db) {
    this.productService = new ProductService(repositories.productRepository, repositories.complianceRepository, repositories.userRepository, repositories.notificationRepository, clients.mailClient, pool);
    this.transactionService = new TransactionService(repositories.transactionRepository, repositories.complianceRepository, repositories.userRepository, repositories.notificationRepository, clients.mailClient, pool);
    this.holdingService = new HoldingService(repositories.holdingRepository, repositories.productRepository);
    this.userService = new UserService(repositories.userRepository, repositories.complianceRepository, repositories.notificationRepository, clients.mailClient, clients.graphClient, pool);
    this.notificationService = new NotificationService(repositories.notificationRepository);
    this.complianceService = new ComplianceService(repositories.complianceRepository, repositories.userRepository, repositories.productRepository, clients.mailClient, clients.graphClient, pool);
    this.zipCodeService = new ZipCodeService(clients.zipCodeClient)
  }
}
