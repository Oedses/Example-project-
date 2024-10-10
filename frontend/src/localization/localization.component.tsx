// @ts-nocheck
import { useContext, createContext, FC } from 'react';

import { I18nextProvider, useTranslation } from 'react-i18next';
import i18next from 'i18next';

import { rtlLanguages, Direction } from './models';

const Context = createContext({
  direction: 'ltr'
});

const { Provider } = Context;

const DirectionProvider: FC = ({ children }) => {
  const { i18n } = useTranslation();
  const isRtl = rtlLanguages[i18n.language];
  const direction = isRtl ? Direction.rtl : Direction.ltr;

  return (
    <div className={`direction-${direction}`}>
      <Provider value={{ direction }}>{children}</Provider>
    </div>
  );
};

const useDirection = () => {
  const { direction } = useContext(Context);

  return direction;
};

const Localization: FC = ({ children }) => (
  <I18nextProvider i18n={i18next}>
    <DirectionProvider>{children}</DirectionProvider>
  </I18nextProvider>
);

export { Localization, useDirection };
