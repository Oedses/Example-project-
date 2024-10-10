import { Collection, Db } from 'mongodb';
import { AdminChartData, AdminOverview, AdminOverviewRequest } from '../../../shared/types/admin';
import { AccountStatus, ComplianceLogItem, ObjKeyValue, Roles, Status } from '../../../shared/types/common';
import { Holding } from '../../../shared/types/holding';
import { ComplexInvestor, ComplexInvestorRequest, Investor, InvestorOverview, InvestorPortfolio, InvestorsListRequest } from '../../../shared/types/investor';
import { ComplexIssuer, ComplexIssuerRequest, Issuer, IssuerOverview, IssuerOverviewRequest, IssuersListRequest } from '../../../shared/types/issuer';
import { Product } from '../../../shared/types/product';
import { Pageable } from '../../../shared/types/response';
import { CreateTransactionRequest, PaymentType, Transaction, TransactionStatus, TransactionType } from '../../../shared/types/transaction';
import { isIssuer, isInvestor, User } from '../../../shared/types/user';
import { ErrorMessage } from '../constants/errorMessage';
import { IUserRepository } from '../domains/users';
import NotFoundError from '../errors/NotFoundError';
import { getDateQuarter } from '../utils/fn';

export const calculateAmounts = (transactions: Partial<Transaction>[] | undefined, id: string) => {
  let totalOriginalAmount = 0;
  let totalAmountReceived = 0;

  if (transactions) {
    transactions.forEach(x => {
      if (x.type === TransactionType.BUY) {
        totalOriginalAmount += (Number(x.quantity) * x.ticketSize!);
      }

      if (x.type === TransactionType.SELL) {
        if (x.receiver == id) {
          totalOriginalAmount += (Number(x.quantity) * x.ticketSize!);
        } else {
          totalOriginalAmount -= (Number(x.quantity) * x.ticketSize!);
        }
      }

      if (x.type === TransactionType.PAYMENT && x.paymentType && [PaymentType.INTEREST, PaymentType.GENERIC].includes(x.paymentType)) {
        totalAmountReceived += Number(x.amount);
      }
    });
  }

  return { totalOriginalAmount, totalAmountReceived };
};

export default class MongoUserRepository implements IUserRepository {

  private transactionsCollection: Collection<Transaction | CreateTransactionRequest>;

  private holdingsCollection: Collection<Holding>;

  private productsCollection: Collection<Product>;

  private notificationsCollection: Collection<Notification>;

  private complianceCollection: Collection<ComplianceLogItem>;

  private collection: Collection<User>;

  constructor(pool: Db) {
    this.transactionsCollection = pool.collection<Transaction | CreateTransactionRequest>('transactions');
    this.holdingsCollection = pool.collection<Holding>('holdings');
    this.productsCollection = pool.collection<Product>('products');
    this.notificationsCollection = pool.collection<Notification>('notifications');
    this.complianceCollection = pool.collection<ComplianceLogItem>('compliance');
    this.collection = pool.collection<User>('users');
  }

  async create(data: Investor): Promise<Investor> {
    const { email } = data;

    data.email = email.toLowerCase();

    const insertedInvestor = await this.collection.insertOne(data);

    return this.collection.findOne({ _id: insertedInvestor.insertedId }) as Promise<Investor>;
  }

