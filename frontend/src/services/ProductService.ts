import { AxiosResponse } from 'axios';

import { products } from './paths';

import api, { AuthHeader } from '../api';

import { ComplexProduct, GetProductResponse, Product, RequestBuy } from '../../../shared/types/product';

import { CreateProductRequest } from '../views/dashboard/Products/CreateProductForm/createProduct.constants';
export default class ProductService {
  public static create = (data: CreateProductRequest) =>
    api.post<CreateProductRequest>(products, data, { headers: AuthHeader() });


    public static getList = (query: string): Promise<AxiosResponse<GetProductResponse, Product[]>> =>
      api.get(`${products}?${query}`, { headers: AuthHeader() });


    public static getItem = (id: string): Promise<AxiosResponse<ComplexProduct>> =>
      api.get(`${products}/${id}`, { headers: AuthHeader() });


    public static requestBuy = (data: RequestBuy): Promise<void> =>
      api.post(`${products}/request-buy`, data, { headers: AuthHeader() });


    public static requestDelist = (id: string): Promise<void> =>
      api.post(`${products}/request-delist/${id}`, {}, { headers: AuthHeader() });

    public static delist = (id: string): Promise<void> =>
      api.post(`${products}/deactivate/${id}`, {}, { headers: AuthHeader() });
}

