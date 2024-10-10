import { Collection, Db } from 'mongodb';
import { Transaction, CreateTransactionRequest, TransactionsListRequest, TransactionStatus, TransactionType, TransactionFiltersDataResponse, TransactionFiltersProducts, TransactionFiltersInvestors } from '../../../shared/types/transaction';
import { Pageable } from '../../../shared/types/response';
import { ITransactionRepository } from '../domains/transactions';
import { Product } from '../../../shared/types/product';
import NotFoundError from '../errors/NotFoundError';
import { isAdmin, isCompliance, User } from '../../../shared/types/user';
import { ObjKeyValue } from '../../../shared/types/common';
import { ErrorMessage } from '../constants/errorMessage';

export default class MongoTransactionRepository implements ITransactionRepository {
  private collection: Collection<Transaction | CreateTransactionRequest>;

  private productsCollection: Collection<Product>;

  private usersCollection: Collection<User>;

  constructor(pool: Db) {
    this.collection = pool.collection('transactions');
    this.productsCollection = pool.collection('products');
    this.usersCollection = pool.collection('users');
  }

  async create(data: CreateTransactionRequest): Promise<Transaction> {
    const product =  await this.productsCollection.findOne({ id: data.product });
    if (!product) throw new NotFoundError(ErrorMessage.notProduct, 'notProduct');
    const insertedTransaction = await this.collection.insertOne({ ...data, issuer: product.issuer as string });
    const transaction = await this.collection.findOne({ _id: insertedTransaction.insertedId }) as Transaction;
    return transaction;
  }

  async find(data: Partial<Transaction>, filters?: ObjKeyValue) {
    const filtersForRequest: ObjKeyValue = { ...data, ...filters };

    const transactons = await this.collection.find(filtersForRequest).toArray();

    return transactons;
  }

  async getTransactionsList(
    query: TransactionsListRequest & { userId: string }): Promise<Pageable<Transaction>>{

    const { skip, limit, type, status, product, userId, investor, issuer, startDate, endDate, startAmount, endAmount } = query;

    const user = await this.usersCollection.findOne({ id: userId });
    const filters: ObjKeyValue = {};
    const filtersAnd: Array<ObjKeyValue> = [];

    if (product) {
      filters.product = product;
    }

    if (user && !isAdmin(user) && !isCompliance(user)) {
      filtersAnd.push({
        $or: [
          { [user.role!]: user.id },
          {
            type: TransactionType.SELL,
            receiver: user.id
          }
        ]
      });
    }

    if (type) {
      if (user && [TransactionType.SELL, TransactionType.BUY].includes(type)) {
        if (type === TransactionType.SELL) {
          filtersAnd.push({
            type: TransactionType.SELL,
            receiver: {$ne: user.id }
          });
        }

        if (type === TransactionType.BUY) {
          filtersAnd.push({
            $or: [
              { type },
              {
                type: TransactionType.SELL,
                receiver: user.id
              }
            ]
          });
        }
      } else {
        filtersAnd.push({
          $or: [
            { type },
            {
              type: TransactionType.PAYMENT,
              paymentType: type
            }
          ]
        });
      }
    }

    if (investor) {
      filtersAnd.push({
        investor
      });
    }

    if (issuer) {
      filtersAnd.push({
        issuer
      });
    }

    if (startDate) {
      filtersAnd.push({
        createdAt: { $gte: new Date(new Date(startDate).setHours(0, 0, 0)) }
      });
    }

    if (endDate) {
      filtersAnd.push({
        createdAt: { $lte: new Date(new Date(endDate).setHours(23, 59, 59)) }
      });
    }

    if (startAmount) {
      filtersAnd.push({
        $or: [
          {
            type: TransactionType.PAYMENT,
            amount: { $gte: startAmount }
          },
          {
            type: { $ne: TransactionType.PAYMENT },
            $expr: {
              $gte: [{ $multiply: ['$quantity', '$ticketSize'] }, startAmount]
            }
          }
        ]
      });
    }

    if (endAmount) {
      filtersAnd.push({
        $or: [
          {
            type: TransactionType.PAYMENT,
            amount: { $lte: endAmount }
          },
          {
            type: { $ne: TransactionType.PAYMENT },
            $expr: {
              $lte: [{ $multiply: ['$quantity', '$ticketSize'] }, endAmount]
            }
          }
        ]
      });
    }

    if (filtersAnd.length > 0) {
      filters.$and = filtersAnd;
    }

    const countsByStatusesPipeline = [
      {
        $match: { ...filters },
      },
      { $group:
        {
          _id: { label: "$status" },
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          label: "$_id.label",
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    if (status) {
      filters.status = status;
    }

    const pipeline: object[] = [
      {
        $match: filters
      },
      {
        $lookup: {
          from: "products",
          let: { productId: '$product' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$productId'] }
              }
            },
            {
              $project: {
                id: 1,
                name: 1
              }
            },
          ],
          as: "product"
        }
      },
      {
        $lookup: {
          from: "users",
          let: { investorId: '$investor' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$investorId' ] }
              }
            },
            {
              $project: {
                _id: 0,
                id: 1,
                firstName: 1,
                lastName: 1,
                companyName: 1,
                type: 1

              }
            },
          ],
          as: "investor"
        }
      },
      {
        $unwind: '$product'
      },
      {
        $unwind: '$investor'
      }
    ];

