/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from 'uuid';
import { Pageable } from '../../../shared/types/response';
import { IHoldingRepository } from '../domains/holdings';
import { CreateHoldingRequest, Holding, HoldingsListRequest } from '../../../shared/types/holding';
import { IProductRepository } from '../domains/products';
import { isInterestProduct, PaymentFrequency, PaymentType } from '../../../shared/types/product';
import NotFoundError from '../errors/NotFoundError';
import { ErrorMessage } from '../constants/errorMessage';

export default class HoldingService {
  private _repository: IHoldingRepository;

  private _productRepository: IProductRepository;

  constructor(repository: IHoldingRepository, productRepository: IProductRepository) {
    this._repository = repository;
    this._productRepository = productRepository;
  }

  async createHolding(
    createHolding: CreateHoldingRequest
  ): Promise<Holding | null> {
    const id = uuidv4();
    const product = await this._productRepository.getProductById({ id: createHolding.product });
    let maturityDate: Date | null = null;

    if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

    if (isInterestProduct(product) && product.listingDate) {
      const maturityYear = product.maturityUnit === 'years' ? product.listingDate.getFullYear() + product.maturity! : product.listingDate.getFullYear();
      const maturityMonths = product.maturityUnit === 'months' ? product.listingDate.getMonth() + product.maturity! : product.listingDate.getMonth();

      maturityDate = new Date(maturityYear, maturityMonths, product.listingDate.getDate());
    }

    const holdingData: Holding | CreateHoldingRequest = {
      id,
      ...createHolding,
      ticketSize: product.ticketSize!,
      heldSince: product.listingDate!,
      maturityDate,
      name: product.name,
      category: product.category,
    };

    if (product.paymentType === PaymentType.INTEREST) {
      (holdingData as Holding).paymentFrequency = product.paymentFrequency as PaymentFrequency;
    }

    return this._repository.create(holdingData);
  }

  getHoldingsList(query: HoldingsListRequest): Promise<Pageable<Holding>> {
    return this._repository.getHoldingsList(query);
  }
}