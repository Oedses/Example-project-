import React from 'react';

import { hoc } from '../../../utils';

import { Logo } from '../../components/icons';
import { DropDown } from '../../components/UI/DropDown';
import { Notifications } from '../../components/UI/Notifications';

import { useMenu } from './menu.hook';
import './menu.scss';

import { MenuList } from './menuList';

const Menu = hoc(useMenu, ({
  t,
  location,
  width,
  name,
  maxDesktopMenuWidth,
  menuItems,
  menuClasses,
  menuContentClassNames,
  onToggleMenu,
  burgerClasses,
  onLogoClick,
  dropDownItems,
  menuDropdownClasses
}) =>
  location.pathname !== '/signup' ? (
    <div className={menuClasses}>
      <div className={menuContentClassNames}>
        <div className="menu__content-logo">
          <Logo width="192px" height="86px" onClick={onLogoClick} />
        </div>

        {width! <= maxDesktopMenuWidth && (
          <div className={burgerClasses} onClick={onToggleMenu}>
            <span></span>
          </div>
        )}

        <section className='menu__content-actions' onClick={onToggleMenu} >
          <MenuList menuData={menuItems} t={t} />


          <DropDown
            title={name}
            items={dropDownItems}
            maxWidth={maxDesktopMenuWidth}
            withArrow
            emptyState=''
            wrapperClassName={menuDropdownClasses}
          />

          <section>
            <Notifications widthBreakpoint={maxDesktopMenuWidth}/>
          </section>
        </section>

      </div>
    </div>
  ) : null
);

export default Menu;
