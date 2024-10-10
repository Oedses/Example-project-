import React from 'react';

export type DropDownItemProps = {
  title: string;
  subtitle?: string;
  leftAddon?: JSX.Element;
  onClick?: () => void;
};

const DropDownItem = ({ title, subtitle, leftAddon, onClick }: DropDownItemProps) => (
  <section className="dropdown__item" onClick={onClick} data-test="dropdown-item">

    { leftAddon ? (
      <div className="dropdown__item-icon">
        {leftAddon}
      </div>
    ) : null }
    <div className="dropdown__item-content">
      <h6>{title}</h6>

      {subtitle ? <p>{ subtitle }</p> : null }
    </div>

  </section>
);

export { DropDownItem };