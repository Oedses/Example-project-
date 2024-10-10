import React from 'react';
import classNames from 'classnames';

import { ButtonProps, ButtonSize, ButtonView } from './button.props';
import './button.scss';

const Button = ({
  children,
  onClick,
  disabled,
  fullWidth,
  className,
  size = ButtonSize.middle,
  view = ButtonView.primary
}: ButtonProps) => {
  const classname = classNames('button', className, {
    [`button_${view}`]: Boolean(view),
    button_small: size === ButtonSize.small,
    'button_full-width': fullWidth,
    button_disabled: disabled,
  });

  return (
    <button className={classname} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
