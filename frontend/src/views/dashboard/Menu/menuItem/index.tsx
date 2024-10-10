import React, { ReactNode } from 'react';
import { To } from 'react-router';

import { useMenuItem } from './menuItem.hook';

export type MenuItemProps = {
  children?: ReactNode | ReactNode[];
  path: To | string;
  className?: string;
  icon: ReactNode | JSX.Element;
};

const MenuItem = ({ children, path, className, icon }: MenuItemProps) => {
  const { goToPath, classes } = useMenuItem({ path, className });

  return (
    <div className={classes} onClick={goToPath}>
      <div className="menu__icon-wrapper">{icon}</div>
      {children}
    </div>
  );
};

export { MenuItem };
