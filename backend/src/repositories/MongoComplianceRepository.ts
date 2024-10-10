import { Collection, Db } from "mongodb";
import { ComplianceLogItem, ComplianceStatus, ObjKeyValue } from "../../../shared/types/common";
import { ComplianceFiltersDataResponse, ComplianceFiltersRelatedBy, ComplianceFiltersRelatedTo, ComplianceListRequest } from "../../../shared/types/compliance";
import { Pageable } from "../../../shared/types/response";
import { User } from "../../../shared/types/user";
import { IComplianceRepository } from "../domains/compliance";

export default class MongoComplianceRepository implements IComplianceRepository {
  public collection: Collection<ComplianceLogItem>;
  private usersCollection: Collection<User>;

  constructor(pool: Db) {
    this.collection = pool.collection<ComplianceLogItem>('compliance');
    this.usersCollection = pool.collection<User>('users');
  }

  async findOneById(id: ComplianceLogItem['id']): Promise<ComplianceLogItem | null> {
    return this.collection.findOne({ id });
  }

  async create(data: ComplianceLogItem): Promise<void> {
    await this.collection.insertOne(data as any);
  }

  async list(query: ComplianceListRequest): Promise<Pageable<ComplianceLogItem>> {
    const { skip, limit, status, relatedUserId, actionType, relatedTo, startDate, endDate } = query;
    const filters: ObjKeyValue = {};
    const filtersOr: ObjKeyValue[] = [];
    const filtersExprAnd: ObjKeyValue[] = [];
    const filtersAnd: ObjKeyValue[] = [];

    if (relatedUserId) {
      filtersAnd.push({
        $or: [
          { relatedUserId },
          { "action.investors.id": relatedUserId }
        ]
      });
    }

    if (actionType) {
      filtersAnd.push({
        $or: [
          { "action.name": actionType },
          { "action.paymentType": actionType }
        ]
      });
    }

    if (relatedTo) {
      filters['action.id'] = relatedTo;
    }

    if (startDate) {
      filtersExprAnd.push({
        $gte: [{ $toDate: "$date" }, new Date(new Date(startDate).setHours(0, 0, 0))]
      });
    }

    if (endDate) {
      filtersExprAnd.push({
        $lte: [{ $toDate: "$date" }, new Date(new Date(endDate).setHours(23, 59, 59))]
      });
    }

    if (filtersAnd.length) {
      filters.$and = filtersAnd;
    }

    if (filtersExprAnd.length) {
      filters.$expr = {
        $and: filtersExprAnd
      };
    }

    const countsByStatusesPipeline = [
      {
        $match: { ...filters }
      },
      {
        $group: {
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

    const compliancePipeline = [
      {
        $match: filters
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$relatedUserId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$id", "$$userId"] } } },
            { $project: { _id: 0, type: 1, id: 1, firstName: 1, lastName: 1, companyName: 1, name: 1, role: 1 } }
          ],
          "as": "requestedBy"
        }
      },
      { $unwind: '$requestedBy' }
    ];

    const count = await this.collection.find(filters).count();
    const [data, totals] = await Promise.all([
      this.collection.aggregate(compliancePipeline).sort({ date: -1 })
        .skip(Number(skip))
        .limit(Number(limit) || count + 1)
        .toArray() as Promise<Array<ComplianceLogItem>>,
      this.collection.aggregate<{ count: number, label: ComplianceStatus }>(countsByStatusesPipeline).toArray()
    ]);

    return { count, data, totals };
  }

  async getFiltersData(): Promise<ComplianceFiltersDataResponse> {
    const relatedToPipeline = [
      {
        $group: {
          _id: '$action.id',
          name: { $first: "$action.entityName" },
          id: { $first: "$action.id" },
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          id: 1
        }
      }
    ];

    const relatedByPipeline = [
      {
        $lookup: {
          from: "users",
          let: { userId: '$relatedUserId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$id', '$$userId'] }
              }
            },
            {
              $project: {
                _id: 0,
                id: 1,
                firstName: 1,
                lastName: 1,
                companyName: 1,
                name: 1,
                role: 1,
                type: 1
              }
            },
          ],
          as: "user"
        }
      },
      {
        $unwind: '$user'
      },
      { 
        $group: {
          _id: '$user.id',
          name: { $first: "$user.name" },
          firstName: { $first: "$user.firstName" },
          lastName: { $first: "$user.lastName" },
          companyName: { $first: "$user.companyName" },
          role: { $first: "$user.role" },
          type: { $first: "$user.type" },
          id: { $first: "$user.id" },
        } 
      }
    ];

    const relatedTo: ComplianceFiltersRelatedTo[] = await this.collection.aggregate<ComplianceFiltersRelatedTo>(relatedToPipeline).sort({ date: -1 })
      .toArray();

    const relatedBy: ComplianceFiltersRelatedBy[] = await this.collection.aggregate<ComplianceFiltersRelatedBy>(relatedByPipeline).sort({ date: -1 })
      .toArray();

    return { relatedTo, relatedBy };
  }

  async update(data: ComplianceLogItem): Promise<void> {
    await this.collection.updateOne({ id: data.id }, { $set: { ...data } });
  }
}
