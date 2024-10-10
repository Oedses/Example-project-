import React from 'react';
import classnames from 'classnames';
import NumberFormat from 'react-number-format';

import './list-item.scss';
import { BarLabel } from '../../HorizontalStackedBar/BarLabel';
import { getColorForStatus, StatusColor } from '../../Table/table.constants';
import { Status } from '../../../../../../../shared/types/common';

export type ListItemProps = {
  title: string;
  content: string | undefined;
  status?: Status;
  contentClasses?: string;
  isAmount?: boolean;
  isStatus?: boolean;
};

const ListItem = ({ title, content, contentClasses, isAmount, isStatus, status }: ListItemProps) => (
  <span className="list-item">
    <p className="list-item__title">{title}</p>
    {isAmount ? (
      <NumberFormat
        className={classnames("list-item__content", "list-item__amount", contentClasses)}
        value={Number(content)}
        displayType={'text'}
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator='.'
        decimalSeparator=','
        prefix={'€\u00a0'}
      />
    ) : (
      isStatus ? (
        <BarLabel
          item={{
            data: {
              label: content!,
              showAmount: false
            }
          }}
          wrapperClassName={classnames('list-item__label', contentClasses)}
          additionalStyle={{
            labelColor: getColorForStatus(status!.toLowerCase() as keyof typeof StatusColor)
          }}
        />
      ) : (
        <p className={classnames("list-item__content", contentClasses)}>{content}</p>
      )
    )}
  </span>
);

export { ListItem };
