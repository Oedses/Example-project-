import React, { FC } from 'react';
import classnames from 'classnames';

import './heading.scss';

type HeadingProps = {
  active: boolean;
  className?: string,
  view: 'main' | 'secondary' | 'accent';
  onClick?: () => void
};

const Heading: FC<HeadingProps> = ({ children, active, view, className, onClick }) => (
  <h2
  className={
    classnames("content__heading", {
      [className!]: Boolean(className),
      "content__heading-active": active,
      "content__heading-main": view === 'main',
      "content__heading-secondary": view === 'secondary',
      "content__heading-accent": view === 'accent'
    })}
    onClick={onClick || null as any}
  >{children}</h2>
);

export { Heading };
