import { isAdmin, isCompliance } from './../../../shared/types/user';
import { Collection, Db } from "mongodb";
import { Notification, NotificationCreate, NotificationsListRequest, ReadNotificationRequest } from "../../../shared/types/notification";
import { Pageable } from "../../../shared/types/response";
import { User } from "../../../shared/types/user";
import { INotificationRepository } from "../domains/notifications";
import NotFoundError from "../errors/NotFoundError";
import { ObjKeyValue } from '../../../shared/types/common';
import { v4 as uuidv4 } from 'uuid';
import { ErrorMessage } from '../constants/errorMessage';

export default class MongoNotificationRepository implements INotificationRepository {
  public collection: Collection<Notification>;

  constructor(pool: Db) {
    this.collection = pool.collection<Notification>('notifications');
  }

  async create(data: NotificationCreate): Promise<Notification | null> {
    const createData: Notification = {
      id: uuidv4(),
      isRead: false,
      createdAt: new Date(),
      ...data
    };

    const insertedNotification = await this.collection.insertOne(createData);
    return this.collection.findOne({ _id: insertedNotification.insertedId }, { projection: { _id: 0 } });
  }

  async update(data: Notification, user: User): Promise<Notification | null> {
    const filters: ObjKeyValue = {
      isRead: false,
      id: data.id
    };
    const filtersOr: ObjKeyValue[] = [];

    if (isAdmin(user)) {
      filters.isCompliance = { $exists: false };
      filtersOr.push({
        receiverId: { $exists: false }
      });

      filtersOr.push({
        receiverId: user.id
      });
    }

    if (isCompliance(user)) {
      filters.isCompliance = true;
    }
    
    if (!isAdmin(user) && !isCompliance(user)) {
      filters.receiverId = user.id;
    }

    if (filtersOr.length) {
      filters.$or = filtersOr;
    }
    
    const isNotificationExist = await this.collection.findOne(filters);
    if (!isNotificationExist) throw new NotFoundError(ErrorMessage.notNotification, 'notNotification');
    await this.collection.updateOne(filters, { $set: { ...data } });
    return this.collection.findOne(filters, { projection: { _id: 0 } });
  }

  async readAll(data: ReadNotificationRequest, user: User): Promise<Number | null> {
    if (!user?.id) throw new NotFoundError(ErrorMessage.notReceiverId, 'notReceiverId');

    const filters: ObjKeyValue = {
      isRead: false,
    };
    
    if (data.ids && data.ids.length > 0) {
      filters.id = { $in: data.ids };
    }
    
    const filtersOr: ObjKeyValue[] = [];

    if (isAdmin(user)) {
      filters.isCompliance = { $exists: false };
      filtersOr.push({
        receiverId: { $exists: false }
      });

      filtersOr.push({
        receiverId: user.id
      });
    }

    if (isCompliance(user)) {
      filters.isCompliance = true;
    }
    
    if (!isAdmin(user) && !isCompliance(user)) {
      filters.receiverId = user.id;
    }

    if (filtersOr.length) {
      filters.$or = filtersOr;
    }

    const updateInfo = await this.collection.updateMany(filters, { $set: { isRead: true } });

    return updateInfo?.modifiedCount || 0;
  }

  async getNotificationsList(
    query: NotificationsListRequest,
    currentUser: User
  ): Promise<Pageable<Notification>> {
    const { skip, limit, isRead } = query;

    const filters: ObjKeyValue = {};
    const filtersOr: ObjKeyValue[] = [];

    if (isAdmin(currentUser)) {
      filters.isCompliance = { $exists: false };
      filtersOr.push({
        receiverId: { $exists: false }
      });

      filtersOr.push({
        receiverId: currentUser.id
      });
    }

    if (isCompliance(currentUser)) {
      filters.isCompliance = true;
    }
    
    if (!isAdmin(currentUser) && !isCompliance(currentUser)) {
      filters.receiverId = currentUser.id;
    }

    if (typeof isRead !== 'undefined') {
      filters.isRead = isRead;
    }

    if (filtersOr.length) {
      filters.$or = filtersOr;
    }

    const count = await this.collection.countDocuments(filters);
    const data = await this.collection.find(filters)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit) || count + 1)
      .toArray() as Notification[];

    return { count, data };
  }

  async getUnreadCount(currentUser: User): Promise<number> {
    const filters: ObjKeyValue = {
      isRead: false
    };
    const filtersOr: ObjKeyValue[] = [];

    if (isAdmin(currentUser)) {
      filters.isCompliance = { $exists: false };
      filtersOr.push({
        receiverId: { $exists: false }
      });

      filtersOr.push({
        receiverId: currentUser.id
      });
    }

    if (isCompliance(currentUser)) {
      filters.isCompliance = true;
    }
    
    if (!isAdmin(currentUser) && !isCompliance(currentUser)) {
      filters.receiverId = currentUser.id;
    }

    if (filtersOr.length) {
      filters.$or = filtersOr;
    }

    const count = await this.collection.countDocuments(filters);

    return count;
  }
}
