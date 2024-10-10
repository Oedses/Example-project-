// @ts-nocheck
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { Locales } from '../models';

const init = () => {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: require('../languages/en.json')
        },
        nl: {
          translation: require('../languages/nl.json')
        }
      },
      lng: localStorage.getItem('langcode') || Locales.en,
      fallbackLng: Locales.en,
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: true
      }
    });
};

export { init };
