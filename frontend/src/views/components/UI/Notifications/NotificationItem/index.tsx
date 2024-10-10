import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useVisibilityHook } from 'react-observer-api';

import { formatDate } from '../../../../../utils/fn';

import { EntityType } from './../../../../../../../shared/types/notification';

import { NotificationsItem } from '..';

import './../notifications.scss';

type Links = { [key in EntityType]: string };
const links: Links = {
  product: 'products',
  investor: 'investor',
  issuer: 'issuer'
};

const NotificationItem: FC<NotificationsItem> = (
  { displayText, createdAt, isRead, onClick, isLastElement, onVisible, ...props }
) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { setElement, isVisible } = useVisibilityHook();

  const onRedirect = () => navigate(`/${links[props.entityType]}/${props.relatedEntityId}`);

  useEffect(() => {
    if (isLastElement && isVisible && onVisible) onVisible();
  }, [isVisible]);

  return (
    <section className="notifications__item" onClick={onClick} ref={setElement}>
      <div className="notifications__item-content">
        <strong className="notifications__item-title">
          {displayText} &nbsp;

          {props.entityType && props.relatedEntityId ? (
            <a className='notifications__item-link' onClick={onRedirect}>
              {t('components.notifications.more')}
            </a>
          ) : null}
        </strong>

        <time>
          {formatDate(createdAt, true)}
        </time>
      </div>

      {!isRead && <div className="notifications__item-unread"></div>}
    </section>
  );
};

export { NotificationItem };