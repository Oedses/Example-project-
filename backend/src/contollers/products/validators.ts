import { ValidationResult } from 'joi';
import { Context } from 'koa';
import { GetProductRequest, Product, ProductsListRequest, RequestBuy } from '../../../../shared/types/product';
import { validateCreateProduct, validateProductsListRequest, validateGetProductRequest, validateUpdateProduct, validateRequestBuy, validateRequestDelist } from '../../domains/products';

export type CreateProductRequest = {
  body: Product
};

export function createProductRequest(ctx: Context): ValidationResult<Product> | false{
  return validateCreateProduct(ctx.request.body);
}

export function updateProductRequest(ctx: Context): ValidationResult<Product> | false{
  return validateUpdateProduct(ctx.request.body);
}

export function getProductsListRequest(ctx: Context): ValidationResult<ProductsListRequest> | false {
  return validateProductsListRequest(ctx.query);
}

export function requestBuy(ctx: Context): ValidationResult<RequestBuy> {
  return validateRequestBuy(ctx.request.body);
}

export function requestDelist(ctx: Context): ValidationResult<{ id: string }> {
  return validateRequestDelist(ctx.query);
}

export function getProductByIdRequest(ctx: Context): ValidationResult<GetProductRequest> | false {
  return validateGetProductRequest(ctx.query);
}