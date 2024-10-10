import classNames from 'classnames';
import { To, useNavigate } from 'react-router-dom';

import { MenuItemProps } from '.';

export const useMenuItem = ({ path, className }: Partial<MenuItemProps>) => {
  const navigate = useNavigate();

  const goToPath = () => navigate(path as To);

  const isActive = window.location.pathname === path;

  const classes = classNames(className, { menu__item_active: isActive });

  return {
    goToPath,
    classes
  };
};
