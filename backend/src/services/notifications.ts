/* eslint-disable no-underscore-dangle */

import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationsListRequest, ReadNotificationRequest } from '../../../shared/types/notification';
import { Pageable } from '../../../shared/types/response';
import { User } from '../../../shared/types/user';
import { INotificationRepository } from '../domains/notifications';

export default class NotificationService {
  private _repository: INotificationRepository;

  constructor(repository: INotificationRepository) {
    this._repository = repository;
  }

  async createNotification(createNotification: Notification): Promise<Notification | null> {
    const id = uuidv4();

    return this._repository.create({ id, ...createNotification, isRead: false, createdAt: new Date() });
  }

  async updateNotifications(notification: Notification, user: User): Promise<Notification | null> {

    return this._repository.update(notification, user);
  }

  async readAllNotifications(notification: ReadNotificationRequest, user: User): Promise<Number | null> {
    return this._repository.readAll(notification, user);
  }

  getNotificationsList(query: NotificationsListRequest, user: User): Promise<Pageable<Notification>> {
    return this._repository.getNotificationsList(query, user);
  }

  getUnreadCount(user: User):Promise<number> {
    return this._repository.getUnreadCount(user);
  }
}
