export const rtlLanguages = [];

export enum Direction {
  ltr = 'ltr',
  rtl = 'rtl'
}

export enum Locales {
  en = 'en',
  nl = 'nl'
}

export type Locale = keyof typeof Locales;
