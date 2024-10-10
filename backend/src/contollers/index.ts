/* eslint-disable no-underscore-dangle */
import Router from 'koa-router';
import { auth, errorHandler } from '../middlewares';
import Services from '../modules/services';
import ProductsController from './products/routes';
import TransactionsController from './transactions/routes';
import HoldingsController from './holdings/routes';
import UsersController from './users/routes';
import NotificationsController from './notifications/routes';
import ComplianceController from "./compliance/routes";
import ZipCodeController from './zipCode/routes';

export default class Controllers {

  private _productsController: ProductsController;

  private _transactionsController: TransactionsController;

  private _holdingsController: HoldingsController;

  private _usersController: UsersController;

  private _notificationsController: NotificationsController;

  private _complianceController: ComplianceController;

  private _zipCodeController: ZipCodeController;

  constructor(services: Services) {
    this._productsController = new ProductsController(services.productService);
    this._transactionsController = new TransactionsController(services.transactionService);
    this._holdingsController = new HoldingsController(services.holdingService);
    this._usersController = new UsersController(services.userService);
    this._notificationsController = new NotificationsController(services.notificationService);
    this._complianceController = new ComplianceController(services.complianceService);
    this._zipCodeController = new ZipCodeController(services.zipCodeService);
  }

  get routes() {
    return new Router()
      .use(errorHandler)
      .get('/healthcheck', ctx => { ctx.body = 'OK! v.0.0.1'; })
      .use('/zip-code', this._zipCodeController.router.routes())
      .use('/users', this._usersController.router.routes())
      .use('/products', auth(), this._productsController.router.routes())
      .use('/transactions', auth(), this._transactionsController.router.routes())
      .use('/holdings', auth(), this._holdingsController.router.routes())
      .use('/notifications', auth(), this._notificationsController.router.routes())
      .use('/compliance', auth(), this._complianceController.router.routes())
      .routes();
  }
}
