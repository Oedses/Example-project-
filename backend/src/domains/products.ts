import Joi, { ValidationResult } from 'joi';
import { Collection } from 'mongodb';
import regex from '../../../shared/regex';
import { Product, isDividendProduct, isInterestProduct, ProductsListRequest, GetProductRequest, ComplexProduct, RequestBuy } from '../../../shared/types/product';
import { User } from '../../../shared/types/user';

export interface IProductRepository {
  collection: Collection<Product>
  create(data: Product): Promise<Product | null>
  find(data: Partial<Product>): Promise<Product[]>
  updateById(id: Product['id'], data: Partial<Product>): Promise<Product | null>
  findById(id: string): Promise<Product>
  getProductById(query: GetProductRequest, user?: User): Promise<ComplexProduct>
  getProductsList(query: ProductsListRequest, user?: User): Promise<{ count: number, data: Product[] }>
}

const validateDividendProduct = () => Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().max(50).regex(regex.lettersAndNumbers).message("Name: only letters are allowed and number").required(),
  issuer: Joi.string().required(),
  category: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  ticketSize: Joi.number().positive().required(),
  paymentType: Joi.string().required(),
  paymentFrequency: Joi.when('category', { is: 'Bond', then: Joi.string().min(1).required(), otherwise: Joi.valid(null).allow("") }),
  listingDate: Joi.date().max(new Date().setUTCHours(23, 59, 59)).required(),
});

const validateInterestProduct = () => Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().max(50).regex(regex.lettersAndNumbers).message("Name: only letters are allowed and number").required(),
  issuer: Joi.string().required(),
  category: Joi.string().required(),
  ticketSize: Joi.number().positive().required(),
  quantity: Joi.number().positive().required(),
  paymentType: Joi.string().required(),
  paymentFrequency: Joi.when('category', { is: 'Bond', then: Joi.string().min(1).required(), otherwise: Joi.valid(null).allow("") }),
  listingDate: Joi.date().max(new Date().setUTCHours(23, 59, 59)).required(),
  couponRate: Joi.number().positive().required(),
  maturity: Joi.number().positive().required(),
  maturityUnit: Joi.string().required(),
  nonCallPeriod: Joi.number().min(0).required(),
  nonCallPeriodUnit: Joi.string().required(),
  depository: Joi.string().max(50).allow("").optional(),
  isin: Joi.string().max(50).regex(regex.lettersAndNumbers).message("ISIN: only letters and numbers are allowed").allow("").optional(),
});

export function validateCreateProduct(x: unknown): ValidationResult<Product> | false {

  if (isDividendProduct(x) || isInterestProduct(x)) {
    if (x.listingDate) x.listingDate = new Date(new Date(x.listingDate).setUTCHours(0, 0, 0));
  }

  if (isDividendProduct(x)) return validateDividendProduct().validate(x, { stripUnknown: true });

  if (isInterestProduct(x)) return validateInterestProduct().validate(x, { stripUnknown: true });

  return false;
}

export function validateUpdateProduct(x: unknown): ValidationResult<Product> | false {
  if (isDividendProduct(x)) return validateDividendProduct().validate(x, { stripUnknown: true });

  if (isInterestProduct(x)) return validateInterestProduct().validate(x, { stripUnknown: true });

  return false;
}

export function validateProductsListRequest(x: any): ValidationResult<ProductsListRequest> | false {
  return Joi.object({
    skip: Joi.string().required(),
    limit: Joi.string().required(),
    name: Joi.string().optional(),
    categories: Joi.string().optional().allow('').default(''),
    status: Joi.string().optional(),
    isRealAvailableVolume: Joi.boolean().optional().default(false),
    isBought: Joi.boolean().optional().default(false),
    issuer: Joi.string().optional(),
    paymentType: Joi.string().optional(),
    startCouponRate: Joi.number().positive().allow(0),
    endCouponRate: Joi.number().positive().allow(0),
  }).validate(x);
}

export function validateGetProductRequest(x: any): ValidationResult<GetProductRequest> | false {
  return Joi.object({
    id: Joi.string().required()
  }).validate(x);
}

export function validateRequestDelist(x: any): ValidationResult<{ id: string }> {
  return Joi.object({
    id: Joi.string().required()
  }).validate(x);
}

export function validateRequestBuy(x: any): ValidationResult<RequestBuy> {
  return Joi.object({
    product: Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required()
    }).required(),
    investor: Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required()
    }).required(),
    amount: Joi.number().positive().required()
  }).validate(x);
}