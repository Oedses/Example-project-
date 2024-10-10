import { ParameterizedContext, Context } from 'koa';
import Router from 'koa-router';
import { validate } from '../../middlewares';
import { CreateNotificationRequest, updateNotificationRequest, createNotificationRequest, getNotificationsListRequest, readAllNotificationRequest } from './validators';
import NotificationService from '../../services/notifications';
import { NotificationsListRequest } from '../../../../shared/types/notification';

export default class NotificationsController {

  readonly service: NotificationService;

  constructor(notificationService: NotificationService) {
    this.service = notificationService;
  }

  createNotification = async (ctx: ParameterizedContext<CreateNotificationRequest>) => {
    const { body } = ctx.state;
    const product = await this.service.createNotification(body);
    ctx.body = product;
  };

  updateNotification = async (ctx: Context) => {
    const { body, user } = ctx.state;
    const product = await this.service.updateNotifications(body, user);
    ctx.body = product;
  };

  readAllNotification = async (ctx: Context) => {
    const { body, user } = ctx.state;
    const data = await this.service.readAllNotifications(body, user);
    ctx.body = data;
  };

  getNotificationsList = async (ctx: Context) => {
    const { body, user } = ctx.state;
    ctx.body = await this.service.getNotificationsList(body, user);
  };

  getUnreadCount = async (ctx: Context) => {
    const { user } = ctx.state;
    ctx.body = await this.service.getUnreadCount(user);
  };

  get router(): Router {
    return new Router()
      .post('/', validate<CreateNotificationRequest>(createNotificationRequest), this.createNotification)
      .put('/', validate<CreateNotificationRequest>(updateNotificationRequest), this.updateNotification)
      .put('/read-all', validate<CreateNotificationRequest>(readAllNotificationRequest), this.readAllNotification)
      .get('/', validate<NotificationsListRequest>(getNotificationsListRequest), this.getNotificationsList)
      .get('/unread-count', this.getUnreadCount);
  }
}
