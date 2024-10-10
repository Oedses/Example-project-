import { ParameterizedContext, Context } from 'koa';
import Router from 'koa-router';
import ProductService from '../../services/products';
import { accessChecker, validate } from '../../middlewares';
import { createProductRequest, getProductsListRequest, updateProductRequest, requestBuy } from './validators';
import { Product, ProductsListRequest, RequestBuy } from '../../../../shared/types/product';
import { Roles } from '../../../../shared/types/common';

export default class ProductsController {

  readonly service: ProductService;

  constructor(productService: ProductService) {
    this.service = productService;
  }

  createProduct = async (ctx: ParameterizedContext) => {
    const { body, authInfo } = ctx.state;
    const product = await this.service.createProduct(body, authInfo.oid);
    ctx.body = product;
  };

  updateProduct = async (ctx: Context) => {
    const { body } = ctx.state;
    const product = await this.service.updateProduct(body);
    ctx.body = product;
  };

  getProductsList = async (ctx: Context) => {
    const { body, user } = ctx.state;
    ctx.body = await this.service.getProductsList(body, user);
  };

  getProductById = async (ctx: Context) => {
    ctx.body = await this.service.getProductById(ctx.params, ctx.state.user);
  };

  requestBuy = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.requestBuy(ctx.state.body);
  };

  requestDelist = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.requestDelist(ctx.params.id);
  };

  deactivate = async (ctx: ParameterizedContext) => {
    ctx.body = await this.service.deactivateProduct(ctx.params.id, ctx.state.user);
  };

  get router(): Router {
    return new Router()
      .put(
        '/',
        accessChecker([Roles.admin]),
        validate<Product>(updateProductRequest),
        this.updateProduct
      )
      .get(
        '/',
        validate<ProductsListRequest>(getProductsListRequest),
        this.getProductsList
      )
      .get('/:id', this.getProductById)

      .post(
        '/',
        accessChecker([Roles.admin]),
        validate<Product>(createProductRequest),
        this.createProduct
      )

      .post(
        '/request-buy',
        accessChecker([Roles.investor]),
        validate<RequestBuy>(requestBuy),
        this.requestBuy
      )

      .post(
        '/request-delist/:id',
        accessChecker([Roles.issuer]),
        this.requestDelist
      )

      .post(
        '/deactivate/:id',
        accessChecker([Roles.admin]),
        this.deactivate
      );
  }
}
