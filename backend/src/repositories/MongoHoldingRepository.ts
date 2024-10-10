import { Collection, Db } from 'mongodb';
import { ObjKeyValue } from '../../../shared/types/common';
import { CreateHoldingRequest, Holding, HoldingsListRequest } from '../../../shared/types/holding';
import { Pageable } from '../../../shared/types/response';
import { TransactionStatus, TransactionType } from '../../../shared/types/transaction';
import { IHoldingRepository } from '../domains/holdings';

export default class MongoHoldingRepository implements IHoldingRepository {
  public collection: Collection<Holding>;

  constructor(pool: Db) {
    this.collection = pool.collection('holdings');
  }

  async create(data: CreateHoldingRequest): Promise<Holding | null> {

    const holding: Holding = {
      id: data.id!,
      name: data.name!,
      category: data.category || '',
      product: data.product,
      investor: data.investor,
      quantity: data.quantity,
      ticketSize: data.ticketSize,
      heldSince: data.heldSince!,
      nonCallPeriod: data.nonCallPeriod || null,
      maturityDate: data.maturityDate || null,
      amountReceived: 0,
      availableVolume: data.quantity,
      amountRepaid: 0,
    };

    const insertedHolding = await this.collection.insertOne(holding);

    return this.collection.findOne({ _id: insertedHolding.insertedId }, { projection: { _id: 0 } }) as Promise<Holding>;
  }

  async find(data: Partial<Holding>, filters: ObjKeyValue): Promise<Holding[]> {

    const filtersForRequest: ObjKeyValue = { ...data, ...filters };

    const holdings = await this.collection.find(filtersForRequest).toArray();

    return holdings;
  }

  async getHoldingsList(
    query: HoldingsListRequest
  ): Promise<Pageable<Holding>> {
    const { investorId, skip, limit, isSellList } = query;

    const filtersSellList: ObjKeyValue = {};
    const filtersSellListAnd: Array<ObjKeyValue> = [];

    if (isSellList) {
      filtersSellListAnd.push({
        $expr: {
          $gte: ['$realAvailableVolume', 1]
        }
      });
    }

    if (filtersSellListAnd.length > 0) {
      filtersSellList.$and = filtersSellListAnd;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'products',
          let: { productId: '$product' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$productId' ] }
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
                      investor: investorId,
                      type: TransactionType.SELL,
                      status: TransactionStatus.processing,
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
                as: "transactionSell",
              },
            },
            {
              $unwind: {
                path: "$transactionSell",
                preserveNullAndEmptyArrays: true
              }
            },
          ],
          as: 'product'
        },
      },
      {
        $unwind: '$product'
      },
      {
        $addFields: {
          processingAvailableVolume:  {
            $ifNull: ["$product.transactionSell.quantity", 0]
          },
          realAvailableVolume: {
            $subtract: [
              '$availableVolume',
              {
                $ifNull: ["$product.transactionSell.quantity", 0]
              }
            ]
          }
        }
      },
      {
        $match: {
          investor: investorId,
          ...filtersSellList
        }
      },
      {
        $project: {
          'product.transactionSell': 0
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
    const data = await this.collection.aggregate(pipeline)
      .skip(Number(skip))
      .limit(Number(limit) || count + 1)
      .toArray() as Holding[];

    return { count, data };
  }
}
