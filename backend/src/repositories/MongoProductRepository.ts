import { Collection, Db } from 'mongodb';
import { Status, ObjKeyValue, Roles } from '../../../shared/types/common';
import { CreateHoldingRequest, Holding } from '../../../shared/types/holding';
import { Issuer } from '../../../shared/types/issuer';
import { ComplexProduct, GetProductRequest, Product, ProductCategory, ProductsListRequest } from '../../../shared/types/product';
import { Pageable } from '../../../shared/types/response';
import { CreateTransactionRequest, Transaction, TransactionStatus, TransactionType } from '../../../shared/types/transaction';
import { isAdmin, isCompliance, isInvestor, isIssuer, User } from '../../../shared/types/user';
import { ErrorMessage } from '../constants/errorMessage';
import { IProductRepository } from '../domains/products';
import NotFoundError from '../errors/NotFoundError';

export default class MongoProductRepository implements IProductRepository {
  public collection: Collection<Product>;

  private holdingsCollection: Collection<Holding | CreateHoldingRequest>;

  private transactionsCollection: Collection<Transaction | CreateTransactionRequest>;

  private usersCollection: Collection<User>;

  constructor(pool: Db) {
    this.collection = pool.collection<Product>('products');
    this.holdingsCollection = pool.collection('holdings');
    this.transactionsCollection = pool.collection('transactions');
    this.usersCollection = pool.collection('users');
  }

  async findById(id: string): Promise<Product> {
    const product = await this.collection.findOne({ id });

    if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

    return product;
  }

  async find(data: Partial<Product>): Promise<Product[]> {
    const products = await this.collection.find(data).toArray();

    return products;
  }

