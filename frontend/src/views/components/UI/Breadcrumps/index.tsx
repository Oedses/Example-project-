import React, { Fragment } from 'react';
import { useNavigate } from 'react-router';
import classnames from 'classnames';

import { Heading } from '../Heading';

import { useWindowSize } from '../../Hooks/useWindowSize';

import arrowRight from './assets/arrow.svg';
import { ArrowIcon } from '../../icons';

import './breadcrumps.scss';
import UserContext  from '../../../../store/contexts/user-context';

export type BreadcrumpItem = {
  label: string;
  path?: string;
};

type BreaccrumpsProps = {
  items: BreadcrumpItem[]
};

const Breadcrumps = ({ items }: BreaccrumpsProps) => {
  if (!items?.length) {
    return <Fragment></Fragment>;
  }

  if (items.length < 2) {
    return (
      <Heading view="main" active>
        {items[0]}
      </Heading>
    );
  }

  const { data: { role } } = UserContext.useContext();

  const navigate = useNavigate();

  const { width } = useWindowSize();

  const onBackClick = (to: string) => navigate(`/${role}/${to.toLowerCase()}`);

  const isMobileBreadcrumpApply = (index: number) => index === 0 && width! <= 800;

  const breadcrumps = items.map((item, index) => (
    <section
      className={classnames("breadcrump-item", {
        "breadcrump-item__mobile": isMobileBreadcrumpApply(index)
      })}
      key={item.label + index}
    >

      {isMobileBreadcrumpApply(index) && (
        <ArrowIcon width="16px" height="16px" rotate={270} color={'#808080'}/>
      )}

      <Heading
        view="main"
        active={index === items?.length - 1}
        {...(index === 0 && item.path ? { onClick: () => onBackClick(item.path!) } : {})}
      >
        {item.label}
      </Heading>

        {(index < items.length - 1 && width! > 800) && (
          <img src={arrowRight} alt=">" />
        )}
    </section>
  ));

  return (
    <div>
      {breadcrumps}
    </div>
  );

};
export { Breadcrumps };