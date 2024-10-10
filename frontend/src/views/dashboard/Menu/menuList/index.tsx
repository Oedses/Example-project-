import { TFunction } from "react-i18next";

import { MenuItem, MenuItemProps } from "../menuItem";
import './../menu.scss';

export type MenuData = MenuItemProps & { name: string };

export type MenuListProps = {
  menuData: MenuData[];
  t: TFunction<'translation', undefined>;
};

export const MenuList = ({ menuData, t }: MenuListProps) => (
  <div className="menu__items">
    {menuData.map(({ name, ...props }) => (
      <MenuItem key={name} {...props}>
        {t(name)}
      </MenuItem>
    ))}
  </div>
);