    const count = await this.collection.find(filters).count();
    const [data, totals] = await Promise.all([
      this.collection.aggregate(pipeline)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit) || count + 1)
        .toArray() as Promise<Transaction[]>,
      this.collection.aggregate<{ count: number, label: TransactionStatus }>(countsByStatusesPipeline).toArray()
    ]);

    return { count, data, totals };
  }

  async getFiltersData(user: User): Promise<TransactionFiltersDataResponse> {
    const filters: ObjKeyValue = {};
    const filtersAnd: Array<ObjKeyValue> = [];

    if (user && !isAdmin(user) && !isCompliance(user)) {
      filtersAnd.push({
        $or: [
          { [user.role!]: user.id },
          {
            type: TransactionType.SELL,
            receiver: user.id
          }
        ]
      });
    }

    if (filtersAnd.length > 0) {
      filters.$and = filtersAnd;
    }

    const pipelineInvestor: object[] = [
      {
        $match: filters
      },
      {
        $lookup: {
          from: "users",
          let: { investorId: '$investor' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$investorId' ] }
              }
            },
            {
              $project: {
                _id: 0,
                id: 1,
                firstName: 1,
                lastName: 1,
                companyName: 1,
                type: 1
              }
            },
          ],
          as: "investor"
        }
      },
      {
        $unwind: '$investor'
      },
      { 
        $group: {
          _id: '$investor.id',
          id: { $first: "$investor.id" },
          firstName: { $first: "$investor.firstName" },
          lastName: { $first: "$investor.lastName" },
          companyName: { $first: "$investor.companyName" },
          type: { $first: "$investor.type" },
        } 
      }
    ];

    const pipelineProducts: object[] = [
      {
        $match: filters
      },
      {
        $lookup: {
          from: "products",
          let: { productId: '$product' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$productId'] }
              }
            },
            {
              $project: {
                id: 1,
                name: 1
              }
            },
          ],
          as: "product"
        }
      },
      {
        $unwind: '$product'
      },
      { 
        $group: {
          _id: '$product.id',
          name: { $first: "$product.name" },
          id: { $first: "$product.id" },
        } 
      }
    ];

    let investors: TransactionFiltersInvestors[] = [];

    if (isAdmin(user) || isCompliance(user)) {
      investors = await this.collection.aggregate<TransactionFiltersInvestors>(pipelineInvestor)
      .sort({ createdAt: -1 })
      .toArray();
    }

    const products: TransactionFiltersProducts[] = await this.collection.aggregate<TransactionFiltersProducts>(pipelineProducts)
      .sort({ createdAt: -1 })
      .toArray();

      return { products, investors };
  }
}
