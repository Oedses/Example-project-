import { useEffect, useLayoutEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import classnames from 'classnames';

import { b2cPolicies } from '../../../authConfig';

import UserContext from '../../../store/contexts/user-context';
import { Locales } from '../../../localization/models';

import { ObjWithKeys, Roles } from '../../../../../shared/types/common';

import { useWindowSize } from '../../components/Hooks/useWindowSize';
import useDevice from '../../components/Hooks/useDevice';
import { DropDownItem } from '../../components/UI/DropDown/DropDownItem';
import {
  CircleOutlineIcon,
  InvestorsIcon,
  LogOutIcon,
  OfficeIcon,
  OverviewIcon,
  PortfolioIcon,
  ProductsIcon,
  ProfileIcon,
  // SettingsIcon,
  TransactionsIcon
} from '../../components/icons';

import {
  fieldsToDeleteOnLogout,
  MAX_ADMIN_MENU_WIDTH,
  MAX_COMPLIANCE_MENU_WIDTH,
  MAX_INVESTOR_MENU_WIDTH,
  MAX_ISSUER_MENU_WIDTH
} from './menu.constants';

import { MenuData } from './menuList';


const investorMenu: MenuData[] = [
  {
    path: '/investor/portfolio',
    className: 'menu__item',
    icon: <PortfolioIcon width='17px' height='16px' />,
    name: 'Portfolio'
  },
  {
    path: '/investor/products',
    className: 'menu__item',
    icon: <ProductsIcon />,
    name: 'menu.nav.products'
  },
];

const adminMenu: MenuData[] = [
  {
    path: '/admin/overview',
    className: 'menu__item',
    icon: <OverviewIcon />,
    name: 'menu.nav.overview'
  },
  {
    path: '/admin/compliances',
    className: 'menu__item',
    icon: <CircleOutlineIcon />,
    name: 'menu.nav.complianceLog'
  },
  {
    path: '/admin/investors',
    className: 'menu__item',
    icon: <InvestorsIcon />,
    name: 'menu.nav.investors'
  },
  {
    path: '/admin/issuers',
    className: 'menu__item',
    icon: <OfficeIcon width='16px' height='16px'/>,
    name: 'menu.nav.issuers'
  },
  {
    path: '/admin/products',
    className: 'menu__item',
    icon: <ProductsIcon />,
    name: 'menu.nav.products'
  },
  {
    path: '/admin/transactions',
    className: 'menu__item',
    icon: <TransactionsIcon />,
    name: 'menu.nav.transactions'
  }
];

const issuerMenu: MenuData[] = [
  {
    path: '/issuer/overview',
    className: 'menu__item',
    icon: <OverviewIcon />,
    name: 'menu.nav.overview'
  },
  {
    path: '/issuer/products',
    className: 'menu__item',
    icon: <ProductsIcon />,
    name: 'menu.nav.products'
  },
  {
    path: '/issuer/transactions',
    className: 'menu__item',
    icon: <TransactionsIcon />,
    name: 'menu.nav.transactions'
  }
];

const complianceMenu: MenuData[] = [
  {
    path: '/compliance/overview',
    className: 'menu__item',
    icon: <OverviewIcon />,
    name: 'menu.nav.overview'
  },
  {
    path: '/compliance/investors',
    className: 'menu__item',
    icon: <InvestorsIcon />,
    name: 'menu.nav.investors'
  },
  {
    path: '/compliance/issuers',
    className: 'menu__item',
    icon: <OfficeIcon width='16px' height='16px'/>,
    name: 'menu.nav.issuers'
  },
  {
    path: '/compliance/products',
    className: 'menu__item',
    icon: <ProductsIcon />,
    name: 'menu.nav.products'
  },
  {
    path: '/compliance/transactions',
    className: 'menu__item',
    icon: <TransactionsIcon />,
    name: 'menu.nav.transactions'
  }
];

export const useMenu = () => {
  const { data: { role, name } } = UserContext.useContext();

  const [isMenuShow, setIsMenuShow] = useState(true);
  const [maxDesktopMenuWidth, setMaxDesktopMenuWidth] = useState(800);
  const [menuItems, setMenuItems] = useState<MenuData[]>(investorMenu);

  const [menuClasses, setMenuClasses] = useState('');
  const [menuContentClassNames, setMenuContentClassNames] = useState('');
  const [burgerClasses, setBurgerClasses] = useState('');
  const [menuDropdownClasses, setMenuDropdownClasses] = useState('');

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { width } = useWindowSize();

  const { device } = useDevice();

  const location = useLocation();

  const { instance } = useMsal();

  const logout = () => {
    fieldsToDeleteOnLogout.forEach(field => localStorage.removeItem(field));

    instance.logout(b2cPolicies.authorities.signUpSignIn);
  };

  const changeLanguage = () => {
    const newLanguage = i18n.language === Locales.en ? Locales.nl : Locales.en;
    i18n.changeLanguage(newLanguage);

    // reserved case when re-login
    localStorage.setItem('langcode', newLanguage);
  };

  const onToggleMenu = () => setIsMenuShow(show => !show);

  const onLogoClick = () => {
    navigate('/');
  };

  const onBlur = () => setIsMenuShow(false);

  type DropDownTitles = {
    title: string,
    onClick: () => void,
    icon: JSX.Element,
    roles: Roles[],
  };

  const dropDownTitles: ObjWithKeys<DropDownTitles> = {
    profile: {
      title: "menu.profile",
      onClick: () => navigate('/myAccount'),
      icon: <ProfileIcon />,
      roles: Object.values(Roles)
    },
    // settings: {
    //   title: "menu.settings",
    //   onClick: () => null,
    //   icon: <SettingsIcon />,
    //   roles: [Roles.admin]
    // },
    changeLanguage: {
      title: "menu.changeLanguage",
      onClick: changeLanguage,
      icon: <TransactionsIcon />,
      roles: Object.values(Roles)
    },
    logout: {
      title: "menu.logout",
      onClick: logout,
      icon: <LogOutIcon />,
      roles: Object.values(Roles)
    },
  };

  const dropDownItems: JSX.Element[] = Object.entries(dropDownTitles)
    .filter(([key, value]) => value.roles.includes(role) || key === 'logout')
    .map(([key, value]) => (
      <DropDownItem
        key={key}
        title={t(value.title)}
        onClick={value.onClick}
        leftAddon={value.icon}
      />
    ));

  useEffect(() => {
    setMenuClasses(classnames('menu', {
      'menu__mobile': width! <= maxDesktopMenuWidth
    }));

    setMenuContentClassNames(classnames('menu__content', {
      'menu__content-mobile': width! <= maxDesktopMenuWidth,
      'menu__content-mobile__shown': (width! <= maxDesktopMenuWidth && isMenuShow)
    }));

    setBurgerClasses(classnames('menu__content-burger', {
      'menu__content-burger__active': isMenuShow
    }));

    setMenuDropdownClasses(width! < maxDesktopMenuWidth ? 'menu__dropdown-mobile' : '');
  }, [width, device, isMenuShow, maxDesktopMenuWidth]);

  useLayoutEffect(() => {
    if (width! <= maxDesktopMenuWidth) setIsMenuShow(false);
  }, [width, maxDesktopMenuWidth, device]);

  useLayoutEffect(() => {
    if (width! <= maxDesktopMenuWidth && isMenuShow) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuShow, width, maxDesktopMenuWidth, device]);

  useLayoutEffect(() => {
    switch (role) {
      case Roles.investor:
        setMaxDesktopMenuWidth(MAX_INVESTOR_MENU_WIDTH);
        setMenuItems(investorMenu);
        break;
      case Roles.admin:
        setMaxDesktopMenuWidth(MAX_ADMIN_MENU_WIDTH);
        setMenuItems(adminMenu);
        break;
      case Roles.issuer:
        setMaxDesktopMenuWidth(MAX_ISSUER_MENU_WIDTH);
        setMenuItems(issuerMenu);
        break;
      case Roles.compliance:
        setMaxDesktopMenuWidth(MAX_COMPLIANCE_MENU_WIDTH);
        setMenuItems(complianceMenu);
        break;
      default:
        setMaxDesktopMenuWidth(MAX_INVESTOR_MENU_WIDTH);
        setMenuItems(investorMenu);
    }
  }, [role]);


  return {
    t,
    location,
    width,
    name,
    maxDesktopMenuWidth,
    logout,
    menuItems,
    menuClasses,
    menuContentClassNames,
    menuDropdownClasses,
    onToggleMenu,
    burgerClasses,
    onLogoClick,
    dropDownItems,
    onBlur
  };
};
