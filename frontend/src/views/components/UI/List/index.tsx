import React from 'react';
import classnames from 'classnames';

import { ListItem, ListItemProps } from './ListItem';

import './list.scss';
import { Badge } from '../Badge';

export type ListProps = {
  items: ListItemProps[];
  type: 'horizontal' | 'vertical';
  withBadges?: boolean;
  badgesValues?: (number | null)[];
};

const List = ({ items, type, withBadges, badgesValues }: ListProps) => (
  <ul className={
    classnames('list', {
      'list-horizontal': type === 'horizontal',
      'list-vertical': type === 'vertical',
      'list-aligned': items?.length >= 3
    })
  }>
    {items.map((itemProps, index) => (
      Boolean(Object.keys(itemProps).length && itemProps.content) && (
        <li key={itemProps.title + index}>
          <ListItem {...itemProps} />

          {withBadges && badgesValues && (
            <Badge percents={badgesValues[index]} />
          )}
        </li>
      )
    ))}
  </ul>
);

export { List };