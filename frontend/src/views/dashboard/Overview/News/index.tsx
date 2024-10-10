import React from 'react';

import { hoc } from '../../../../utils';

import { ActivityItem } from '../../../components/UI/ActivityItem';
import { Heading } from '../../../components/UI/Heading';

import { useNews } from './news.hook';
import './news.scss';

const News = hoc(useNews, ({ sortedData, dateKeys }) => (
  <section>
    {!dateKeys?.length && (
      <Heading view='accent' active>
        No News yet...
      </Heading>
    )}

    {dateKeys.map((date, index) => (
      <section className='news-block' key={index}>
        <h5 className='news-block__title'>{date}</h5>

        <section key={date}>
          {sortedData[date].map(activity => (
            <ActivityItem
              key={activity.id}
              {...activity}
            />
          ))}
        </section>
      </section>
    ))}
  </section>
));

export { News };