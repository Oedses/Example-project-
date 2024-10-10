import React from 'react';
import classnames from 'classnames';

import { ArrowIcon } from '../../icons';

import './badge.scss';

type BadgeProps = {
  percents: number | null;
};

const Badge = ({ percents }: BadgeProps) => {
  const badgeIconColor = percents && percents > 0 ? '#28A745' : '#CC3300';

  const badgeIconRotate = percents && percents > 0 ? 0 : 180;
  return (
    <div className='badge'>
      <span className='badge__icon'>
        {percents ? (
          <ArrowIcon
            rotate={badgeIconRotate}
            color={badgeIconColor}
          />
          ) : (
          <span className='badge__zero'/>
        )}
      </span>

      {percents ? (
        <span className={classnames('badge__content', {
          'badge__increment': percents > 0,
          'badge__decrement': percents < 0
        })}>
          {percents}%
        </span>
      ) : (
        <span className='badge__content'>
          {percents === 0 ? '0' : '--'}
        </span>
      )}
    </div>
  );
};

export { Badge };