import { AxiosResponse } from 'axios';

import { notifications } from './paths';

import api, { AuthHeader } from '../api';

import { Notification, ReadNotificationRequest } from '../../../shared/types/notification';
import { Pageable } from '../../../shared/types/response';

export default class NotificationService {
  public static getList = (query: string): Promise<AxiosResponse<Pageable<Notification>, Notification[]>> =>
    api.get(`${notifications}?${query}`, { headers: AuthHeader() });

  public static update = (data: Partial<Notification>): Promise<void> =>
    api.put(notifications, data, { headers: AuthHeader() });

  public static readAll = (data: Partial<ReadNotificationRequest> = {}): Promise<void> =>
    api.put(`${notifications}/read-all`, data, { headers: AuthHeader() });

  public static getUnreadCount = (): Promise<AxiosResponse<number>> =>
    api.get(`${notifications}/unread-count`, { headers: AuthHeader() });
}