  async getProductById(query: GetProductRequest, currentUser?: User): Promise<ComplexProduct> {
    const { id } = query;
    const filtersProduct: ObjKeyValue = { id };

    if (currentUser && !isAdmin(currentUser) && !isCompliance(currentUser)) {
      filtersProduct.status = { $nin: [Status.processing, Status.failed, Status.rejected] };
    }

    let holdings: Holding[] = [];
    let productHoldings: Holding[] = [];

    const product = await this.collection.findOne(filtersProduct);

    if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');

    const issuer = (await this.usersCollection.findOne({ id: product.issuer })) as Issuer;

    if (!currentUser || !issuer) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

    product.issuer = { id: issuer.id, name: issuer.name! };

    const volumeSoldPipeline = [
      {
        $match:{
          $and: [
            {
              type: "Buy", product: product.id,
              status: TransactionStatus.processed
            }
          ]
        }
      },
      {
        $group:
          {
            _id: null,
            value: {
              $sum: {
                $multiply : [product.ticketSize, '$quantity']
              }
            },
          },
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const reservedAmountPipeline = [
      {
        $match:{
          $and: [
            {
              product: product.id,
              status: TransactionStatus.processing,
              type: TransactionType.BUY,
              returnTokens: { $ne: true }
            },
          ]
        }
      },
      {
        $group:
          {
            _id: null,
            quantity: { $sum: '$quantity' },
            value: {
              $sum: {
                $multiply : [product.ticketSize, '$quantity']
              }
            },
          },
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const productHoldingsPipeline = [
      {
        $match:{
          $and: [
            {
              product: product.id,
              availableVolume: { $gt: 0 }
            },
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          let: { investorId: "$investor" },
          pipeline: [
            { $match: { $expr: { $eq: ["$id", "$$investorId"] } } },
            { $project: { _id: 0 } }
          ],
          "as": "investor"
        }
      },
      { $unwind: '$investor' },
    ];

    const returnedTokernsAmountPipeline = [
      {
        $match:{
          $and: [
            {
              product: product.id,
              status: TransactionStatus.processed,
              type: TransactionType.SELL,
              returnTokens: true
            },
          ]
        }
      },
      {
        $group:
          {
            _id: null,
            value: {
              $sum: {
                $multiply : [product.ticketSize, '$quantity']
              }
            },
          },
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const volumeSold = await this.transactionsCollection.aggregate<{ value: number }>(volumeSoldPipeline).next();

    const reservedAmount = await this.transactionsCollection.aggregate(reservedAmountPipeline).next();

    const returnedTokensAmount = await this.transactionsCollection.aggregate<{ value: number }>(returnedTokernsAmountPipeline).next();

    const totals: { totalVolume: number, availableVolume: number, volumeSold: number, totalHoldingsVolume?: number, reservedAmount?: number } = {
      totalVolume: product.ticketSize! * product.quantity! || 0,
      availableVolume: product.availableVolume! * product.ticketSize! - (reservedAmount?.value || 0),
      volumeSold: (volumeSold?.value || 0) - (returnedTokensAmount?.value || 0),
    };

    product.realAvailableVolume = (product.availableVolume! || 0) - (reservedAmount?.quantity || 0);
    product.processingAvailableVolume = reservedAmount?.quantity || 0;

    if (isInvestor(currentUser)) {

      const investorHoldings = await this.transactionsCollection.find({
        $or: [
          {
            investor: currentUser.id
          },
          {
            type: TransactionType.SELL,
            receiver: currentUser.id
          },
        ],
        product: product.id,
        status: TransactionStatus.processed
      }).toArray();

      investorHoldings.forEach(x => {
        if (x.type === TransactionType.BUY) {
          totals.totalHoldingsVolume = (totals.totalHoldingsVolume || 0) + x.ticketSize! * x.quantity!;
        }

        if (x.type === TransactionType.SELL) {
          if (x.receiver == currentUser.id) {
            totals.totalHoldingsVolume = (totals.totalHoldingsVolume || 0) + x.ticketSize! * x.quantity!;
          } else {
            totals.totalHoldingsVolume = (totals.totalHoldingsVolume || 0) - x.ticketSize! * x.quantity!;
          }
        }
      });

      holdings = await this.holdingsCollection.find({ investor: currentUser.id, product: product.id }).toArray() as Holding[];
    }

    if (isAdmin(currentUser) || isCompliance(currentUser)) {
      productHoldings = await this.holdingsCollection.aggregate(productHoldingsPipeline).toArray() as Holding[];
    }

    totals.reservedAmount = reservedAmount?.value || 0;

    totals.volumeSold = totals.volumeSold - (totals.totalHoldingsVolume || 0);

    return { ...product, holdings, totals, productHoldings };
  }

  async create(data: Product): Promise<Product | null> {
    const insertedProduct = await this.collection.insertOne(data);
    return this.collection.findOne({ _id: insertedProduct.insertedId }, { projection: { _id: 0 } });
  }

  async updateById(id: Product['id'], data: Partial<Product>): Promise<Product | null> {
    const isProductExist = await this.collection.findOne({ id });
    if (!isProductExist) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');
    await this.collection.updateOne({ id }, { $set: { ...data } });
    return this.collection.findOne({ id }, { projection: { _id: 0 } });
  }

  async getProductsList(
    query: ProductsListRequest,
    currentUser?: User
  ): Promise<Pageable<Product>> {
    const { skip, limit, name, status, isRealAvailableVolume, isBought, issuer, paymentType, startCouponRate, endCouponRate } = query;

    const categories = query.categories.replace(/\s+/g, '').split(',').filter(item => item) || [];
    const filtersProduct: ObjKeyValue = {};
    const filtersProductAnd: Array<ObjKeyValue> = [];

    if (name) {
      filtersProduct.name = { $regex: name, $options: 'i' };
    }


    if (isIssuer(currentUser)) {
      filtersProduct.issuer = currentUser.id;
    }

    if (issuer && !isIssuer(currentUser)) {
      filtersProduct.issuer = issuer;
    }

    if (paymentType) {
      filtersProduct.paymentType = paymentType;
    }

    if (status) {
      filtersProductAnd.push({ status });
    }

    if (currentUser && isIssuer(currentUser)) {
      filtersProductAnd.push({
        status: { $nin: [Status.processing, Status.failed, Status.rejected] }
      });
    }

    if (currentUser && isInvestor(currentUser)) {
      filtersProductAnd.push({
        status: Status.active
      });
    }

    if (isRealAvailableVolume) {
      filtersProductAnd.push({
        $expr: {
          $gte: ['$availableVolume', '$transaction.quantity']
        }
      });
    }

    if (isBought) {
      filtersProductAnd.push({
        $expr: {
          $lt: ['$availableVolume', '$quantity']
        }
      });
    }

    if (startCouponRate) {
      filtersProductAnd.push({
        couponRate: { $gte: startCouponRate }
      });
    }

    if (endCouponRate) {
      filtersProductAnd.push({
        couponRate: { $lte: endCouponRate }
      });
    }

    if (filtersProductAnd.length > 0) {
      filtersProduct.$and = filtersProductAnd;
    }

    const countsByCategoryPipeline = [
      {
        $match: { ...filtersProduct },
      },
      { $group:
        {
          _id: { category: "$category" },
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          category: "$_id.category",
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    if (categories.length) {
      filtersProduct.category = { $in: categories };
    }

    const pipeline = [
      {
        $lookup: {
          from: "transactions",
          let: { productId: '$id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$product', '$$productId' ] },
                status: TransactionStatus.processing,
                type: TransactionType.BUY,
                returnTokens: { $ne: true }
              }
            },
            {
              $group:
                {
                  _id: null,
                  quantity: { $sum: '$quantity' },
                }
            },
          ],
          as: "transaction",
        },
      },
      {
        $unwind: {
          path: "$transaction",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          processingAvailableVolume:  {
            $ifNull: ["$transaction.quantity", 0]
          },
          realAvailableVolume: {
            $subtract: [
              '$availableVolume',
              {
                $ifNull: ["$transaction.quantity", 0]
              }
            ]
          }
        }
      },
      {
        $match: {
          id: { $exists: true },
          ...filtersProduct
        }
      },
      {
        $lookup: {
          from: "users",
          let: { issuerId: "$issuer" },
          pipeline: [
            { $match: { $expr: { $eq: ["$id", "$$issuerId"] } } },
            { $project: { _id: 0, id: 1, name: 1 } }
          ],
          "as": "issuer"
        }
      },
      { $unwind: '$issuer' },
      {
        $project: {
          transaction: 0
        }
      }
    ];

    const [dataCount] = await this.collection.aggregate([
      ...pipeline,
      {
        $count: "count"
      }
    ]).toArray();

    let count = 0;
    if (dataCount && dataCount.count > 0) {
      count = dataCount.count;
    }

    const [data, totals] = await Promise.all([
      this.collection
        .aggregate(pipeline)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit) || count + 1)
        .toArray() as Promise<Product[]>,
      this.collection.aggregate<{ count: number, label: ProductCategory }>(countsByCategoryPipeline).toArray()
    ]);

    return { count, data, totals };
  }
}
