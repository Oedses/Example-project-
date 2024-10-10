import React, { FC } from 'react';
import classnames from 'classnames';

import './section.scss';

type SectionProps = {
  className: string
};

const Section: FC<SectionProps> = ({ children, className }) => (
  <section className={classnames(
    "section", className
  )}>
    {children}
  </section>
);

export { Section };