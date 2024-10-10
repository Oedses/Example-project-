import React from 'react';
import { useNavigate } from 'react-router';

import { NewsIcon } from '../../icons';

import './activity-item.scss';

type ActivityItemProps = {
  title: string;
  content: string;
  id?: string | number;
};

const ActivityItem = ({ title, content, id }: ActivityItemProps) => {
  const navigate = useNavigate();

  const onReadMoreClick = () => {
    navigate(`/news${id ? `/${id}` : `` }`);
  };

  return (
    <article className='activity-item'>
      <div className='activity-item__icon'>
        <NewsIcon width="16px" height="16px"/>
      </div>

      <div className='activity-item__content'>
        <h4 className='activity-item__title mock'>
          {title}
        </h4>

        <p className="activity-item__desc">
          {content}
        </p>

        <a
          className="activity-item__more"
          onClick={onReadMoreClick}
          href=""
         >
          Read more
        </a>
      </div>
    </article>
  );
};

export { ActivityItem };