  async findById(id: string, exception: boolean = true): Promise<User | null> {

    const user = await this.collection.findOne({ id });

    if (!user && exception) throw new NotFoundError(ErrorMessage.notUser, 'notUser');

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {

    const user = await this.collection.findOne({ email });

    return user;
  }

  async find(data: Object, filters?: ObjKeyValue): Promise<User[]> {
    const users = await this.collection.find({ ...data, ...filters }).toArray();

    return users;
  }

  async findAdmins(): Promise<User[]> {
    const admins = await this.collection.find({ role: Roles.admin }).toArray();

    return admins;
  }


  async updateById(id: User['id'], data: Partial<User>): Promise<User> {

    await this.collection.updateOne({ id }, { $set: data });

    const user = await this.collection.findOne({ id });

    return user!;
  }

  async getInvestorsList(query: InvestorsListRequest): Promise<Pageable<Investor>> {
    const { skip, limit, name, status, productId, isHolding, startDate, endDate, startTotalProducts, endTotalProducts, entityType } = query;
    const today = new Date();

    const getTotalProductsStage = () => {
      return [
        {
          $lookup: {
            from: "transactions",
            let: { investorId: '$id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$investor', '$$investorId' ] },
                  type: TransactionType.PAYMENT,
                  status: TransactionStatus.processed,
                  createdAt: {
                    $gte: new Date(new Date().setDate(today.getDate() - 30))
                  },
                }
              },
              {
                $group:
                  {
                    _id: null,
                    totalPayments: {
                      $sum: '$amount'
                    },
                  },
              },
            ],
            as: 'totalPayments'
          },
        },
        {
          $unwind: {
            path: "$totalPayments",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            totalProducts: {
              $cond: {
                if: { $isArray: "$holdings" },
                then: { $size: "$holdings" },
                else: 0
              }
            },
            totalPayments: { $ifNull: ["$totalPayments.totalPayments", 0] },
          },
        },
      ];
    };

    const queryData: ObjKeyValue = {
      role: Roles.investor
    };
    const queryDataAnd: ObjKeyValue[] = [];
    const queryDataHolding: ObjKeyValue = {};

    if (name) {
      queryData.$or = [
        {
          $expr: {
            $regexMatch: {
              input: { '$concat': ['$firstName', ' ', '$lastName'] },
              regex: name,
              options: 'i',
            },
          },
        },
        {
          companyName: { $regex: name || '', $options: 'i' },
        }
      ];
    }

    if (entityType) {
      queryData.type = entityType;
    }

    if (startDate) {
      queryDataAnd.push({
        createdAt: { $gte: new Date(new Date(startDate).setHours(0, 0, 0)) }
      });
    }

    if (endDate) {
      queryDataAnd.push({
        createdAt: { $lte: new Date(new Date(endDate).setHours(23, 59, 59)) }
      });
    }

    if (startTotalProducts) {
      queryDataAnd.push({
        totalProducts: { $gte: startTotalProducts }
      });
    }

    if (endTotalProducts) {
      queryDataAnd.push({
        totalProducts: { $lte: endTotalProducts }
      });
    }

    if (isHolding) {
      queryDataAnd.push({
        $expr: { $gte: [{ $size: "$holdings" }, 1] }
      });
    }

    if (queryDataAnd.length) {
      queryData.$and = queryDataAnd;
    }

    const countsByStatusesPipeline = [
      {
        $lookup: {
          from: "holdings",
          let: { investorId: '$id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$investor', '$$investorId' ] },
                availableVolume: { $gt: 0 },
                ...queryDataHolding
              }
            },
          ],
          as: "holdings",
        },
      },
      ...getTotalProductsStage(),
      {
        $match: { ...queryData }
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
      queryData.status = status;
    }

    if (productId) {
      queryDataHolding.product = productId;
    }

    const queryMatch: object[] = [
      {
        $lookup: {
          from: "holdings",
          let: { investorId: '$id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$investor', '$$investorId' ] },
                availableVolume: { $gt: 0 },
                ...queryDataHolding
              }
            },
          ],
          as: "holdings",
        },
      },
      ...getTotalProductsStage(),
      {
        $match: queryData
      },
    ];

    const queryPipeline: object[] = [
      ...queryMatch,
      {
        $addFields: {
          holding: {
            $filter: {
              input: "$holdings",
              as: "holding",
              cond: { $eq: [ "$$holding.product", productId ] }
            }
          }
        }
      },
      {
        $unwind: {
          path: "$holding",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          holdings: 0
        }
      }
    ];

    const [dataCount] = await this.collection.aggregate([
      ...queryPipeline,
      {
        $count: "count"
      }
    ]).toArray();

    let count = 0;
    if (dataCount && dataCount.count > 0) {
      count = dataCount.count;
    }

    const [data, totals] = await Promise.all([
      this.collection.aggregate(queryPipeline)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit) || count + 1)
        .toArray() as Promise<Investor[]>,
      this.collection.aggregate<{ count: number, label: AccountStatus }>(countsByStatusesPipeline).toArray()
    ]);

    return { count, data, totals };
  }

  async getComplexInvestor(query: ComplexInvestorRequest): Promise<ComplexInvestor> {
    const { id } = query;
    const investor = await this.collection.findOne({ id, role: Roles.investor });
    if (!investor) throw new NotFoundError(ErrorMessage.notInvestor, 'notInvestor');

    const transactionFilters = {
      $or: [
        {
          investor: id
        },
        {
          type: TransactionType.SELL,
          receiver: id
        },
      ]
    };

    const transactionsPipeline = [
      {
        $match: transactionFilters
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

    const holdingsPipelinse = [
      {
        $match: {
          $and: [{ investor: id }, { availableVolume: { $ne: 0 } }]
        }
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
                _id: 0,
                id: 1,
                name: 1,
                category: 1
              }
            },
          ],
          as: "product"
        }
      },
      {
        $unwind: '$product'
      }
    ];

    const holdings = await this.holdingsCollection.aggregate(holdingsPipelinse).sort({ createdAt: -1 }).toArray();
    const holdingsCount = await this.holdingsCollection.find({
      investor: id,
      availableVolume: { $ne: 0 },
    }).count();
    const transactions = await this.transactionsCollection.aggregate<Partial<Transaction>>(transactionsPipeline).sort({ createdAt: -1 }).toArray();
    const transactionsCount = await this.transactionsCollection.find(transactionFilters).count();

    const processedTransactions = transactions.filter(x => x.status === TransactionStatus.processed);

    const { totalOriginalAmount, totalAmountReceived } = calculateAmounts(processedTransactions, id);

    return {
      ...investor,
      totalRecieved: totalAmountReceived || 0,
      totalTransactions: transactionsCount || 0,
      totalOriginalAmount,
      holdings: {
        data: holdings,
        count: holdingsCount
      }
    } as ComplexInvestor;
  }

  async getInvestorPortfolio(currentUser: User, chartData: InvestorPortfolio['chartData']): Promise<InvestorPortfolio> {
    const totalBuyAmountPipeline = [
      {
        $match: {
          $or: [
            {
              investor: currentUser.id,
              type: TransactionType.BUY,
            },
            {
              receiver: currentUser.id,
              type: TransactionType.SELL,
            },
          ],
          status: TransactionStatus.processed
        },
      },
      {
        $group: {
          _id : null,
          value : {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          }
        }
      },
      {
        $project: { _id : 0, value: 1 }
      }
    ];

    const totalSellAmountPipeline = [
      {
        $match: {
          investor: currentUser.id,
          type: TransactionType.SELL,
          status: TransactionStatus.processed
        },
      },
      {
        $group: {
          _id : null,
          value : {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          }
        }
      },
      {
        $project: { _id : 0, value: 1 }
      }
    ];

    const totalRecievedAmountPipeleine = [
      {
        $match: {
          type: TransactionType.PAYMENT,
          investor: currentUser.id,
          status: TransactionStatus.processed,
          $and: [
            { paymentType: { $in: [PaymentType.INTEREST, PaymentType.GENERIC] } }
          ]
        },
      },
      {
        $group:
          {
            _id: null,
            totalRecievedAmount: {
              $sum: '$amount'
            },
          },
      },
    ];

    const holdings = await this.holdingsCollection.find({ investor: currentUser.id, availableVolume: { $ne: 0 } }).sort({ originalAmount: -1 }).toArray() as Holding[];
    const totalBuyAmount = await this.transactionsCollection.aggregate<{ value: number }>(totalBuyAmountPipeline).next();
    const totalSellAmount = await this.transactionsCollection.aggregate<{ value: number }>(totalSellAmountPipeline).next();
    const resTotalRecievedAmount = await this.transactionsCollection.aggregate<{ totalRecievedAmount: number }>(totalRecievedAmountPipeleine).next();

    const totalOriginalAmount = (totalBuyAmount?.value || 0) - (totalSellAmount?.value || 0);
    const totalRecievedAmount = resTotalRecievedAmount?.totalRecievedAmount || 0;

    const firstHoldingDate = (await this.holdingsCollection.findOne(
      { investor: currentUser.id },
      { sort: { heldSince: 1 } }
    ))?.heldSince || null;

    return {
      firstHoldingDate,
      totalRecievedAmount,
      totalOriginalAmount,
      holdings,
      chartData
    };
  }

  async getInvestorOverview(currentUser: User, chartData: InvestorOverview['chartData']): Promise<InvestorOverview> {
    const investorsProductsPipeline = [
      {
        $match: { investor: currentUser.id }
      },
      {
        $lookup: {
          from: "products",
          let: { productId: '$product' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$productId' ] },
                status: { $nin: [Status.processing, Status.failed, Status.rejected] }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'issuer',
                foreignField: 'id',
                as: 'issuer'
              }
            },
            {
              $unwind: '$issuer'
            },
          ],
          as: "product"
        }
      },
      {
        $unwind: '$product'
      },
    ];

    const totalBuyAmountPipeline = [
      {
        $match: {
          $or: [
            {
              investor: currentUser.id,
              type: TransactionType.BUY,
            },
            {
              receiver: currentUser.id,
              type: TransactionType.SELL,
            },
          ],
          status: TransactionStatus.processed
        },
      },
      {
        $group: {
          _id : null,
          value : {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          }
        }
      },
      {
        $project: { _id : 0, value: 1 }
      }
    ];

    const totalSellAmountPipeline = [
      {
        $match: {
          investor: currentUser.id,
          type: TransactionType.SELL,
          status: TransactionStatus.processed
        },
      },
      {
        $group: {
          _id : null,
          value : {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          }
        }
      },
      {
        $project: { _id : 0, value: 1 }
      }
    ];

    const totalRecievedAmountPipeleine = [
      {
        $match: {
          type: TransactionType.PAYMENT,
          investor: currentUser.id,
          status: TransactionStatus.processed,
          $and: [
            { paymentType: { $in: [PaymentType.INTEREST, PaymentType.GENERIC] } }
          ]
        },
      },
      {
        $group:
          {
            _id: null,
            totalRecievedAmount: {
              $sum: '$amount'
            },
          },
      },
    ];

    const transactionsPipeline = [
      {
        $match: {
          $or: [
            {
              investor: currentUser.id
            },
            {
              type: TransactionType.SELL,
              receiver: currentUser.id
            },
          ]
        },
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
                '_id': 0,
                'id': 1,
                'name': 1
              }
            },
          ],
          as: "product"
        }
      },
      {
        $unwind: '$product'
      },
    ];

    const transactions = await this.transactionsCollection.aggregate(transactionsPipeline).sort({ createdAt: -1 }).skip(0).limit(5).toArray() as Transaction[];
    const investorsProducts = await this.holdingsCollection.aggregate(investorsProductsPipeline).sort({ originalAmount: -1 }).skip(0).limit(5).toArray();
    const totalBuyAmount = await this.transactionsCollection.aggregate<{ value: number }>(totalBuyAmountPipeline).next();
    const totalSellAmount = await this.transactionsCollection.aggregate<{ value: number }>(totalSellAmountPipeline).next();
    const resTotalRecievedAmount = await this.transactionsCollection.aggregate<{ totalRecievedAmount: number }>(totalRecievedAmountPipeleine).next();
    const products = investorsProducts.map(x => x.product);

    const totalOriginalAmount = (totalBuyAmount?.value || 0) - (totalSellAmount?.value || 0);
    const totalRecievedAmount = resTotalRecievedAmount?.totalRecievedAmount || 0;

    const firstHoldingDate = (await this.holdingsCollection.findOne(
      { investor: currentUser.id },
      { sort: { heldSince: 1 } }
    ))?.heldSince || null;

    return {
      firstHoldingDate,
      totalRecievedAmount,
      totalOriginalAmount,
      products,
      transactions,
      chartData
    } as InvestorOverview;
  }

  async getComplexIssuer(query: ComplexIssuerRequest): Promise<ComplexIssuer> {
    const { id } = query;
    const issuer = await this.collection.findOne({ id, role: Roles.issuer });
    if (!issuer) throw new NotFoundError(ErrorMessage.notIssuer, 'notIssuer');

    const totalProductsPipeline = [
      {
        $match: { issuer: id }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: {
            $multiply : ['$ticketSize', '$quantity']
          } },
          productsCount: { $sum: 1 }
        }
      },
    ];

    const totalTransactionsPipeline = [
      {
        $match: { issuer: id }
      },
      { $facet: {
        totalPayOut: [
          {
            $match: { 
              type: TransactionType.PAYMENT,
              paymentType: { $ne: PaymentType.REPAYMENT },
            }
          },
          { $group: {
            _id: null,
            totalPayOut: { $sum: '$amount' }
          } },
          {
            $project: {
              _id: 0,
              totalPayOut: 1
            }
          }
        ],
        totalInvestors: [
          { $group: {
            _id: "$investor",
            totalInvestors: { $sum: 1 },
          } },
          {
            $count: 'totalInvestors'
          }
        ]
      } },
      {
        $unwind: '$totalPayOut'
      },
      {
        $unwind: '$totalInvestors'
      },
      {
        $addFields: {
          totalPayOut: '$totalPayOut.totalPayOut',
          totalInvestors: '$totalInvestors.totalInvestors',
        },
      },
    ];

    const products = await this.productsCollection.find({ issuer: id }).toArray();
    const productsTotal = await this.productsCollection.aggregate(totalProductsPipeline).next() as { totalVolume: number, productsCount: number };
    const totalTransactions = await this.transactionsCollection.aggregate(totalTransactionsPipeline).next() as { totalPayOut: number, totalInvestors: number };

    return {
      ...issuer,
      totalVolume: productsTotal?.totalVolume || 0,
      totalInvestors: totalTransactions?.totalInvestors || 0,
      totalPayOut: totalTransactions?.totalPayOut || 0,
      products: {
        data: products,
        count: productsTotal?.productsCount || 0,
      }
    } as ComplexIssuer;
  }

  async getIssuersList(query: IssuersListRequest): Promise<Pageable<Issuer>> {
    const { skip, limit, name, status, startDate, endDate, startTotalProducts, endTotalProducts } = query;

    const getTotalProductsStage = () => {

      return [
        {
          $lookup: {
            from: "products",
            let: { issuerId: '$id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$issuer', '$$issuerId' ] }
                }
              },
              {
                $group:
                  {
                    _id: null,
                    totalVolumeAllProducts: { $sum: {
                      $multiply : ['$ticketSize', '$quantity']
                    } },
                    count: { $sum: 1 }
                  }
              },
            ],
            as: 'products'
          },
        },
        {
          $addFields: {
            totalProducts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$products", []] },
                    then: [0]
                  }
                ],
                default: "$products.count"
              }
            },
            totalVolumeAllProducts: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$products", []] },
                    then: [0]
                  }
                ],
                default: "$products.totalVolumeAllProducts"
              }
            }
          },
        },
        {
          $unwind: '$totalProducts'
        },
        {
          $unwind: '$totalVolumeAllProducts'
        },
        {
          $project: {
            _id: 0,
            products: 0
          }
        }
      ];
    };

    const queryData: ObjKeyValue = { name: { $regex: name || '', $options: 'i' } };
    const filtersAnd: ObjKeyValue[] = [];

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

    if (startTotalProducts) {
      filtersAnd.push({
        totalProducts: { $gte: startTotalProducts }
      });
    }

    if (endTotalProducts) {
      filtersAnd.push({
        totalProducts: { $lte: endTotalProducts }
      });
    }

    if (filtersAnd.length) {
      queryData.$and = filtersAnd;
    }

    const countsByStatusesPipeline = [
      {
        $match: { ...queryData }
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
      queryData.status = status;
    }

    const issuersListPipeline = [
      ...getTotalProductsStage(),
      {
        $match: queryData,
      },
    ];

    const [dataCount] = await this.collection.aggregate([
      ...issuersListPipeline,
      {
        $count: "count"
      }
    ]).toArray();

    let count = 0;
    if (dataCount && dataCount.count > 0) {
      count = dataCount.count;
    }

    const [data, totals] = await Promise.all([
      this.collection.aggregate(issuersListPipeline)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit) || count + 1)
        .toArray() as Promise<Issuer[]>,
      this.collection.aggregate<{ count: number, label: AccountStatus }>(countsByStatusesPipeline).toArray()
    ]);

    return { count, data, totals };
  }

  async getIssuerOverview(query: IssuerOverviewRequest, currentUser: User): Promise<IssuerOverview> {
    const totalIssuerAmountPipeline = [
      {
        $match: {
          issuer: currentUser.id,
          status: Status.active
        },
      },
      {
        $group: { _id : null, totalIssuedAmount: {
          $sum: {
            $multiply : ['$ticketSize', '$quantity']
          }
        },
        totalAvailableVolume : { $sum: {
          $multiply : ['$ticketSize', '$availableVolume']
        } } }
      },
      {
        $project: { _id : 0, totalIssuedAmount: 1, totalAvailableVolume: 1 }
      }
    ];

    const transactionsPipeline = [
      {
        $match: {
          $expr: { $eq: ['$issuer', currentUser.id] }
        },
      },
      {
        $lookup: {
          from: "users",
          let: { issuerId: '$issuer' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$issuerId' ] }
              }
            },
            {
              $project: {
                _id: 0,
                id: 1,
                name: 1
              }
            },
          ],
          as: "issuer"
        }
      },
      {
        $lookup: {
          from: "products",
          let: { productId: '$product' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$productId' ] }
              }
            },
            {
              $project: {
                _id: 0,
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
                companyName: 1
              }
            },
          ],
          as: "investor"
        }
      },
      {
        $unwind: '$issuer'
      },
      {
        $unwind: '$product'
      },
      {
        $unwind: '$investor'
      },
    ];

    const totalRepaidAmountPipeleine = [
      {
        $match: {
          type: TransactionType.PAYMENT,
          issuer: currentUser.id,
          paymentType: PaymentType.REPAYMENT,
          status: TransactionStatus.processed
        },
      },
      {
        $group:
          {
            _id: null,
            value: {
              $sum: '$amount'
            },
          },
      },
    ];

    const previousQarterDates = getDateQuarter(true);

    const totalInterestAmountPipeline = [
      {
        $match: { $and: [
          { createdAt: { $gte:  previousQarterDates.startFullQuarter } },
          { createdAt: { $lte: previousQarterDates.endFullQuarter } },
          { type:  TransactionType.PAYMENT },
          { paymentType: PaymentType.INTEREST },
          { status: TransactionStatus.processed },
          { issuer: currentUser.id }
        ] }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: '$amount'
          },
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const productsPipeline = [
      {
        $match: {
          issuer: currentUser.id,
          status: { $nin: [Status.processing, Status.failed, Status.rejected] }
        }
      },
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
        $project: {
          transaction: 0
        }
      }
    ];

    const productTotals = (await this.productsCollection.aggregate(totalIssuerAmountPipeline).next()) as { totalIssuedAmount: number, totalAvailableVolume: number };

    const products = await this.productsCollection.aggregate(productsPipeline).sort({ createdAt: -1 }).limit(5).toArray() as Product[];

    const transactions = await this.transactionsCollection.aggregate(transactionsPipeline).sort({ createdAt: -1 }).limit(5).toArray() as Transaction[];
    const repaidAmount = await this.transactionsCollection.aggregate<{ value: number }>(totalRepaidAmountPipeleine).next();

    const totalInterest = await this.transactionsCollection.aggregate<{ value: number }>(totalInterestAmountPipeline).next();

    return {
      totalIssuedAmount: productTotals?.totalIssuedAmount || 0,
      repaidAmount: repaidAmount?.value || 0,
      products,
      transactions,
      totalInterestQarter: totalInterest?.value || 0
    } as IssuerOverview;
  }

  async getAdminOverview(query: AdminOverviewRequest,
    chartData: AdminChartData): Promise<AdminOverview> {

    const today = new Date();

    const totalPeriodVolumePipeline = [
      {
        $match: { $and: [
          { createdAt: { $gte: new Date(new Date().setDate(today.getDate() - 30)) } },
          { type: { $ne: TransactionType.PAYMENT } },
          { status: TransactionStatus.processed }
        ] }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const totalPreviousPeriodVolumePipeline = [
      {
        $match: { $and: [
          { createdAt: { $gte: new Date(new Date().setDate(today.getDate() - 60)) } },
          { createdAt: { $lte: new Date(new Date().setDate(today.getDate() - 30)) } },
          { type: { $ne: TransactionType.PAYMENT } },
          { status: TransactionStatus.processed }
        ] }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const totalPeriodProcessingVolumePipeline = [
      {
        $match: { $and: [
          { createdAt: { $gte: new Date(new Date().setDate(today.getDate() - 30)) } },
          { type: { $ne: TransactionType.PAYMENT } },
          { status: TransactionStatus.processing }
        ] }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const totalPreviousPeriodProcessingVolumePipeline = [
      {
        $match: { $and: [
          { createdAt: { $gte: new Date(new Date().setDate(today.getDate() - 60)) } },
          { createdAt: { $lte: new Date(new Date().setDate(today.getDate() - 30)) } },
          { type: { $ne: TransactionType.PAYMENT } },
          { status: TransactionStatus.processing }
        ] }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: {
              $multiply : ['$ticketSize', '$quantity']
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const totalPeriodPaymentsPipeline = [
      {
        $match: { $and: [
          { createdAt: { $gte: new Date(new Date().setDate(today.getDate() - 30)) } },
          { type: TransactionType.PAYMENT },
          { status: TransactionStatus.processed },
          { paymentType: { $in: [PaymentType.INTEREST, PaymentType.GENERIC] } }
        ] }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: '$amount'
          },
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const totalPreviousPeriodPaymentsPipeline = [
      {
        $match: { $and: [
          { createdAt: { $gte: new Date(new Date().setDate(today.getDate() - 60)) } },
          { createdAt: { $lte: new Date(new Date().setDate(today.getDate() - 30)) } },
          { type: TransactionType.PAYMENT },
          { status: TransactionStatus.processed },
          { paymentType: { $in: [PaymentType.INTEREST, PaymentType.GENERIC] } }
        ] }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: '$amount'
          },
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ];

    const lastPeriodVolume = await this.transactionsCollection.aggregate<{ value: number, count: number }>(totalPeriodVolumePipeline).next();
    const previousPeriodVolume = await this.transactionsCollection.aggregate<{ value: number, count: number }>(totalPreviousPeriodVolumePipeline).next();
    const lastPeriodProcessingVolume = await this.transactionsCollection.aggregate<{ value: number, count: number }>(totalPeriodProcessingVolumePipeline).next();
    const previousLastPeriodProcessingVolume = await this.transactionsCollection.aggregate<{ value: number, count: number }>(totalPreviousPeriodProcessingVolumePipeline).next();
    const totalPeriodPayments = await this.transactionsCollection.aggregate<{ value: number }>(totalPeriodPaymentsPipeline).next();
    const totalPreviousPeriodPayments = await this.transactionsCollection.aggregate<{ value: number }>(totalPreviousPeriodPaymentsPipeline).next();

    return {
      chartData,
      lastPeriodVolume: {
        currentValue: lastPeriodVolume?.value || 0,
        previousValue: previousPeriodVolume?.value || 0
      },
      lastPeriodProcessingVolume: {
        currentValue: lastPeriodProcessingVolume?.value || 0,
        previousValue: previousLastPeriodProcessingVolume?.value || 0
      },
      lastPeriodPayment: {
        currentValue: totalPeriodPayments?.value || 0,
        previousValue: totalPreviousPeriodPayments?.value || 0
      },
      lastPeriodTransactions: {
        currentValue: lastPeriodVolume?.count || 0,
        previousValue: previousPeriodVolume?.count || 0
      },
    } as AdminOverview;
  }

  async getEmailsAdmin(): Promise<string[]> {
    const admins = await this.collection.find({
      role: Roles.admin,
      status: AccountStatus.active
    }).toArray();

    const emails: string[] = [];

    await Promise.all(admins.map(admin => {
      if (admin.email) {
        emails.push(admin.email);
      }
    }));

    return emails;
  }

  async userDelete(id: string) {
    const user = await this.collection.findOne({ id });

    if (user) {
      await this.collection.deleteOne({ id: user.id });
      this.userRelatedDelete(user);
    }
  }

  private async  userRelatedDelete(user: User) {
    await this.notificationsCollection.deleteMany({ receiverId: user.id });
    await this.complianceCollection.deleteMany({ relatedUserId: user.id });

    if (isInvestor(user)) {
      await this.holdingsCollection.deleteMany({ investor: user.id });
      await this.transactionsCollection.deleteMany({ investor: user.id });
    }

    if (isIssuer(user)) {
      await this.productsCollection.deleteMany({ issuer: user.id });
    }
  }
}
