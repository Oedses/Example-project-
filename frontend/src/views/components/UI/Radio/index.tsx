import React from 'react';
import classNames from 'classnames';

import './radio.scss';
import { RadioProps } from './radio.props';

const Radio = ({
  items,
  label,
  inputProps,
  className,
  value
}: RadioProps) => {
  const classes = classNames('radio', className, {
  });

  const radioContainerClasses = (itemValue: string) => classNames('radio__container text', {
    radio__container_active: value === itemValue,
    radio__container_disabled: inputProps?.disabled
  });

  return (
    <div className={classes}>
      {label && <label className="radio__label label">{label}</label>}
      <div className="radio__inputs-wrapper">
        {items.map(({ label: itemLabel, value: itemValue }, index) => (
          <label
            key={index}
            className={radioContainerClasses(itemValue)}
          >
            {itemLabel}
            <input
              {...inputProps}
              className="radio__input"
              type="radio"
              checked={value === itemValue}
              value={itemValue}
            />
            <span
              className={classNames('radio__checkmark', {
                radio__checkmark_disabled: inputProps?.disabled
              })}
            ></span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Radio;
