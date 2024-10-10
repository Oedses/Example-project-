import Joi, { ValidationResult } from 'joi';
import { Collection } from 'mongodb';
import { Notification, NotificationCreate, NotificationsListRequest, ReadNotificationRequest } from '../../../shared/types/notification';
import { User } from '../../../shared/types/user';
import { CreateNotificationRequest } from '../contollers/notifications/validators';

export interface INotificationRepository {
  collection: Collection<Notification>
  create(data: NotificationCreate): Promise<Notification | null>
  update(data: Partial<Notification>, user: User): Promise<Notification | null>
  readAll(data: Partial<ReadNotificationRequest>, user: User): Promise<Number | null>
  getNotificationsList(query: NotificationsListRequest, user: User): Promise<{ count: number, data: Notification[] }>
  getUnreadCount(user: User): Promise<number>
}

export function validateCreateNotification(x: unknown): ValidationResult<CreateNotificationRequest> {
  return Joi.object({
    id: Joi.string().optional(),
    receiverId: Joi.string().optional(),
    product: Joi.string().required(),
    text: Joi.string().required(),
  }).validate(x);
}

export function validateUpdateNotification(x: unknown): ValidationResult<CreateNotificationRequest> {
  return Joi.object({
    id: Joi.string().required(),
    receiverId: Joi.string().optional(),
    product: Joi.string().optional(),
    text: Joi.string().optional(),
    isRead: Joi.boolean().optional()
  }).validate(x);
}

export function validateReadAllNotification(x: unknown): ValidationResult<CreateNotificationRequest> {
  return Joi.object({
    ids: Joi.array()
  }).validate(x);
}

export function validateNotificationsListRequest(x: any): ValidationResult<NotificationsListRequest> {
  return Joi.object({
    skip: Joi.string().required(),
    limit: Joi.string().required(),
    receiverId: Joi.string().optional(),
    isRead: Joi.string().optional()
  }).validate(x);
}