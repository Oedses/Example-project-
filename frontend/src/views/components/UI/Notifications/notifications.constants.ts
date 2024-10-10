import { t } from "i18next";
import { NotificationTranslationData, NotificationType } from "../../../../../../shared/types/notification";

export const getTranslatedNotification = (type: NotificationType, data?: NotificationTranslationData) => t(`components.notifications.messages.${type}`, data);
