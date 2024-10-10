import React, { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { BellIcon } from '../../icons';

import { DropDown } from '../DropDown';
import { NotificationItem } from './NotificationItem';

import NotificationService from './../../../../services/NotificationsService';

import UserContext from '../../../../store/contexts/user-context';

import { Notification } from '../../../../../../shared/types/notification';
import { NotificationsFooter } from './NotificationsFooter';
import { Query } from '../../../../../../shared/types/response';
import { createQueryString } from '../../../../utils/fn';
import { getTranslatedNotification } from './notifications.constants';

export type NotificationsItem = (Notification & {
  onClick: () => void;
  displayText?: string;
  isLastElement?: boolean;
  onVisible?: () => void;
});

export type NotificationsProps = {
  widthBreakpoint: number;
};

const limit = 20;

const Notifications = ({ widthBreakpoint }: NotificationsProps) => {
  const { data: { id: receiverId } } = UserContext.useContext();

  const [notifications, setNotifications] = useState<NotificationsItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [totalCount, setTotalCount] = useState(0);
  const [skip, setSkip] = useState(0);

  const [isFetching, setIsFetching] = useState(false);

  const { t, i18n } = useTranslation();

  const onNotificationClick = (id: string) => {
    const newItem = {
      id,
      isRead: true
    };

    setIsFetching(true);

    NotificationService.update(newItem)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      .then(() => getNotificationsList())
      .catch(err => console.log(err))
      .finally(() => setIsFetching(false));
  };

  const onVisible = () => {
    setSkip(prev => prev + limit);
  };

  const getUnreadNotifications = async () => {
    await NotificationService.getUnreadCount()
      .then((res) => setUnreadNotifications(res.data));
  };

  const createNotificationItems = (data: Notification[] | NotificationsItem[]): NotificationsItem[] => data.map(item => {
    return ({
      ...item,
      displayText: getTranslatedNotification(item.type, item.translationData),
      onClick: !item.isRead ? () => onNotificationClick(item.id!) : undefined
    } as any);
  });

  const getNotificationsList = async () => {
    if (receiverId) {
      // setIsFetching(true);
      const requestQuery: Query = { skip, limit };

      await NotificationService.getList(createQueryString(requestQuery))
        .then(res => {
          const { count, data } = res.data;

          const notificationsData = createNotificationItems(data);

          setTotalCount(count);

          setNotifications(prev => skip === 0 ? notificationsData : prev.concat(notificationsData));
        })
        .catch(err => console.log(err))
        .finally(() => setIsFetching(false));
    }
  };

  const onMarkAllClick = () => {
    setIsFetching(true);

    NotificationService.readAll()
      .then(() => {
        getNotificationsList();
        setUnreadNotifications(0);
      })
      .catch(err => console.log(err))
      .finally(() => setIsFetching(false));
  };

  const notificationItems = useMemo(() => (
    notifications.map((item, index) => {
      const isLastElement = index === skip + limit - 1;

      return (
        <NotificationItem
          key={item.id}
          onVisible={onVisible}
          isLastElement={isLastElement}
          {...item}
        />);
    })
  ), [skip, notifications]);

  const footerData = useMemo(() => {
    const resultData = [];

    if (unreadNotifications) resultData.push({
      content: <span className="notifications__read-all">{t('components.notifications.readAll')}</span>,
      onClick: onMarkAllClick
    });

    return resultData;

  }, [unreadNotifications, totalCount, skip, i18n.language]);

  useEffect(() => {
    if (receiverId) getUnreadNotifications();
    const getNotifications = setInterval(() => getUnreadNotifications(), 5000);
    return () => clearInterval(getNotifications);
  }, [receiverId]);

  useEffect(() => {
    if (!notifications) return;

    const notificationsData = createNotificationItems(notifications);

    setNotifications(notificationsData);
  }, [i18n.language]);

  useEffect(() => {
    getNotificationsList();
  }, [skip]);

  const onSwitchCallback = async (isDropped: boolean) => {
    setNotifications([]);

    if (isDropped) {
      await setSkip(0);
      getNotificationsList();
    }
  };

  return (
    <DropDown
      mobileClassName="notification__dropdown-mobile"
      title={<BellIcon width="20px" height="24px" />}
      titleLabel={unreadNotifications}
      isFetching={isFetching}
      onSwitchCallback={onSwitchCallback}
      items={notificationItems}
      emptyState={t('components.notifications.emptyNotification')}
      maxWidth={widthBreakpoint}
      withArrow={false}
      footer={
        <NotificationsFooter
          className="notifications__footer"
          data={footerData}
        />
      }
      wrapperClassName={unreadNotifications > 999 ? "bigSizeNotification" : (unreadNotifications > 99 ? "normalSizeNotification" : "")}
    />
  );
};

export { Notifications };