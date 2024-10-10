import { ValidationResult } from 'joi';
import { Context } from 'koa';
import { Notification, NotificationsListRequest } from '../../../../shared/types/notification';
import { validateCreateNotification, validateUpdateNotification, validateNotificationsListRequest, validateReadAllNotification } from '../../domains/notifications';

export type CreateNotificationRequest = {
  body: Notification
};

export function createNotificationRequest(ctx: Context): ValidationResult<CreateNotificationRequest>{
  return validateCreateNotification(ctx.request.body);
}

export function updateNotificationRequest(ctx: Context): ValidationResult<CreateNotificationRequest>{
  return validateUpdateNotification(ctx.request.body);
}

export function readAllNotificationRequest(ctx: Context): ValidationResult<CreateNotificationRequest>{
  return validateReadAllNotification(ctx.request.body);
}

export function getNotificationsListRequest(ctx: Context): ValidationResult<NotificationsListRequest> {
  return validateNotificationsListRequest(ctx.query);
}
